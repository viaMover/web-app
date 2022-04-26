import ArbitrumImage from '@/assets/images/icons/arbitrum';
import AvalancheImage from '@/assets/images/icons/avalanche';
import BscImage from '@/assets/images/icons/bsc';
import FantomImage from '@/assets/images/icons/fantom';
import MoveImage from '@/assets/images/icons/move';
import OptimismImage from '@/assets/images/icons/optimism';
import PolygonImage from '@/assets/images/icons/polygon';

import { PictureDescriptor } from '@/components/html5';

export type VariantRegistryItem = {
  image: PictureDescriptor;
  term: string;
  descriptionTerm: string;
};

export type VariantRegistry = {
  move: VariantRegistryItem;
  polygon: VariantRegistryItem;
  fantom: VariantRegistryItem;
  avalanche: VariantRegistryItem;
  bsc: VariantRegistryItem;
  optimism: VariantRegistryItem;
  arbitrum: VariantRegistryItem;
};

export const variantRegistry: VariantRegistry = {
  move: {
    image: MoveImage,
    term: 'move',
    descriptionTerm: 'Move'
  },
  polygon: {
    image: PolygonImage,
    term: 'move',
    descriptionTerm: 'Move'
  },
  fantom: {
    image: FantomImage,
    term: 'move',
    descriptionTerm: 'Move'
  },
  avalanche: {
    image: AvalancheImage,
    term: 'move',
    descriptionTerm: 'Move'
  },
  bsc: {
    image: BscImage,
    term: 'move',
    descriptionTerm: 'Move'
  },
  optimism: {
    image: OptimismImage,
    term: 'move',
    descriptionTerm: 'Move'
  },
  arbitrum: {
    image: ArbitrumImage,
    term: 'move',
    descriptionTerm: 'Move'
  }
};

export type VariantRegistryKey = keyof VariantRegistry;
