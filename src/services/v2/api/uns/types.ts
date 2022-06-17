type NotSpecified = Record<string, unknown>;

export type UNSDomainInformation = {
  addresses: NotSpecified;
  multicoinAddresses: NotSpecified;
  whois: NotSpecified;
  ipfs: NotSpecified;
  social: NotSpecified;
  dns: [];
  meta: {
    domain: string;
    namehash: string;
    tokenId: string;
    owner: string;
    resolver: string;
    type: 'UNS';
    ttl: number;
  };
  records: NotSpecified;
};

export type CNSDomainInformation = {
  addresses: NotSpecified;
  whois: NotSpecified;
  ipfs: NotSpecified;
  gundb: NotSpecified;
  social: NotSpecified;
  meta: {
    owner: string;
    type: 'CNS';
    ttl: number;
    domain: string;
    namehash: string;
  };
  records: NotSpecified;
};

export type DomainInformation = UNSDomainInformation | CNSDomainInformation;

export type Attribute =
  | { value: string | number }
  | { trait_type: string; value: string | number }
  | {
      display_type:
        | 'number'
        | 'date'
        | 'boost_number'
        | 'boost_percentage'
        | 'ranking';
      trait_type: string;
      value: number;
    };

export type ERC721Meta = {
  // domain name
  name: string;
  image: string;
  image_url: string;
  // svg data
  image_data?: string;
  attributes: Array<Attribute>;
  // hex form with omitted "#" (ex.4C47F7)
  background_color?: string;
  description: string;
  // link to the UNS/CNS domain overview
  external_url: string;
  // @deprecated useless
  external_link?: string;
  // @deprecated hard to tell atm
  animation_url?: string;
  // @deprecated won't use as cross-origin policy
  youtube_url?: string;
  // @deprecated useless
  properties: NotSpecified;
};
