import axios from 'axios';

const claimCheckUrl =
  'https://mcmannaman-208313.ey.r.appspot.com/api/v2/nft/movernftsws/claimsignature/';

export type GetSweetAndSourClaimSignatureResponse = {
  sig: string;
};

export const getSweetAndSourClaimSignature = async (
  address: string
): Promise<string> => {
  const res = await axios.get<GetSweetAndSourClaimSignatureResponse>(
    `${claimCheckUrl}${address.toLowerCase()}`
  );
  return res.data.sig;
};
