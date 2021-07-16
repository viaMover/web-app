import { sameAddress } from './../../utils/address';
import { mapZerionTokens } from './tokens';
import {
  ZerionAssetsReceived,
  ZerionChartsReceived,
  ZerionTransactionsReceived
} from './responses';
import io from 'socket.io-client';
import { messages, TRANSACTIONS_LIMIT } from './messages';
import { TokenWithBalance, Transaction } from '@/wallet/types';
import { mapZerionTxns } from './transactions';
import { GetTokensPrice } from '../thegraph/api';
import findIndex from 'lodash-es/findIndex';

export type Explorer = {
  GetChartData: (
    assetCode: string,
    nativeCurrency: string,
    ChartTypes: string
  ) => void;
};

export const InitExplorer = (
  accountAddress: string,
  nativeCurrency: string,
  setTransactions: (txns: Array<Transaction>) => void,
  updateTransactions: (txns: Array<Transaction>) => void,
  removeTransactions: (txns: Array<string>) => void,
  setTokens: (tokens: Array<TokenWithBalance>) => void,
  updateTokens: (tokens: Array<TokenWithBalance>) => void,
  removeTokens: (tokens: Array<string>) => void,
  setChartData: (chartData: Record<string, Array<[number, number]>>) => void
): Explorer => {
  const io_options = {
    extraHeaders: { origin: 'http://localhost:3000' },
    transports: ['websocket'],
    query: { api_token: 'Demo.ukEVQp6L5vfgxcz4sBke7XvS873GMYHy' },
    allowEIO3: true
  };
  const addressSocket = io('wss://api-v4.zerion.io/address', io_options);
  const assetSocket = io('wss://api.zerion.io/assets', io_options);

  addressSocket.on(messages.CONNECT, () => {
    addressSocket.emit('subscribe', {
      payload: {
        address: accountAddress.toLowerCase(),
        currency: nativeCurrency.toLowerCase(),
        transactions_limit: TRANSACTIONS_LIMIT
      },
      scope: ['transactions', 'assets']
    });
  });

  // Transactions
  addressSocket.on(
    messages.ADDRESS_TRANSACTIONS.RECEIVED,
    (message: ZerionTransactionsReceived) => {
      console.log(messages.ADDRESS_TRANSACTIONS.RECEIVED, message);
      const txns = mapZerionTxns(message);
      setTransactions(txns);
    }
  );
  addressSocket.on(
    messages.ADDRESS_TRANSACTIONS.CHANGED,
    (message: ZerionTransactionsReceived) => {
      console.log(messages.ADDRESS_TRANSACTIONS.CHANGED, message);
      const txns = mapZerionTxns(message);
      updateTransactions(txns);
    }
  );
  addressSocket.on(
    messages.ADDRESS_TRANSACTIONS.APPENDED,
    (message: ZerionTransactionsReceived) => {
      console.log(messages.ADDRESS_TRANSACTIONS.APPENDED, message);
      const txns = mapZerionTxns(message);
      updateTransactions(txns);
    }
  );
  addressSocket.on(
    messages.ADDRESS_TRANSACTIONS.REMOVED,
    (message: ZerionTransactionsReceived) => {
      console.log(messages.ADDRESS_TRANSACTIONS.REMOVED, message);
      const txns = mapZerionTxns(message);
      removeTransactions(txns.map((t) => t.hash));
    }
  );

  // Tokens
  addressSocket.on(
    messages.ADDRESS_ASSETS.RECEIVED,
    async (message: ZerionAssetsReceived) => {
      console.log(messages.ADDRESS_ASSETS.RECEIVED, message);
      const tokens = mapZerionTokens(message);

      console.log('tokens: ', tokens);

      const missingPriceAssetAddresses = tokens
        .filter((t) => t.priceUSD === '0')
        .map((t) => t.address);

      console.log('missingPriceAssetAddresses: ', missingPriceAssetAddresses);

      if (missingPriceAssetAddresses) {
        const missingPrices = await GetTokensPrice(missingPriceAssetAddresses);
        Array.from(missingPrices).forEach(([addr, price]) => {
          const ind = findIndex(tokens, (t) => sameAddress(t.address, addr));
          if (ind !== -1) {
            tokens[ind].priceUSD = price;
          }
        });
      }

      console.log('tokens: ', tokens);

      setTokens(tokens);
    }
  );
  addressSocket.on(
    messages.ADDRESS_ASSETS.CHANGED,
    (message: ZerionAssetsReceived) => {
      console.log(messages.ADDRESS_ASSETS.CHANGED, message);
      const tokens = mapZerionTokens(message);
      updateTokens(tokens);
    }
  );
  addressSocket.on(
    messages.ADDRESS_ASSETS.APPENDED,
    (message: ZerionAssetsReceived) => {
      console.log(messages.ADDRESS_ASSETS.APPENDED, message);
      const tokens = mapZerionTokens(message);
      updateTokens(tokens);
    }
  );
  addressSocket.on(
    messages.ADDRESS_ASSETS.REMOVED,
    (message: ZerionAssetsReceived) => {
      console.log(messages.ADDRESS_ASSETS.REMOVED, message);
      const tokens = mapZerionTokens(message);
      removeTokens(tokens.map((t) => t.address));
    }
  );

  assetSocket.on(
    messages.ASSET_CHARTS.RECEIVED,
    async (message: ZerionChartsReceived) => {
      console.log(messages.ASSET_CHARTS.RECEIVED, message);
      if (message.meta.status === 'ok') {
        setChartData(message.payload.charts);
      } else {
        console.error("can't load charts data");
      }
    }
  );

  return {
    GetChartData: (
      assetCode: string,
      nativeCurrency: string,
      chartType: string
    ) => {
      assetSocket.emit('get', {
        payload: {
          asset_codes: [assetCode],
          charts_type: chartType,
          currency: nativeCurrency.toLowerCase()
        },
        scope: ['charts']
      });
    }
  };
};
