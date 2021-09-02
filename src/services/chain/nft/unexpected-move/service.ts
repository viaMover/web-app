import axios from 'axios';

const claimCheckUrl =
  'https://mcmannaman-208313.ey.r.appspot.com/api/v2/nft/movernft1/claimsignature/';

export type GetUnexpectedSignatureResponse = {
  sig: string;
};

export const getUnexpectedMoveClaimSignature = async (
  address: string
): Promise<string> => {
  const res = await axios.get<GetUnexpectedSignatureResponse>(
    `${claimCheckUrl}${address.toLowerCase()}`
  );
  return res.data.sig;
};
