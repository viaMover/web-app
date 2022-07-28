import axios, { AxiosInstance } from 'axios';

import { isProduction } from '@/settings';
import { Network } from '@/utils/networkTypes';
import { availableNetworks } from '@/wallet/allTokens';
import { getTestnetAssets } from '@/wallet/references/testnetAssets';
import { Token } from '@/wallet/types';

import { Asset } from './types';

export class MoverAssetsService {
  protected readonly sentryCategoryPrefix = 'assets.service';
  protected readonly client: AxiosInstance;
  protected readonly baseURL: string;
  protected readonly tokensCache: Map<Network, Array<Token>>;

  constructor() {
    this.baseURL = isProduction()
      ? 'https://token-list-back-dot-mcmannaman-208313.ey.r.appspot.com'
      : 'https://token-list-back-staging-dot-mcmannaman-208313.ey.r.appspot.com';

    this.client = axios.create({ baseURL: this.baseURL });
    this.tokensCache = new Map<Network, Array<Token>>();
  }

  public async getAllTokens(network: Network): Promise<Array<Token>> {
    const cachedData = this.tokensCache.get(network);
    if (cachedData !== undefined) {
      return cachedData;
    }
    let assets: Array<Token>;
    if (availableNetworks.includes(network)) {
      assets = (await this.getAssetsList(network)).map(
        (asset) =>
          ({
            address: asset.id,
            decimals: asset.decimals,
            symbol: asset.symbol,
            name: asset.name,
            logo: asset.imageUrl ?? '',
            color: asset.color,
            marketCap: asset.marketCap ?? 0,
            priceUSD: '0',
            network: network
          } as Token)
      );
    } else {
      assets = getTestnetAssets(network);
    }
    this.tokensCache.set(network, assets);
    return assets;
  }

  private async getAssetsList(network: Network): Promise<Array<Asset>> {
    return (
      await this.client.get<Array<Asset>>(
        `assets/assetList-${this.mapToAssetListName(network)}.json`
      )
    ).data;
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
