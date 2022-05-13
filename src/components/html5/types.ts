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

export const isPictureDescriptor = (
  value: unknown
): value is PictureDescriptor => {
  return !!value && 'src' in (value as { src?: string });
};
