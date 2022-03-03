import * as Sentry from '@sentry/vue';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';

import { ErrorResponse as MoverApiErrorResponse } from '@/services/mover/responses';

import MoverError from '../../errors/MoverError';
import MultiChainAPIService from '../multiChainAPIService';
import MoverAPIError from './errors/moverAPIError';

export default abstract class MoverAPIService extends MultiChainAPIService {
  protected formatError(error: unknown): never {
    if (error instanceof MoverAPIError) {
      Sentry.addBreadcrumb({
        type: 'error',
        message: 'API responded with an error',
        category: this.sentryCategoryPrefix,
        data: {
          error: error.message,
          shortError: error.shortMessage,
          payload: error.payload
        }
      });

      throw error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<MoverApiErrorResponse<unknown>>;
      Sentry.addBreadcrumb(this.formatAxiosErrorSentryBreadcrumb(axiosError));

      if (axiosError.response !== undefined) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (axiosError.response.data === undefined) {
          Sentry.addBreadcrumb({
            type: 'error',
            message: 'API responded with an error',
            category: this.sentryCategoryPrefix,
            data: {
              error: 'no data available',
              axiosError: axiosError
            }
          });

          throw new MoverAPIError('Request failed', 'no data').wrap(axiosError); // no data available
        }

        Sentry.addBreadcrumb({
          type: 'error',
          message: 'API responded with an error',
          category: this.sentryCategoryPrefix,
          data: {
            error: axiosError.response.data.error,
            shortError: axiosError.response.data.errorCode,
            axiosError: axiosError
          }
        });

        throw new MoverAPIError(
          axiosError.response.data.error,
          axiosError.response.data.errorCode,
          axiosError.response.data.payload as Record<string, unknown>
        );
      } else if (axiosError.request !== undefined) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest
        Sentry.addBreadcrumb({
          type: 'error',
          message: 'API responded with an error',
          category: this.sentryCategoryPrefix,
          data: {
            error: 'no response received',
            axiosError: axiosError
          }
        });

        throw new MoverError('the request is failed, no response').wrap(error);
      }
    }

    Sentry.addBreadcrumb({
      type: 'error',
      message: 'API responded with an error',
      category: this.sentryCategoryPrefix,
      data: {
        error: 'the request is failed during setup',
        originalError: error
      }
    });

    if (error instanceof Error) {
      // An error is JS-initiated error, just pass it through
      throw new MoverError('The request is failed').wrap(error);
    }

    throw new MoverError(
      `The request is failed during setup / result handling`,
      { data: error }
    );
  }

  protected applyAxiosInterceptors(instance: AxiosInstance): AxiosInstance {
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      // enforce JSON payload format
      config.headers = { ...config.headers, Accept: 'application/json' };

      // treat HTTP 200 as only valid answer
      config.validateStatus = (status: number) => status === 200;
      return config;
    });

    instance.interceptors.response.use((response):
      | AxiosResponse<unknown>
      | Promise<AxiosResponse<unknown>> => {
      // if response.data.status === 'error' then API returned malformed
      // response and/or the response should be treated as an error
      if (response.data.status === 'error') {
        Sentry.addBreadcrumb({
          type: 'error',
          message: 'API responded with code 200 but data.status is "error"',
          category: this.sentryCategoryPrefix,
          data: {
            status: response.status,
            data: response.data
          }
        });

        const error = new MoverAPIError(
          response.data.error,
          response.data.errorCode,
          response.data.payload
        );
        this.formatError(error);
      }

      // otherwise, don't process the response
      return response;
    }, this.formatError);

    return instance;
  }

  private formatAxiosErrorSentryBreadcrumb(
    axiosError: AxiosError<unknown>
  ): Sentry.Breadcrumb {
    const requestUri = axios.getUri(axiosError.config);
    const code = axiosError.code;

    return {
      message: 'A request to the API is failed',
      category: this.sentryCategoryPrefix,
      data: {
        requestUri,
        code,
        axiosError
      }
    };
  }
}
