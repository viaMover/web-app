import { ApolloClient } from 'apollo-client';
import { AxiosInstance } from 'axios';

export abstract class APIService {
  protected abstract readonly client: AxiosInstance | ApolloClient<unknown>;
  protected readonly currentAddress: string;
  protected abstract baseURL: string;
  protected abstract readonly sentryCategoryPrefix: string;

  protected constructor(currentAddress: string) {
    this.currentAddress = currentAddress;
  }

  protected abstract formatError(error: unknown): never;

  protected getParamsSerializer(
    params: Record<string, number | string | Array<string> | undefined>
  ): string {
    const queryString = Object.entries(params).reduce(
      (queryString, [key, value]) => {
        if (value === undefined) {
          return queryString;
        }

        if (
          typeof value === 'object' &&
          Array.isArray(value) &&
          value.length === 0
        ) {
          return queryString;
        }

        queryString.append(key, value.toString());
        return queryString;
      },
      new URLSearchParams()
    );

    return queryString.toString();
  }
}
