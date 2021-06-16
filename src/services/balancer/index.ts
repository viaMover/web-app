import { fromWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import {
  BALANCE_CHECKER_ABI,
  BALANCE_CHECKER_ADDRESS
} from '@/wallet/references/data';
import { Token, TokenWithBalance, TransactionsParams } from '@/wallet/types';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

export const getWalletTokens = async (
  tokensToCheck: Array<Token>,
  currentAddress: string,
  web3: Web3,
  network: Network
): Promise<Array<TokenWithBalance>> => {
  const AddressesToCheck = tokensToCheck.map((t) =>
    t.address === 'eth' ? ETH_ADDRESS : t.address
  );

  const contractAddress = BALANCE_CHECKER_ADDRESS(network);
  const contractABI = BALANCE_CHECKER_ABI;

  const balanceCheckerContract = new web3.eth.Contract(
    contractABI as AbiItem[],
    contractAddress
  );

  const balances = await balanceCheckerContract.methods
    .balances([currentAddress], AddressesToCheck)
    .call({
      from: currentAddress
    } as TransactionsParams);

  const result = tokensToCheck.map(
    (t, ind) =>
      ({
        address: t.address,
        balance: fromWei(balances[ind], t.decimals),
        decimals: t.decimals,
        isFavorite: t.isFavorite,
        isVerified: t.isVerified,
        logo: t.logo,
        name: t.name,
        priceUSD: t.priceUSD,
        symbol: t.symbol
      } as TokenWithBalance)
  );

  return result;
};
