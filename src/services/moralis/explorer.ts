import * as Sentry from '@sentry/vue';
import { addABI, decodeMethod } from 'abi-decoder';
import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import Web3 from 'web3';

import { Explorer } from '@/services/explorer';
import { NetworkAlias, TransactionsResponse } from '@/services/moralis/types';
import { isError } from '@/services/responses';
import { AlchemyAPIService } from '@/services/v2/api/alchemy/AlchemyAPIService';
import { AnkrAPIService } from '@/services/v2/api/ankr';
import { getAssetPriceFromPriceRecord } from '@/services/v2/utils/price';
import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';
import { isFeatureEnabled } from '@/settings';
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
  private static readonly TRANSACTIONS_PER_BATCH = 100; // should be exactly 100 for magic Moralis reasons

  private nativeTransactionsCursor: string | null = null;
  private erc20TransactionsCursor: string | null = null;

  private readonly ankrService: AnkrAPIService | undefined = undefined;
  private readonly alchemyService: AlchemyAPIService | undefined = undefined;

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
    private readonly nativeCurrency: NativeCurrency,
    private readonly network: Network,
    private readonly availableNetworks: Network[],
    apiKey: string,
    private readonly setTransactions: (txns: Array<Transaction>) => void,
    private readonly updateTransactions: (txns: Array<Transaction>) => void,
    private readonly setIsTransactionsListLoaded: (val: boolean) => void,
    private readonly setTokens: (tokens: Array<TokenWithBalance>) => void,
    private readonly setIsTokensListLoaded: (val: boolean) => void,
    private readonly setChartData: (
      chartData: Record<string, Array<[number, number]>>
    ) => void,
    private readonly fetchTokensPriceByContractAddresses: (
      addresses: Array<string>,
      nativeCurrency: NativeCurrency
    ) => Promise<PriceRecord>,
    private readonly localTokens: Array<Token>,
    private readonly web3: Web3
  ) {
    this.apiClient = axios.create({
      baseURL: this.apiURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    });
    addABI(MoralisExplorer.erc20AbiApprove);
    // TODO: use real api key for ANKR
    try {
      if (AnkrAPIService.canHandle(this.network)) {
        this.ankrService = new AnkrAPIService(this.accountAddress, '', [
          this.network
        ]);
      }
    } catch (e) {
      captureSentryException(e);
    }

    try {
      if (AlchemyAPIService.canHandle(this.network)) {
        this.alchemyService = new AlchemyAPIService(
          this.accountAddress,
          'demo'
        );
      }
    } catch (e) {
      captureSentryException(e);
    }
  }

  public init = async (): Promise<void> => {
    this.setIsTransactionsListLoaded(false);
    await this.refreshWalletData();
  };

  public hasInfiniteLoader = (): boolean => {
    return true;
  };

  public refreshWalletData = async (): Promise<void> => {
    try {
      this.setIsTransactionsListLoaded(false);
      this.nativeTransactionsCursor = null;
      this.erc20TransactionsCursor = null;

      if (!isFeatureEnabled('isTokenListAvailable', this.network)) {
        return;
      }

      const tokensWithPricePromise = this.getErc20Tokens()
        .then((tokens) => this.initialTokenEnrich(tokens))
        .then((tokens) => this.mergeTokensWithLocalTokens(tokens))
        .then((tokens) => this.mapTokensToChecksumAddresses(tokens))
        .then((tokens) => this.enrichTokensWithPrices(tokens))
        .then((tokens) => this.enrichTokensWithNative(tokens))
        .then((tokensWithNative) => {
          this.setTokens(tokensWithNative);
          // set tokens list loaded as early as possible
          this.setIsTokensListLoaded(true);
          return tokensWithNative;
        });

      if (isFeatureEnabled('isTransactionsListAvailable', this.network)) {
        const erc20TransactionsPromise = this.getErc20Transactions(
          MoralisExplorer.TRANSACTIONS_PER_BATCH
        );
        const nativeTransactionsPromise = this.getNativeTransactions(
          MoralisExplorer.TRANSACTIONS_PER_BATCH
        );

        const [tokensWithPrices, erc20Transactions, nativeTransactions] =
          await Promise.all([
            tokensWithPricePromise,
            erc20TransactionsPromise,
            nativeTransactionsPromise
          ]);

        const transactions = await this.parseTransactions(
          tokensWithPrices,
          erc20Transactions.transactions,
          nativeTransactions.transactions
        );
        this.setTransactions(transactions);
      }
    } finally {
      this.setIsTokensListLoaded(true);
      this.setIsTransactionsListLoaded(true);
    }
  };

  public loadMoreTransactions = async (
    nativeOnly = false
  ): Promise<boolean> => {
    try {
      this.setIsTransactionsListLoaded(false);

      let erc20TransactionsPromise = Promise.resolve<
        TransactionsResponse<Array<Erc20Transaction>>
      >({
        transactions: [],
        hasMore: false
      });
      if (!nativeOnly) {
        erc20TransactionsPromise = this.getErc20Transactions(
          MoralisExplorer.TRANSACTIONS_PER_BATCH
        );
      }
      const nativeTransactionsPromise = this.getNativeTransactions(
        MoralisExplorer.TRANSACTIONS_PER_BATCH
      );

      const [erc20Transactions, nativeTransactions] = await Promise.all([
        erc20TransactionsPromise,
        nativeTransactionsPromise
      ]);

      if (!erc20Transactions.hasMore && !nativeTransactions.hasMore) {
        return false;
      }

      const transactions = await this.parseTransactions(
        this.localTokens,
        erc20Transactions.transactions,
        nativeTransactions.transactions
      );

      if (transactions.length === 0 && nativeTransactions.hasMore) {
        // after txns mapping, we didn't get the ones we needed
        // it happens only for native txns
        // so we have to make a query again only for native
        return await this.loadMoreTransactions(true);
      } else {
        this.updateTransactions(transactions);
      }
    } finally {
      this.setIsTransactionsListLoaded(true);
    }

    return true;
  };

  public getChartData = (
    assetCode: string,
    nativeCurrency: string,
    chartsType: string
  ): void => {
    console.log('Not implemented yet');
  };

  private getNetworkAlias = (): NetworkAlias => {
    switch (this.network) {
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
        throw new Error(`Moralis doesn't have alias for ${this.network}`);
    }
  };

  private enrichTokensWithPrices = async (
    tokens: TokenWithBalance[]
  ): Promise<TokenWithBalance[]> => {
    const tokensWithoutPrice = tokens.filter((t) => t.priceUSD === '');
    if (tokensWithoutPrice.length === 0) {
      return tokens;
    }

    const addresses = tokensWithoutPrice.map((t) => t.address);
    const pricesResponse = await this.fetchTokensPriceByContractAddresses(
      addresses,
      this.nativeCurrency
    );

    return tokens.map((t) => {
      const retrievedPrice = getAssetPriceFromPriceRecord(
        pricesResponse,
        t.address,
        this.nativeCurrency
      );
      if (retrievedPrice === undefined) {
        t.priceUSD = '0';
        return t;
      }

      t.priceUSD = retrievedPrice;
      return t;
    });
  };

  private enrichTokensWithNative = async (
    tokens: TokenWithBalance[]
  ): Promise<TokenWithBalance[]> => {
    const baseAssetData = getBaseAssetData(this.network);
    if (
      tokens.find((t) => sameAddress(t.address, baseAssetData.address)) !==
      undefined
    ) {
      return tokens;
    }
    try {
      const nativeBalance = await this.getNativeBalance();
      const baseAssetData = getBaseAssetData(this.network);
      return [
        ...tokens,
        {
          address: baseAssetData.address,
          balance: nativeBalance,
          priceUSD: store.getters['account/baseTokenPrice'],
          marketCap: store.getters['account/getTokenMarketCap'](
            baseAssetData.address
          ),
          decimals: baseAssetData.decimals,
          logo: baseAssetData.iconURL,
          name: baseAssetData.name,
          symbol: baseAssetData.symbol,
          color: store.getters['account/getTokenColor'](baseAssetData.address)
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

  private initialTokenEnrich = (
    tokens: Array<TokenWithBalance>
  ): Array<TokenWithBalance> => {
    const moverData = getMoveAssetData(this.network);

    return tokens.map((t) => {
      let assetName: string;
      let assetSymbol: string;
      let assetLogo: string;

      if (sameAddress(t.address, moverData.address)) {
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
        ...t,
        logo: assetLogo,
        marketCap: store.getters['account/getTokenMarketCap'](t.address),
        name: assetName,
        symbol: assetSymbol
      };
    });
  };

  private getErc20Tokens = async (): Promise<Array<TokenWithBalance>> => {
    const baseAssetData = getBaseAssetData(this.network);

    if (this.alchemyService !== undefined) {
      const tokens = await this.alchemyService.getTokens(this.network);
      return [
        ...tokens,
        {
          address: baseAssetData.address,
          balance: fromWei(
            await this.web3.eth.getBalance(this.accountAddress),
            baseAssetData.decimals
          ),
          priceUSD: store.getters['account/baseTokenPrice'],
          marketCap: store.getters['account/getTokenMarketCap'](
            baseAssetData.address
          ),
          decimals: baseAssetData.decimals,
          logo: baseAssetData.iconURL,
          name: baseAssetData.name,
          symbol: baseAssetData.symbol,
          color: store.getters['account/getTokenColor'](baseAssetData.address)
        }
      ];
    }

    if (this.ankrService !== undefined) {
      try {
        const tokens = await this.ankrService.getTokens();
        if (
          tokens.find((t) => sameAddress(t.address, baseAssetData.address)) !==
          undefined
        ) {
          return tokens;
        }
        return [
          ...tokens,
          {
            address: baseAssetData.address,
            balance: '0',
            priceUSD: store.getters['account/baseTokenPrice'],
            marketCap: store.getters['account/getTokenMarketCap'](
              baseAssetData.address
            ),
            decimals: baseAssetData.decimals,
            logo: baseAssetData.iconURL,
            name: baseAssetData.name,
            symbol: baseAssetData.symbol,
            color: store.getters['account/getTokenColor'](baseAssetData.address)
          }
        ];
      } catch (err) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'explorer.moralis.error',
          message: 'ANKR get token error, trying to use Moralis instead'
        });
        captureSentryException(err);
        return await this.getErc20TokensFromMoralis();
      }
    }
    return await this.getErc20TokensFromMoralis();
  };

  private getErc20TokensFromMoralis = async (): Promise<
    Array<TokenWithBalance>
  > => {
    try {
      const res = (
        await this.apiClient.get(
          `${this.accountAddress}/erc20?chain=${this.getNetworkAlias()}`
        )
      ).data as Erc20TokensResponse[];
      return res
        .filter((t) => t.decimals !== null && t.name !== null)
        .map((t) => ({
          address: t.token_address,
          balance: fromWei(t.balance, t.decimals),
          decimals: parseInt(t.decimals),
          logo: '',
          marketCap: 0,
          name: t.name,
          priceUSD: '',
          symbol: t.symbol
        }));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(
          `Can't get erc20 tokens from Moralis, response: ${e.toJSON()}`
        );
      }
      throw new Error(`Can't get erc20 tokens from Moralis: ${String(e)}`);
    }
  };

  private mergeTokensWithLocalTokens = <T extends Token>(
    tokens: Array<T>
  ): Array<T> => {
    return tokens.map((token) => {
      const localToken = this.localTokens.find((localToken) =>
        sameAddress(localToken.address, token.address)
      );
      if (localToken === undefined) {
        return token;
      }

      if (token.logo === '') {
        token.logo = localToken.logo;
      }

      if (token.symbol === '') {
        token.symbol = localToken.symbol;
      }

      if (token.name === '') {
        token.name = localToken.name;
      }

      if (
        token.priceUSD === '' &&
        localToken.priceUSD !== '' &&
        localToken.priceUSD !== '0'
      ) {
        token.priceUSD = localToken.priceUSD;
      }

      return token;
    });
  };

  private mapTokensToChecksumAddresses = <T extends Token>(
    tokens: Array<T>
  ): Array<T> => {
    const chainId = getNetwork(this.network)?.chainId;

    return tokens.map((token) => {
      try {
        token.address = Web3.utils.toChecksumAddress(token.address, chainId);
        return token;
      } catch {
        return token;
      }
    });
  };

  private parseTransactions = async (
    walletTokens: Array<Token>,
    erc20Transactions: Array<Erc20Transaction>,
    nativeTransactions: Array<NativeTransaction>
  ): Promise<Transaction[]> => {
    const baseAssetData = getBaseAssetData(this.network);

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
            asset: {
              address: baseAssetData.address,
              decimals: baseAssetData.decimals,
              symbol: baseAssetData.symbol,
              change: txn.value,
              iconURL: baseAssetData.iconURL,
              price: store.getters['account/baseTokenPrice'],
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
      const pricesResponse = await this.fetchTokensPriceByContractAddresses(
        uniqueAddressesOfTokensWithoutPrices,
        this.nativeCurrency
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

  private getErc20Transactions = async (
    limit: number
  ): Promise<TransactionsResponse<Array<Erc20Transaction>>> => {
    try {
      let cursorStr = '';
      if (this.erc20TransactionsCursor !== null) {
        cursorStr = `&cursor=${this.erc20TransactionsCursor}`;
      }
      const res = (
        await this.apiClient.get(
          `${
            this.accountAddress
          }/erc20/transfers?chain=${this.getNetworkAlias()}&limit=${limit}${cursorStr}`
        )
      ).data as Erc20TransactionResponse;
      this.erc20TransactionsCursor = res.cursor;
      return {
        transactions: res.result,
        hasMore: this.erc20TransactionsCursor !== null
      };
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
    limit: number
  ): Promise<TransactionsResponse<Array<NativeTransaction>>> => {
    try {
      let cursorStr = '';
      if (this.nativeTransactionsCursor !== null) {
        cursorStr = `&cursor=${this.nativeTransactionsCursor}`;
      }
      const res = (
        await this.apiClient.get(
          `${
            this.accountAddress
          }?chain=${this.getNetworkAlias()}&limit=${limit}${cursorStr}`
        )
      ).data as NativeTransactionResponse;
      this.nativeTransactionsCursor = res.cursor;
      return {
        transactions: res.result,
        hasMore: this.nativeTransactionsCursor !== null
      };
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
