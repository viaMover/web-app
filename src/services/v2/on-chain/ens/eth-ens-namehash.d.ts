declare module '@ensdomains/eth-ens-namehash' {
  declare function hash(input: string): string;
  declare function normalize(input: string): string;
  export default {
    hash,
    normalize
  };
}
