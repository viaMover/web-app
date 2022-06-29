export type ReserveTagPayload = {
  data: {
    name: string;
  };
  meta: {
    address: string;
    sig: string;
  };
};

export type ReserveTagResponse = void;

export type LookupTagResponse = {
  name: string;
};
