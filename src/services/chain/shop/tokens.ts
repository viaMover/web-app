import { Asset } from '@/store/modules/shop/types';
import { toWei } from '@/utils/bigmath';

export const allNibbleShopTokens: Asset[] = [
  {
    active: true,
    id: '$CEO1',
    urlId: 'ceo',
    intId: 0,
    address: '0x8c4075ef135aaebb2f0fd445635e305a162e4411',
    feeAmount: toWei('0.069', 18),
    balance: 0,
    initialQuantity: 42,
    redeemCount: 0,
    totalClaimed: 0,
    title: 'The Cap',
    shortName: 'cap',
    preview: {
      videoSrc: require('@/assets/videos/CeoOfMoney.webm'),
      background: '#dbe2e6'
    },
    page: {
      videoSrc: require('@/assets/videos/CeoOfMoney.webm'),
      background: '#dbe2e6'
    }
  },
  {
    active: false,
    id: '$SJ1',
    intId: 0,
    urlId: 'sj',
    address: '0x1',
    feeAmount: '49.99',
    balance: 0,
    initialQuantity: 0,
    redeemCount: 0,
    totalClaimed: 0,
    title: 'Face mask',
    shortName: 'mask',
    preview: {
      videoSrc: require('@/assets/videos/FaceMask.webm'),
      background: '#dde3e7'
    },
    page: {
      videoSrc: require('@/assets/videos/FaceMask.webm'),
      background: '#dde3e7'
    }
  },
  {
    active: true,
    id: '$OGSHIRT1',
    intId: 0,
    urlId: 'ogshirt',
    address: '0x6e0c982c05b6fb0d7465476ddef7b1b7cbe26fcb',
    feeAmount: toWei('0.1', 18),
    balance: 0,
    initialQuantity: 0,
    redeemCount: 0,
    totalClaimed: 0,
    title: 'The OG T-Shirt',
    shortName: 'the OG T-shirt',
    preview: {
      videoSrc: require('@/assets/videos/OGT.mp4'),
      background: '#dbdbdb'
    },
    page: {
      videoSrc: require('@/assets/videos/OGT.mp4'),
      background: '#dbdbdb'
    }
  },
  {
    active: false,
    id: '$PWR01',
    intId: 0,
    urlId: 'pwr',
    address: '0x1',
    feeAmount: '49.99',
    balance: 0,
    initialQuantity: 0,
    redeemCount: 0,
    totalClaimed: 0,
    title: 'Power T-Shirt',
    shortName: 'power T-Shirt',
    preview: {
      videoSrc: require('@/assets/videos/PowerTShirt.webm'),
      background: '#f0f6f8'
    },
    page: {
      videoSrc: require('@/assets/videos/PowerTShirt.webm'),
      background: '#f0f6f8'
    }
  }
];
