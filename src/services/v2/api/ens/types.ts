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
  // NFT description
  description: string;
  attributes: Array<Attribute>;
  // url to the ens domain overview
  url: string;
  version: string;
  // avatar
  image_url: string;

  // avatar
  // @deprecated useless
  background_image: string;
  // @deprecated useless
  is_normalized: boolean;
  // @deprecated useless
  name_length: number;
  // @deprecated useless
  segment_length: number;
};
