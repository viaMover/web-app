import * as Sentry from '@sentry/vue';
import { addABI, decodeMethod } from 'abi-decoder';
import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import Web3 from 'web3';

import { Explorer } from '@/services/explorer';
import { NetworkAlias } from '@/services/moralis/types';
import { isError } from '@/services/responses';
import { getAssetPriceFromPriceRecord } from '@/services/v2/utils/price';
import store from '@/store/index';
import { NativeCurrency, PriceRecord } from '@/store/modules/account/types';
import { sameAddress } from '@/utils/address';
import { fromWei } from '@/utils/bigmath';
import { MAX_ASSET_NAME } from '@/utils/consts';
import { getNetwork, Network } from '@/utils/networkTypes';
import { getBaseAssetData, getMoveAssetData } from '@/wallet/references/data';
import {
  Token,
  TokenWithBalance,
  Transaction,
  TransactionTypes
} from '@/wallet/types';

import { getMoverTransactionsTypes } from '../mover/transactions/service';
import { TransactionMoveTypeData } from '../mover/transactions/types';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '../v2/utils/sentry';
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
  private static readonly TRANSACTIONS_PER_BATCH = 25;

  private transactionsOffset: Record<Network, number> = {
    [Network.mainnet]: 0,
    [Network.arbitrum]: 0,
    [Network.avalanche]: 0,
    [Network.binance]: 0,
    [Network.binanceTest]: 0,
    [Network.celo]: 0,
    [Network.fantom]: 0,
    [Network.kovan]: 0,
    [Network.optimism]: 0,
    [Network.polygon]: 0,
    [Network.rinkeby]: 0,
    [Network.ropsten]: 0
  };

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

  private readonly networks: Array<Network> = [];

  constructor(
    private readonly accountAddress: string,
    private readonly nativeCurrency: NativeCurrency,
    currentNetwork: Network,
    networks: Array<Network>,
    apiKey: string,
    private readonly setTransactions: (txns: Array<Transaction>) => void,
    private readonly updateTransactions: (txns: Array<Transaction>) => void,
    private readonly setIsTransactionsListLoaded: (val: boolean) => void,
    private readonly setTokens: (tokens: Array<TokenWithBalance>) => void,
    private readonly updateTokens: (tokens: Array<TokenWithBalance>) => void,
    private readonly setIsTokensListLoaded: (val: boolean) => void,
    private readonly setChartData: (
      chartData: Record<string, Array<[number, number]>>
    ) => void,
    private readonly fetchTokensPriceByContractAddresses: (
      addresses: Array<string>,
      nativeCurrency: NativeCurrency,
      network: Network
    ) => Promise<PriceRecord>,
    private readonly localTokens: Record<Network, Array<Token>>
  ) {
    this.apiClient = axios.create({
      baseURL: this.apiURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    });
    addABI(MoralisExplorer.erc20AbiApprove);
    this.networks = networks
      .slice()
      .sort((a) => (a === currentNetwork ? -1 : +1));
  }

  async init(): Promise<void> {
    this.setIsTransactionsListLoaded(false);
    this.setTokens([]);
    await this.refreshWalletData();
  }

  public hasInfiniteLoader(): boolean {
    return true;
  }

  public async refreshWalletData(): Promise<void> {
    try {
      this.setIsTransactionsListLoaded(false);
      const tokensFromCurrentNetworkWithPricePromise: Promise<
        Array<TokenWithBalance>
      > = Promise.resolve([]);

      for (let i = 0; i < this.networks.length; i++) {
        const network = this.networks[i];
        const tokensWithPricePromise = this.getErc20Tokens(network)
          .then((tokens) => this.mergeTokensWithLocalTokens(tokens, network))
          .then((tokens) => this.mapTokensToChecksumAddresses(tokens, network))
          .then((tokens) => this.enrichTokensWithPrices(tokens, network))
          .then((tokens) => this.enrichTokensWithNative(tokens, network))
          .then((tokensWithNative) => {
            this.updateTokens(tokensWithNative);
            // set tokens list loaded as early as possible
            this.setIsTokensListLoaded(true);
            return tokensWithNative;
          });

        const erc20TransactionsPromise = this.getErc20Transactions(
          network,
          MoralisExplorer.TRANSACTIONS_PER_BATCH,
          0
        );
        const nativeTransactionsPromise = this.getNativeTransactions(
          network,
          MoralisExplorer.TRANSACTIONS_PER_BATCH,
          0
        );

        const [tokensWithPrices, erc20Transactions, nativeTransactions] =
          await Promise.all([
            tokensWithPricePromise,
            erc20TransactionsPromise,
            nativeTransactionsPromise
          ]);

        const transactions = await this.parseTransactions(
          tokensWithPrices,
          erc20Transactions,
          nativeTransactions,
          network
        );
        this.updateTransactions(transactions);
        this.setIsTransactionsListLoaded(true);
        this.transactionsOffset[network] =
          MoralisExplorer.TRANSACTIONS_PER_BATCH;
      }
    } finally {
      this.setIsTokensListLoaded(true);
      this.setIsTransactionsListLoaded(true);
    }
  }

  public async loadMoreTransactions(): Promise<boolean> {
    let hasMore = false;

    try {
      this.setIsTransactionsListLoaded(false);
      for (let i = 0; i < this.networks.length; i++) {
        const network = this.networks[i];
        const res = await this.loadMoreTransactionsForNetwork(network);
        if (res) {
          hasMore = true;
        }
      }
    } finally {
      this.setIsTransactionsListLoaded(true);
    }

    return hasMore;
  }

  private async loadMoreTransactionsForNetwork(
    network: Network,
    nativeOnly = false
  ): Promise<boolean> {
    try {
      this.setIsTransactionsListLoaded(false);

      const offset = this.transactionsOffset[network];

      let erc20TransactionsPromise = Promise.resolve<Array<Erc20Transaction>>(
        []
      );
      if (!nativeOnly) {
        erc20TransactionsPromise = this.getErc20Transactions(
          network,
          MoralisExplorer.TRANSACTIONS_PER_BATCH,
          offset
        );
      }
      const nativeTransactionsPromise = this.getNativeTransactions(
        network,
        MoralisExplorer.TRANSACTIONS_PER_BATCH,
        offset
      );

      const [erc20Transactions, nativeTransactions] = await Promise.all([
        erc20TransactionsPromise,
        nativeTransactionsPromise
      ]);

      if (erc20Transactions.length === 0 && nativeTransactions.length === 0) {
        return false;
      }

      const transactions = await this.parseTransactions(
        this.localTokens[network],
        erc20Transactions,
        nativeTransactions,
        network
      );

      if (transactions.length === 0) {
        // after txns mapping, we didn't get the ones we needed
        // it happens only for native txns
        // so we have to make a query again only for native
        this.transactionsOffset[network] =
          offset + MoralisExplorer.TRANSACTIONS_PER_BATCH;
        return await this.loadMoreTransactionsForNetwork(network, true);
      } else {
        this.updateTransactions(transactions);
        this.transactionsOffset[network] =
          offset + MoralisExplorer.TRANSACTIONS_PER_BATCH;
      }
    } catch (error) {
      addSentryBreadcrumb({
        message: 'Request to transactions was failed',
        category: 'Moralis explorer',
        data: {
          network: network
        }
      });
      captureSentryException(error);
    }

    return true;
  }

  public getChartData = (
    assetCode: string,
    nativeCurrency: string,
    chartsType: string
  ): void => {
    console.log('Not implemented yet');
  };

  private getNetworkAlias(network: Network): NetworkAlias {
    switch (network) {
      case Network.mainnet:
        return NetworkAlias.Eth;
      case Network.binance:
        return NetworkAlias.Bsc;
      case Network.binanceTest:
        return NetworkAlias.BscTestnet;
      case Network.kovan:
        return NetworkAlias.Koven;
      case Network.rinkeby:
        return NetworkAlias.Rinkeby;
      case Network.ropsten:
        return NetworkAlias.Ropsten;
      case Network.avalanche:
        return NetworkAlias.Avalanche;
      case Network.fantom:
        return NetworkAlias.Fantom;
      case Network.polygon:
        return NetworkAlias.Polygon;
      default:
        throw new Error(`Moralis doesn't have alias for ${network}`);
    }
  }

  private enrichTokensWithPrices = async (
    tokens: TokenWithBalance[],
    network: Network
  ): Promise<TokenWithBalance[]> => {
    const addresses = tokens.map((t) => t.address);
    const pricesResponse = await this.fetchTokensPriceByContractAddresses(
      addresses,
      this.nativeCurrency,
      network
    );

    return tokens.map((t) => {
      const retrievedPrice = getAssetPriceFromPriceRecord(
        pricesResponse,
        t.address,
        this.nativeCurrency
      );
      if (retrievedPrice === undefined) {
        return t;
      }

      t.priceUSD = retrievedPrice;
      return t;
    });
  };

  private enrichTokensWithNative = async (
    tokens: TokenWithBalance[],
    network: Network
  ): Promise<TokenWithBalance[]> => {
    try {
      const nativeBalance = await this.getNativeBalance(network);
      const baseAssetData = getBaseAssetData(network);
      return [
        ...tokens,
        {
          address: baseAssetData.address,
          balance: nativeBalance,
          priceUSD: store.getters['account/baseTokenPrice'](network),
          marketCap: store.getters['account/getTokenMarketCap'](
            network,
            baseAssetData.address
          ),
          decimals: baseAssetData.decimals,
          logo: baseAssetData.iconURL,
          name: baseAssetData.name,
          symbol: baseAssetData.symbol,
          color: store.getters['account/getTokenColor'](
            baseAssetData.network,
            baseAssetData.address
          ),
          network: network
        }
      ];
    } catch (err) {
      Sentry.captureMessage(`Can't get enrich token list with native: ${err}`);
      return tokens;
    }
  };

  private getNativeBalance = async (network: Network): Promise<string> => {
    try {
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}/balance?chain=${this.getNetworkAlias(
            network
          )}`
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

  private getErc20Tokens = async (
    network: Network
  ): Promise<TokenWithBalance[]> => {
    try {
      const moverData = getMoveAssetData(network);
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}/erc20?chain=${this.getNetworkAlias(network)}`
        )
      ).data as Erc20TokensResponse[];
      return res
        .filter((t) => t.decimals !== null && t.name !== null)
        .map((t) => {
          let assetName: string;
          let assetSymbol: string;
          let assetLogo: string;

          if (sameAddress(t.token_address, moverData.address)) {
            assetName = moverData.name;
            assetSymbol = moverData.symbol;
            assetLogo = moverData.iconURL;
          } else {
            assetName = t.name.slice(0, MAX_ASSET_NAME);
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
              network,
              t.token_address
            ),
            name: assetName,
            priceUSD: '0',
            symbol: assetSymbol,
            network: network
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

  private mergeTokensWithLocalTokens<T extends Token>(
    tokens: Array<T>,
    network: Network
  ): Array<T> {
    return tokens.map((token) => {
      const localToken = this.localTokens[network].find((localToken) =>
        sameAddress(localToken.address, token.address)
      );
      if (localToken === undefined) {
        return token;
      }

      if (token.logo == '') {
        token.logo = localToken.logo;
      }

      if (token.priceUSD == '0') {
        token.priceUSD = localToken.priceUSD;
      }

      return token;
    });
  }

  private mapTokensToChecksumAddresses<T extends Token>(
    tokens: Array<T>,
    network: Network
  ): Array<T> {
    const chainId = getNetwork(network)?.chainId;

    return tokens.map((token) => {
      try {
        token.address = Web3.utils.toChecksumAddress(token.address, chainId);
        return token;
      } catch {
        return token;
      }
    });
  }

  private parseTransactions = async (
    walletTokens: Array<Token>,
    erc20Transactions: Array<Erc20Transaction>,
    nativeTransactions: Array<NativeTransaction>,
    network: Network
  ): Promise<Transaction[]> => {
    const baseAssetData = getBaseAssetData(network);

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
          // assume this is an pure transfer transaction
          const direction = sameAddress(txn.to_address, this.accountAddress)
            ? sameAddress(txn.from_address, this.accountAddress)
              ? 'self'
              : 'in'
            : 'out';

          acc.push({
            network: network,
            asset: {
              address: baseAssetData.address,
              decimals: baseAssetData.decimals,
              symbol: baseAssetData.symbol,
              change: txn.value,
              iconURL: baseAssetData.iconURL,
              price: store.getters['account/baseTokenPrice'](network),
              direction: direction,
              network: network
            },
            blockNumber: txn.block_number,
            hash: txn.hash,
            uniqHash: `${network}-${txn.hash}`,
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
              token =
                store.state?.account?.tokenInfoMap?.[network]?.[txn.to_address];
              if (token === undefined) {
                return acc;
              }
            }

            acc.push({
              network: network,
              asset: {
                address: token.address,
                decimals: token.decimals,
                symbol: token.symbol,
                iconURL: token.logo,
                network: network
              },
              blockNumber: txn.block_number,
              hash: txn.hash,
              uniqHash: `${network}-${txn.hash}`,
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
          token =
            store.state?.account?.tokenInfoMap?.[network]?.[txn.to_address];
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
          network: network,
          asset: {
            address: token.address,
            decimals: token.decimals,
            symbol: token.symbol,
            change: txn.value,
            iconURL: token.logo,
            price: token.priceUSD === '' ? '0' : token.priceUSD,
            direction: direction,
            network: network
          },
          blockNumber: txn.block_number,
          hash: txn.transaction_hash,
          uniqHash: isSwapTransaction
            ? direction === 'in'
              ? `${network}-${txn.transaction_hash}-1`
              : `${network}-${txn.transaction_hash}-0`
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
      const pricesResponse = await this.fetchTokensPriceByContractAddresses(
        uniqueAddressesOfTokensWithoutPrices,
        this.nativeCurrency,
        network
      );

      erc20ParsedTransactions = erc20ParsedTransactions.map((txn) => {
        if ('asset' in txn && txn.asset !== undefined) {
          const price = getAssetPriceFromPriceRecord(
            pricesResponse,
            txn.asset.address,
            this.nativeCurrency
          );
          if (price !== undefined && 'price' in txn.asset) {
            return {
              ...txn,
              asset: {
                ...txn.asset,
                price
              }
            };
          }
        }
        return txn;
      });
    }

    return [...erc20ParsedTransactions, ...nativeParsedTransactions];
  };

  private getErc20TokensMetadata = async (
    addresses: string[],
    network: Network
  ): Promise<Token[]> => {
    try {
      const res = (
        await this.apiClient.get(`${this.accountAddress}/erc20/metadata}`, {
          params: {
            chain: this.getNetworkAlias(network),
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
        symbol: t.symbol,
        network: network
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

  private getErc20Transactions = async (
    network: Network,
    limit: number,
    offset = 0
  ): Promise<Array<Erc20Transaction>> => {
    try {
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}/erc20/transfers?chain=${this.getNetworkAlias(
            network
          )}&limit=${limit}&offset=${offset}`
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

  private getNativeTransactions = async (
    network: Network,
    limit: number,
    offset = 0
  ): Promise<Array<NativeTransaction>> => {
    try {
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}?chain=${this.getNetworkAlias(
            network
          )}&limit=${limit}&offset=${offset}`
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
