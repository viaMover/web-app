import MoverError from '../../../errors/MoverError';

export default class MoverAPIError<
  T extends Record<string, unknown>
> extends MoverError {
  public name = 'MoverAPIError';

  constructor(
    readonly message: string,
    readonly shortMessage?: string,
    readonly payload?: T
  ) {
    super(message);
  }
}
