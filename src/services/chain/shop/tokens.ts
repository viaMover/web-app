import { Asset } from '@/store/modules/shop/types';
import { toWei } from '@/utils/bigmath';

export const allNibbleShopTokens: Asset[] = [
  {
    active: true,
    id: '$CEO1',
    urlId: 'ceo',
    intId: 0,
    address: '0x8c4075ef135aaebb2f0fd445635e305a162e4411',
    feeAmount: toWei('0.042', 18),
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
    active: false,
    id: '$IC1',
    intId: 0,
    urlId: 'ic',
    address: '0x1',
    feeAmount: '49.99',
    balance: 0,
    initialQuantity: 0,
    redeemCount: 0,
    totalClaimed: 0,
    title: 'Classic T-Shirt',
    shortName: 'classic T-Shirt',
    preview: {
      videoSrc: require('@/assets/videos/ClassicTShirt.webm'),
      background: '#f0f6f8'
    },
    page: {
      videoSrc: require('@/assets/videos/ClassicTShirt.webm'),
      background: '#f0f6f8'
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
