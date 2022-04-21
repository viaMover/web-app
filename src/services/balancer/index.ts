import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { isBaseAsset } from '@/utils/address';
import { fromWei } from '@/utils/bigmath';
import { Network } from '@/utils/networkTypes';
import { BALANCE_CHECKER_ABI, lookupAddress } from '@/wallet/references/data';
import { Token, TokenWithBalance, TransactionsParams } from '@/wallet/types';

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

export const getWalletTokens = async (
  tokensToCheck: Array<Token>,
  currentAddress: string,
  web3: Web3,
  network: Network
): Promise<Array<TokenWithBalance>> => {
  const AddressesToCheck = tokensToCheck.map((t) =>
    isBaseAsset(t.address, network) ? ETH_ADDRESS : t.address
  );

  const contractAddress = lookupAddress(network, 'BALANCE_CHECKER_ADDRESS');
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

  return tokensToCheck.map(
    (t, ind) =>
      ({
        address: t.address,
        balance: fromWei(balances[ind], t.decimals),
        decimals: t.decimals,
        logo: t.logo,
        name: t.name,
        priceUSD: t.priceUSD,
        symbol: t.symbol
      } as TokenWithBalance)
  );
};
