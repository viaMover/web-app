import axios from 'axios';
import { CustomError } from 'ts-custom-error';

export class MoverError<T = void> extends CustomError {
  public name = 'MoverError';
  protected payload?: T;
  protected wrappedError: Error | undefined;

  constructor(message: string, payload?: T) {
    super(message);
    this.payload = payload;
  }

  public toString(): string {
    const baseString = `${this.name}: ${this.message}`;
    if (this.wrappedError === undefined) {
      return baseString;
    }

    let wrappedErrorString;
    if (this.wrappedError instanceof MoverError) {
      wrappedErrorString = this.wrappedError.toString();
    } else if (axios.isAxiosError(this.wrappedError)) {
      wrappedErrorString = JSON.stringify(this.wrappedError.toJSON());
    } else {
      wrappedErrorString =
        this.wrappedError?.message ?? this.wrappedError.toString();
    }

    return `${baseString}: ${wrappedErrorString}`;
  }

  public wrap(error: Error): this {
    this.wrappedError = error;
    return this;
  }

  public unwrap(): Error | undefined {
    return this.wrappedError;
  }

  public setPayload(payload: T): this {
    this.payload = payload;
    return this;
  }

  public getPayload(): T | undefined {
    return this.payload;
  }
}
