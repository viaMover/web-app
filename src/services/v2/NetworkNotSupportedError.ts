import { MoverError } from './MoverError';

export class NetworkNotSupportedError extends MoverError {
  constructor(protected readonly chainId: number) {
    super(`Network with chainId "${chainId}" is not supported`);
  }

  public getChainId(): number {
    return this.chainId;
  }
}
