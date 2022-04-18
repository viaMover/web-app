import { MoverError } from '@/services/v2';

export class CurrencyNotSupportedError extends MoverError<
  string | Array<string>
> {}
