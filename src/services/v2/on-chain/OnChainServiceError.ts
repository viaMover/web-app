import { MoverError } from '../MoverError';

export class OnChainServiceError extends MoverError {
  constructor(message: string, payload?: Record<string, unknown>) {
    super(message, payload);
  }
}
