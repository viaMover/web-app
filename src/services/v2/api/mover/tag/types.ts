export type ReserveTagPayload = {
  data: {
    name: string;
    address: string;
    timestamp: number;
  };
  meta: {
    address: string;
    sig: string;
    partner: string | undefined;
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

export enum ErrorCode {
  TagNotFound = 'NOT_FOUND'
}
