import { ZerionTransactionsReceived } from './responses';
import io from 'socket.io-client';
import { messages, TRANSACTIONS_LIMIT } from './messages';
import { Transaction } from '@/store/modules/account/types';
import { HandleZerionTransactionReceived } from './transactions';

export const InitExplorer = (
  accountAddress: string,
  nativeCurrency: string,
  addTransactions: (txns: Array<Transaction>) => void
) => {
  const io_options = {
    extraHeaders: { origin: 'http://localhost:3000' },
    transports: ['websocket'],
    query: { api_token: 'Demo.ukEVQp6L5vfgxcz4sBke7XvS873GMYHy' },
    allowEIO3: true
  };
  const addressSocket = io('wss://api-v4.zerion.io/address', io_options);
  //const addressSocket = io('wss://api.zerion.io/address', io_options);

  addressSocket.on(messages.CONNECT, () => {
    addressSocket.emit('subscribe', {
      payload: {
        address: accountAddress.toLowerCase(),
        currency: nativeCurrency.toLowerCase(),
        transactions_limit: TRANSACTIONS_LIMIT
      },
      scope: ['transactions']
    });
  });

  addressSocket.on(
    messages.ADDRESS_TRANSACTIONS.RECEIVED,
    (message: ZerionTransactionsReceived) => {
      console.log(messages.ADDRESS_TRANSACTIONS.RECEIVED, message);
      HandleZerionTransactionReceived(message, false, addTransactions);
    }
  );
  addressSocket.on(messages.ADDRESS_TRANSACTIONS.CHANGED, (message) => {
    console.log(messages.ADDRESS_TRANSACTIONS.RECEIVED, message);
  });
  addressSocket.on(messages.ADDRESS_TRANSACTIONS.APPENDED, (message) => {
    console.log(messages.ADDRESS_TRANSACTIONS.RECEIVED, message);
  });
  addressSocket.on(messages.ADDRESS_TRANSACTIONS.REMOVED, (message) => {
    console.log(messages.ADDRESS_TRANSACTIONS.RECEIVED, message);
  });
};
