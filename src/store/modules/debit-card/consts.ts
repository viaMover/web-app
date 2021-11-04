import { SkinMinimal } from './types';

export const defaultSkin: SkinMinimal = {
  id: 'default',
  symbol: 'DEF',
  nftAddress: undefined,
  color: '#c0ed31'
};

export const allSkins: Array<SkinMinimal> = [
  defaultSkin,
  {
    id: 'cat-ass',
    symbol: 'ASS',
    nftAddress: undefined,
    color: '#42c5e4'
  },
  {
    id: 'badge',
    symbol: 'BDG',
    nftAddress: undefined,
    color: '#3c1608'
  },
  {
    id: 'gorilla',
    symbol: 'GRL',
    nftAddress: undefined,
    color: '#504145'
  },
  {
    id: 'horns',
    symbol: 'HRNS',
    nftAddress: undefined,
    color: '#e5e612'
  },
  {
    id: 'shiny-one',
    symbol: 'SNH1',
    nftAddress: undefined,
    color: '#aed3f6'
  }
];
