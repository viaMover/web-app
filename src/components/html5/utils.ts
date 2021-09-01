import { PictureSourceDescriptor } from './types';

export const formatPictureSources = (
  sources?: Array<PictureSourceDescriptor>
): string | undefined => {
  if (sources === undefined) {
    return undefined;
  }

  return sources
    .reduce(
      (acc, source) =>
        acc.concat(
          `${source.src}${source.variant ? ' ' + source.variant : ''}`
        ),
      new Array<string>()
    )
    .join(', ');
};
