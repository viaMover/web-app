import axios from 'axios';

const claimCheckUrl =
  'https://mcmannaman-208313.ey.r.appspot.com/api/v2/nft/movernftubt/claimsignature/';

export type GetBaseledgerStakingOGClaimSignatureResponse = {
  sig: string;
};

export const getBaseledgerStakingOGSignature = async (
  address: string
): Promise<string> => {
  const res = await axios.get<GetBaseledgerStakingOGClaimSignatureResponse>(
    `${claimCheckUrl}${address.toLowerCase()}`
  );
  return res.data.sig;
};
