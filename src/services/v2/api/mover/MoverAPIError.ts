import { MoverError } from '@/services/v2/MoverError';

export class MoverAPIError<T = void> extends MoverError<T> {
  constructor(
    readonly message: string,
    readonly shortMessage?: string,
    readonly payload?: T
  ) {
    super(message, payload);
  }
}
