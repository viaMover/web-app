import { PictureDescriptor } from '@/components/html5';

export default {
  src: require('./staking@1x.png'),
  sources: [{ src: require('./staking@2x.png'), variant: '2x' }],
  webpSources: [
    { src: require('./staking@1x.webp') },
    { src: require('./staking@2x.webp'), variant: '2x' }
  ]
} as PictureDescriptor;
