import * as Sentry from '@sentry/vue';
import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';

import { getPriceByAddress, NetworkAliases } from '@/services/coingecko/tokens';
import { Explorer } from '@/services/explorer';
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

import {
  Erc20TokensResponse,
  Erc20TransactionResponse,
  NativeBalanceResponse
} from './responses';

export class MoralisExplorer implements Explorer {
  readonly name: string = 'Moralis';
  readonly apiURL: string = 'https://deep-index.moralis.io/api/v2/';
  private readonly apiClient: AxiosInstance;

  constructor(
    private readonly accountAddress: string,
    private readonly nativeCurrency: string,
    private readonly network: Network,
    apiKey: string,
    private readonly setTransactions: (txns: Array<Transaction>) => void,
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
  }

  async init(): Promise<void> {
    await this.refreshWalletData();
  }

  public async refreshWalletData(): Promise<void> {
    const tokens = await this.getErc20Tokens();
    const tokensWithPrices = await this.enrichTokensWithPrices(tokens);
    const tokensWihNative = await this.enrichTokensWithNative(tokensWithPrices);
    this.setTokens(tokensWihNative);
    const erc20Transactions = await this.getErc20Transactions();
    this.setTransactions(erc20Transactions);
  }

  public getChartData = (
    assetCode: string,
    nativeCurrency: string,
    ChartTypes: string
  ): void => {
    console.log('Not implemented yet');
  };

  // PRIVATE SECTION

  private getNetworkAlias(): NetworkAliases {
    switch (this.network) {
      case Network.mainnet:
        return NetworkAliases.Eth;
      case Network.binance:
        return NetworkAliases.Bsc;
      case Network.binanceTest:
        return NetworkAliases.BscTestnet;
      case Network.kovan:
        return NetworkAliases.Koven;
      case Network.rinkeby:
        return NetworkAliases.Rinkeby;
      case Network.ropsten:
        return NetworkAliases.Ropster;
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

  private getErc20Transactions = async (): Promise<Transaction[]> => {
    try {
      const moverData = getMoveAssetData(this.network);
      const res = (
        await this.apiClient.get(
          `${
            this.accountAddress
          }/erc20/transfers?chain=${this.getNetworkAlias()}`
        )
      ).data as Erc20TransactionResponse;
      return res.result.reduce<Transaction[]>((acc, txn) => {
        const token: Token | undefined = store.getters[
          'account/getTokenFromMapByAddres'
        ](txn.address);

        if (token === undefined) {
          return acc;
        }

        acc.push({
          asset: {
            address: token.address,
            decimals: token.decimals,
            symbol: token.symbol,
            change: txn.value,
            iconURL: token.logo,
            price: '0',
            direction: 'in'
          },
          blockNumber: txn.block_number,
          hash: txn.transaction_hash,
          uniqHash: txn.transaction_hash,
          from: txn.from_address,
          nonce: '0',
          to: txn.from_address,
          timestamp: dayjs(txn.block_timestamp).unix(),
          type: TransactionTypes.transferERC20,
          fee: { ethPrice: '0', feeInWEI: '0' },
          status: 'confirmed',
          isOffchain: false,
          moverType: 'unknown'
        });

        return acc;
      }, [] as Transaction[]);
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
}
