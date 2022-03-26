import { MoverAPIError } from '@/services/v2/api/mover/MoverAPIError';

export class MoverAPISubsidizedRequestError<T = void> extends MoverAPIError<T> {
  // TODO: some additional data?
}
