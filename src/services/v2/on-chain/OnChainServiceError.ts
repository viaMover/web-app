import { MoverError } from '../MoverError';

export class OnChainServiceError<T> extends MoverError<T> {
  constructor(message: string, payload?: T) {
    super(message, payload);
  }
}
