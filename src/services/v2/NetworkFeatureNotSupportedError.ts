import { Network } from '@/utils/networkTypes';

import { MoverError } from './MoverError';

export class NetworkFeatureNotSupportedError extends MoverError {
  constructor(
    protected readonly featureName: string,
    protected readonly network: Network
  ) {
    super(
      `Feature "${featureName}" is not supported in current network (${network})`
    );
  }

  public getFeatureName(): string {
    return this.featureName;
  }

  public getNetwork(): Network {
    return this.network;
  }
}
