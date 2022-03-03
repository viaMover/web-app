import { AxiosInstance } from 'axios';

export default abstract class ApiService {
  protected abstract readonly client: AxiosInstance;
  protected readonly currentAddress: string;
  protected abstract baseURL: string;
  protected abstract readonly sentryCategoryPrefix: string;

  protected constructor(currentAddress: string) {
    this.currentAddress = currentAddress;
  }

  protected abstract formatError(error: unknown): void;

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
