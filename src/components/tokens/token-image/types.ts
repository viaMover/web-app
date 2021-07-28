export interface IImageFallbackOpts {
  // fallback image sources (fallbacks to the next one if present)
  images?: Array<string>;

  // loading image src
  loading?: string;

  // onError handler
  onError: () => void;
}
