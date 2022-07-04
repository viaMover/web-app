export type ReserveTagPayload = {
  data: {
    name: string;
  };
  meta: {
    address: string;
    sig: string;
  };
};

export type ReserveTagResponse = {
  name: string;
  sig: string;
};

export type LookupTagResponse = {
  name: string;
  sig: string;
};
