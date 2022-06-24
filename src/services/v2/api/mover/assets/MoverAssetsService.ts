import axios, { AxiosInstance } from 'axios';

import { getTokenLogo } from '@/services/trustwallet/logo';
import { isProduction } from '@/settings';
import { MAX_ASSET_NAME } from '@/utils/consts';
import { Network } from '@/utils/networkTypes';
import { availableNetworks } from '@/wallet/allTokens';
import { getTestnetAssets } from '@/wallet/references/testnetAssets';
import { Token } from '@/wallet/types';

import { AssetList } from './types';

export class MoverAssetsService {
  protected readonly assetsListsCache: Record<
    Network,
    AssetList[] | undefined
  > = {
    [Network.mainnet]: undefined,
    [Network.binance]: undefined,
    [Network.polygon]: undefined,
    [Network.avalanche]: undefined,
    [Network.fantom]: undefined,
    [Network.polygon]: undefined,
    [Network.arbitrum]: undefined,
    [Network.ropsten]: undefined,
    [Network.optimism]: undefined,
    [Network.kovan]: undefined,
    [Network.binanceTest]: undefined,
    [Network.celo]: undefined,
    [Network.rinkeby]: undefined
  };
  protected readonly sentryCategoryPrefix = 'asset service';
  protected readonly client: AxiosInstance;
  protected readonly baseURL: string;

  constructor() {
    this.baseURL = isProduction()
      ? 'https://token-list-back-dot-mcmannaman-208313.ey.r.appspot.com'
      : 'https://token-list-back-staging-dot-mcmannaman-208313.ey.r.appspot.com';

    this.client = axios.create({ baseURL: this.baseURL });
  }

  public async getAllTokens(network: Network): Promise<Array<Token>> {
    let assets: Array<Token>;
    if (availableNetworks.includes(network)) {
      assets = (await this.getAssetsList(network)).map(
        (asset) =>
          ({
            address: asset.id,
            decimals: asset.decimals,
            symbol: asset.symbol,
            name: asset.name.slice(0, MAX_ASSET_NAME),
            logo: asset.imageUrl ?? getTokenLogo(asset.id, network),
            color: asset.color,
            marketCap: asset.marketCap ?? 0,
            priceUSD: '0'
          } as Token)
      );
    } else {
      assets = getTestnetAssets(network);
    }
    return this.deduplicateByAddress(
      assets.sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
    );
  }

  private async getAssetsList(network: Network): Promise<Array<AssetList>> {
    const cachedAssetsList = this.assetsListsCache[network];
    if (cachedAssetsList !== undefined) {
      return cachedAssetsList;
    }

    const data = (
      await this.client.get<Array<AssetList>>(
        `assets/assetList-${this.mapToAssetListName(network)}.json`
      )
    ).data;

    return data;
  }

  protected deduplicateByAddress(tokens: Array<Token>): Array<Token> {
    const knownAddresses = new Set();
    return tokens.reduce((acc, t) => {
      if (knownAddresses.has(t.address)) {
        return acc;
      }

      knownAddresses.add(t.address);
      acc.push(t);
      return acc;
    }, new Array<Token>());
  }

  private mapToAssetListName(network: Network): string {
    switch (network) {
      case Network.mainnet:
        return 'ethereum';
      default:
        return network;
    }
  }
}
