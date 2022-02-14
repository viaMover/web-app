export type PictureSourceDescriptor = {
  src: string;
  variant?: string;
};

export type PictureDescriptor = {
  alt?: string;
  src: string;
  sources?: Array<PictureSourceDescriptor>;
  webpSources?: Array<PictureSourceDescriptor>;
};
