import { PictureDescriptor } from '@/components/html5';

export default {
  src: require('./smart-treasury@1x.png'),
  sources: [{ src: require('./smart-treasury@2x.png'), variant: '2x' }],
  webpSources: [
    { src: require('./smart-treasury@1x.webp') },
    { src: require('./smart-treasury@2x.webp'), variant: '2x' }
  ]
} as PictureDescriptor;
