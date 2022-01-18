import * as Sentry from '@sentry/vue';
import { addABI, decodeMethod } from 'abi-decoder';
import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';

import { getPriceByAddress, NetworkAliase } from '@/services/coingecko/tokens';
import { Explorer } from '@/services/explorer';
import { isError } from '@/services/responses';
import store from '@/store/index';
import { sameAddress } from '@/utils/address';
import { fromWei } from '@/utils/bigmath';
import { MAX_ASSET_NAME } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';
import { getEthAssetData, getMoveAssetData } from '@/wallet/references/data';
import {
  Token,
  TokenWithBalance,
  Transaction,
  TransactionTypes
} from '@/wallet/types';

import { getMoverTransactionsTypes } from '../mover/transactions/service';
import { TransactionMoveTypeData } from '../mover/transactions/types';
import {
  Erc20TokenMetadata,
  Erc20TokensResponse,
  Erc20Transaction,
  Erc20TransactionResponse,
  NativeBalanceResponse,
  NativeTransaction,
  NativeTransactionResponse
} from './responses';

export class MoralisExplorer implements Explorer {
  readonly name: string = 'Moralis';
  readonly apiURL: string = 'https://deep-index.moralis.io/api/v2/';
  private readonly apiClient: AxiosInstance;

  private static readonly erc20AbiApprove = [
    {
      constant: false,
      inputs: [
        {
          name: '_spender',
          type: 'address'
        },
        {
          name: '_value',
          type: 'uint256'
        }
      ],
      name: 'approve',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];

  constructor(
    private readonly accountAddress: string,
    private readonly nativeCurrency: string,
    private readonly network: Network,
    apiKey: string,
    private readonly setTransactions: (txns: Array<Transaction>) => void,
    private readonly setIsTransactionsListLoaded: (val: boolean) => void,
    private readonly setTokens: (tokens: Array<TokenWithBalance>) => void,
    private readonly setChartData: (
      chartData: Record<string, Array<[number, number]>>
    ) => void
  ) {
    this.apiClient = axios.create({
      baseURL: this.apiURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    });
    addABI(MoralisExplorer.erc20AbiApprove);
  }

  async init(): Promise<void> {
    this.setIsTransactionsListLoaded(false);
    await this.refreshWalletData();
  }

  public async refreshWalletData(): Promise<void> {
    const tokensWithPricePromise = this.getErc20Tokens().then((tokens) =>
      this.enrichTokensWithPrices(tokens)
    );
    const erc20TransactionsPromise = this.getErc20Transactions();
    const nativeTransactionsPromise = this.getNativeTransactions();

    const [tokensWithPrices, erc20Transactions, nativeTransactions] =
      await Promise.all([
        tokensWithPricePromise,
        erc20TransactionsPromise,
        nativeTransactionsPromise
      ]);

    const tokensWihNativePromise =
      this.enrichTokensWithNative(tokensWithPrices);
    const transactionsPromise = this.parseTransactions(
      tokensWithPrices,
      erc20Transactions,
      nativeTransactions
    );

    const [tokensWihNative, transactions] = await Promise.all([
      tokensWihNativePromise,
      transactionsPromise
    ]);
    this.setTokens(tokensWihNative);
    this.setTransactions(transactions);
    this.setIsTransactionsListLoaded(true);
  }

  public getChartData = (
    assetCode: string,
    nativeCurrency: string,
    chartTypes: string
  ): void => {
    console.log('Not implemented yet');
  };

  private getNetworkAlias(): NetworkAliase {
    switch (this.network) {
      case Network.mainnet:
        return NetworkAliase.Eth;
      case Network.binance:
        return NetworkAliase.Bsc;
      case Network.binanceTest:
        return NetworkAliase.BscTestnet;
      case Network.kovan:
        return NetworkAliase.Koven;
      case Network.rinkeby:
        return NetworkAliase.Rinkeby;
      case Network.ropsten:
        return NetworkAliase.Ropsten;
      default:
        throw new Error(`Moralis doesn't have alias for ${this.network}`);
    }
  }

  private enrichTokensWithPrices = async (
    tokens: TokenWithBalance[]
  ): Promise<TokenWithBalance[]> => {
    const addresses = tokens.map((t) => t.address);
    const pricesResponse = await getPriceByAddress('ethereum', addresses, [
      this.nativeCurrency
    ]);
    if (pricesResponse.isError) {
      Sentry.captureMessage(
        `Can't get token prices from coingecko: ${pricesResponse.error}`
      );
      return tokens;
    }

    return tokens.map((t) => ({
      ...t,
      priceUSD: pricesResponse.result?.[t.address]?.[this.nativeCurrency]
        ? String(pricesResponse.result?.[t.address]?.[this.nativeCurrency])
        : t.priceUSD
    }));
  };

  private enrichTokensWithNative = async (
    tokens: TokenWithBalance[]
  ): Promise<TokenWithBalance[]> => {
    try {
      const nativeBalance = await this.getNativeBalance();
      const ethData = getEthAssetData();
      return [
        ...tokens,
        {
          address: ethData.address,
          balance: nativeBalance,
          priceUSD: store.getters['account/ethPrice'],
          marketCap: store.getters['account/getTokenMarketCap'](
            ethData.address
          ),
          decimals: ethData.decimals,
          logo: ethData.iconURL,
          name: ethData.name,
          symbol: ethData.symbol,
          color: store.getters['account/getTokenColor'](ethData.address)
        }
      ];
    } catch (err) {
      Sentry.captureMessage(`Can't get enrich token list with native: ${err}`);
      return tokens;
    }
  };

  private getNativeBalance = async (): Promise<string> => {
    try {
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}/balance?chain=${this.getNetworkAlias()}`
        )
      ).data as NativeBalanceResponse;
      return fromWei(res.balance, 18);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(
          `Can't get native balance from Moralis, response: ${e.toJSON()}`
        );
      }
      throw new Error(`Can't get native balance from Moralis: ${String(e)}`);
    }
  };

  private getErc20Tokens = async (): Promise<TokenWithBalance[]> => {
    try {
      const moverData = getMoveAssetData(this.network);
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}/erc20?chain=${this.getNetworkAlias()}`
        )
      ).data as Erc20TokensResponse[];
      return res.map((t) => {
        let assetName = '';
        let assetSymbol = '';
        let assetLogo = '';

        if (sameAddress(t.token_address, moverData.address)) {
          assetName = moverData.name;
          assetSymbol = moverData.symbol;
          assetLogo = moverData.iconURL;
        } else {
          assetName = t.name;
          if (assetName.length > MAX_ASSET_NAME) {
            assetName = assetName.substring(0, MAX_ASSET_NAME);
          }
          assetSymbol = t.symbol;
          assetLogo = t.logo ?? '';
        }

        if (assetSymbol === 'mobo') {
          assetSymbol = 'MOBO';
        }

        return {
          address: t.token_address,
          balance: fromWei(t.balance, t.decimals),
          decimals: parseInt(t.decimals),
          logo: assetLogo,
          marketCap: store.getters['account/getTokenMarketCap'](
            t.token_address
          ),
          name: assetName,
          priceUSD: '0',
          symbol: assetSymbol
        };
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(
          `Can't get erc20 tokens from Moralis, response: ${e.toJSON()}`
        );
      }
      throw new Error(`Can't get erc20 tokens from Moralis: ${String(e)}`);
    }
  };

  private parseTransactions = async (
    walletTokens: Array<Token>,
    erc20Transactions: Array<Erc20Transaction>,
    nativeTransactions: Array<NativeTransaction>
  ): Promise<Transaction[]> => {
    const ethData = getEthAssetData();

    const allTransactionsHashes = [
      ...erc20Transactions.map((t) => t.transaction_hash),
      ...nativeTransactions.map((t) => t.hash)
    ];

    let moverTypesData: TransactionMoveTypeData[] = [];
    const moverTypesDataRes = await getMoverTransactionsTypes(
      allTransactionsHashes
    );
    if (isError<TransactionMoveTypeData[], string, void>(moverTypesDataRes)) {
      console.error(
        'Error from mover transaction service',
        moverTypesDataRes.error
      );
    } else {
      moverTypesData = moverTypesDataRes.result;
    }

    // TODO: probably we have to get unkown tokens from Moralis by request
    // const unknownTokens = erc20Transactions.reduce<string[]>((acc, txn) => {
    //   const token: Token | undefined = store.getters[
    //     'account/getTokenFromMapByAddress'
    //   ](txn.address);
    //   if (token === undefined) {
    //     acc.push(txn.address);
    //   }
    //   return acc;
    // }, []);

    const nativeParsedTransactions = nativeTransactions.reduce<Transaction[]>(
      (acc, txn) => {
        if (txn.input === '0x') {
          // assume this is an eth transfer transaction
          const direction = sameAddress(txn.to_address, this.accountAddress)
            ? sameAddress(txn.from_address, this.accountAddress)
              ? 'self'
              : 'in'
            : 'out';

          acc.push({
            asset: {
              address: ethData.address,
              decimals: ethData.decimals,
              symbol: ethData.symbol,
              change: txn.value,
              iconURL: ethData.iconURL,
              price: store.getters['account/ethPrice'],
              direction: direction
            },
            blockNumber: txn.block_number,
            hash: txn.hash,
            uniqHash: txn.hash,
            from: txn.from_address,
            nonce: txn.nonce,
            to: txn.to_address,
            timestamp: dayjs(txn.block_timestamp).unix(),
            type: TransactionTypes.transferERC20,
            fee: { ethPrice: '0', feeInWEI: '0' },
            status: 'confirmed',
            isOffchain: false,
            moverType:
              moverTypesData.find((t) => t.txID === txn.hash)?.moverTypes ??
              'unknown'
          });
        } else {
          const method = decodeMethod(txn.input);
          if (method?.name === 'approve') {
            let token: Token | undefined = walletTokens.find((t) =>
              sameAddress(t.address, txn.to_address)
            );

            if (token === undefined) {
              token = store.state?.account?.tokenInfoMap?.[txn.to_address];
              if (token === undefined) {
                return acc;
              }
            }

            acc.push({
              asset: {
                address: token.address,
                decimals: token.decimals,
                symbol: token.symbol,
                iconURL: token.logo
              },
              blockNumber: txn.block_number,
              hash: txn.hash,
              uniqHash: txn.hash,
              nonce: txn.nonce,
              timestamp: dayjs(txn.block_timestamp).unix(),
              type: TransactionTypes.approvalERC20,
              fee: { ethPrice: '0', feeInWEI: '0' },
              status: 'confirmed',
              isOffchain: false,
              moverType:
                moverTypesData.find((t) => t.txID === txn.hash)?.moverTypes ??
                'unknown'
            });
          }
        }
        return acc;
      },
      [] as Transaction[]
    );

    const addressesOfTokensWithoutPrices: Array<string> = [];
    let erc20ParsedTransactions = erc20Transactions.reduce<Transaction[]>(
      (acc, txn) => {
        let token: Token | undefined = walletTokens.find((t) =>
          sameAddress(t.address, txn.address)
        );

        if (token === undefined) {
          token = store.state?.account?.tokenInfoMap?.[txn.to_address];
          if (token === undefined) {
            return acc;
          }
          addressesOfTokensWithoutPrices.push(token.address);
        }

        let isSwapTransaction = false;
        if (
          erc20Transactions.filter(
            (t) => t.transaction_hash === txn.transaction_hash
          ).length > 1
        ) {
          isSwapTransaction = true;
        }

        const direction = sameAddress(txn.to_address, this.accountAddress)
          ? sameAddress(txn.from_address, this.accountAddress)
            ? 'self'
            : 'in'
          : 'out';

        acc.push({
          asset: {
            address: token.address,
            decimals: token.decimals,
            symbol: token.symbol,
            change: txn.value,
            iconURL: token.logo,
            price: token.priceUSD === '' ? '0' : token.priceUSD,
            direction: direction
          },
          blockNumber: txn.block_number,
          hash: txn.transaction_hash,
          uniqHash: isSwapTransaction
            ? direction === 'in'
              ? `${txn.transaction_hash}-1`
              : `${txn.transaction_hash}-0`
            : txn.transaction_hash,
          from: txn.from_address,
          nonce: '0',
          to: txn.to_address,
          timestamp: dayjs(txn.block_timestamp).unix(),
          type: isSwapTransaction
            ? direction === 'in'
              ? TransactionTypes.transferERC20
              : TransactionTypes.swapERC20
            : TransactionTypes.transferERC20,
          fee: { ethPrice: '0', feeInWEI: '0' },
          status: 'confirmed',
          isOffchain: false,
          moverType:
            moverTypesData.find((t) => t.txID === txn.transaction_hash)
              ?.moverTypes ?? 'unknown'
        });

        return acc;
      },
      [] as Transaction[]
    );

    const uniqueAddressesOfTokensWithoutPrices = [
      ...new Set(addressesOfTokensWithoutPrices)
    ];

    if (uniqueAddressesOfTokensWithoutPrices.length > 0) {
      const pricesResponse = await getPriceByAddress(
        'ethereum',
        uniqueAddressesOfTokensWithoutPrices,
        [this.nativeCurrency]
      );
      if (pricesResponse.isError) {
        Sentry.captureMessage(
          `Can't get token prices from coingecko: for additional transaction tokens ${pricesResponse.error}`
        );
      } else {
        erc20ParsedTransactions = erc20ParsedTransactions.map((txn) => {
          if ('asset' in txn && txn.asset !== undefined) {
            const loadedPrice =
              pricesResponse.result?.[txn.asset.address]?.[this.nativeCurrency];
            if (loadedPrice && 'price' in txn.asset) {
              return {
                ...txn,
                asset: {
                  ...txn.asset,
                  price: String(loadedPrice)
                }
              };
            }
          }
          return txn;
        });
      }
    }

    const allParsedTransactions = [
      ...erc20ParsedTransactions,
      ...nativeParsedTransactions
    ];

    return allParsedTransactions;
  };

  private getErc20TokensMetadata = async (
    addresses: string[]
  ): Promise<Token[]> => {
    try {
      const res = (
        await this.apiClient.get(`${this.accountAddress}/erc20/metadata}`, {
          params: {
            chain: this.getNetworkAlias(),
            storeIds: addresses
          }
        })
      ).data as Erc20TokenMetadata[];
      return res.map((t) => ({
        address: t.address,
        decimals: parseInt(t.decimals),
        logo: t.logo ?? '',
        marketCap: 0,
        name: t.name,
        priceUSD: '0',
        symbol: t.symbol
      }));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(
          `Can't get erc20 tokens metadata from Moralis, response: ${e.toJSON()}`
        );
      }
      throw new Error(
        `Can't get erc20 tokens metadata from Moralis: ${String(e)}`
      );
    }
  };

  private getErc20Transactions = async (): Promise<Erc20Transaction[]> => {
    try {
      const res = (
        await this.apiClient.get(
          `${
            this.accountAddress
          }/erc20/transfers?chain=${this.getNetworkAlias()}`
        )
      ).data as Erc20TransactionResponse;
      return res.result;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(
          `Can't get erc20 transactions from Moralis, response: ${e.toJSON()}`
        );
      }
      throw new Error(
        `Can't get erc20 transactions from Moralis: ${String(e)}`
      );
    }
  };

  private getNativeTransactions = async (): Promise<NativeTransaction[]> => {
    try {
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}?chain=${this.getNetworkAlias()}`
        )
      ).data as NativeTransactionResponse;
      return res.result;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(
          `Can't get native transactions from Moralis, response: ${e.toJSON()}`
        );
      }
      throw new Error(
        `Can't get native transactions from Moralis: ${String(e)}`
      );
    }
  };
}
