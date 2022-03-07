import { MoverError } from '../MoverError';

export class OnChainServiceError<T> extends MoverError<T> {
  public name = 'OnChainServiceError';

  constructor(message: string, payload?: T) {
    super(message, payload);
  }
}
