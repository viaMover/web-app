import axios from 'axios';

const claimCheckUrl =
  'https://mcmannaman-208313.ey.r.appspot.com/api/v2/nft/movernftsws/claimsignature/'; //TODO check and replace

export type GetVaultsSignatureResponse = {
  sig: string;
};

export const getVaultsSignature = async (address: string): Promise<string> => {
  const res = await axios.get<GetVaultsSignatureResponse>(
    `${claimCheckUrl}${address.toLowerCase()}`
  );
  return res.data.sig;
};
