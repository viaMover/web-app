import { MoverError } from '@/services/v2';
import { toArray } from '@/utils/arrays';

export class CurrencyNotSupportedError extends MoverError {
  constructor(message: string, currencies: string | Array<string>) {
    super(message, { currencies: toArray(currencies) });
  }
}
