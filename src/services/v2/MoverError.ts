import axios from 'axios';
import { CustomError } from 'ts-custom-error';

import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';

export class MoverError<T = void> extends CustomError {
  protected payload?: T;
  protected wrappedError?: Error;
  protected originalMessage: string;

  constructor(message: string, payload?: T) {
    super(message);
    this.originalMessage = message;
    this.payload = payload;
  }

  public formatMessage(wrappedError?: Error): string {
    const baseString = this.message;
    if (wrappedError === undefined) {
      return baseString;
    }

    let wrappedErrorString;
    if (wrappedError instanceof MoverError) {
      wrappedErrorString = wrappedError.formatMessage();
    } else if (axios.isAxiosError(wrappedError)) {
      wrappedErrorString = JSON.stringify(wrappedError.toJSON());
    } else {
      wrappedErrorString = wrappedError?.message ?? wrappedError.toString();
    }

    return `${baseString}: ${wrappedErrorString}`;
  }

  public wrap(error: Error): this {
    this.message = this.formatMessage(error);
    this.wrappedError = error;
    return this;
  }

  public setPayload(payload: T): this {
    this.payload = payload;
    return this;
  }

  public getPayload(): T | undefined {
    return this.payload;
  }

  public getWrappedError(): Error | undefined {
    return this.wrappedError;
  }

  public getOriginalMessage(): string {
    return this.originalMessage;
  }

  public addToBreadcrumb(): void {
    addSentryBreadcrumb({
      type: 'error',
      category: 'mover.error',
      message: this.originalMessage,
      data: {
        payload: this.payload,
        wrappedError: this.wrappedError
      }
    });
  }
}
