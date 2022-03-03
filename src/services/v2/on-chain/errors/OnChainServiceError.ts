import MoverError from '../../errors/MoverError';

export default class OnChainServiceError extends MoverError {
  public name = 'OnChainServiceError';

  constructor(message: string, payload?: Record<string, unknown>) {
    super(message, payload);
  }
}
