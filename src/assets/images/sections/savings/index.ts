import { PictureDescriptor } from '@/components/html5';

export default {
  src: require('./savings@1x.png'),
  sources: [{ src: require('./savings@2x.png'), variant: '2x' }],
  webpSources: [
    { src: require('./savings@1x.webp') },
    { src: require('./savings@2x.webp'), variant: '2x' }
  ]
} as PictureDescriptor;
