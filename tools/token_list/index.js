import axios from 'axios';
import {
  existsSync,
  mkdirSync,
  promises,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'fs';
import logger from 'node-color-log';
import Vibrant from 'node-vibrant';
import { basename, join } from 'path';
import simpleGit from 'simple-git';
import Web3 from 'web3';

const networks = ['ethereum'];

const getDecimalsFromContract = async (address, web3) => {
  const tokenContract = new web3.eth.Contract(
    [
      {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [
          {
            name: '',
            type: 'uint8'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ],
    address
  );
  return await tokenContract.methods.decimals().call();
};

const getCoingeckoPlatform = (network) => {
  switch (network) {
    case 'ethereum':
      return 'ethereum';
    case 'fantom':
      return 'fantom';
    case 'polygon':
      return 'polygon-pos';
    case 'avalanche':
      return 'avalanche';
    case 'binance':
      return 'binance-smart-chain';
  }
};

const getTrustWalletBlockchainName = (network) => {
  switch (network) {
    case 'avalanche':
      return 'avalanchec';
    case 'binance':
      return 'smartchain';
    default:
      return network;
  }
};

const alsoIncludedTokens = {
  ethereum: [
    {
      id: '0x383518188c0c6d7730d91b2c03a03c837814a899',
      decimals: 9,
      symbol: 'OHM',
      name: 'Olympus'
    }, // OHM
    {
      id: '0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f',
      decimals: 9,
      symbol: 'sOHM',
      name: 'Staked Olympus'
    }, // SOHM
    {
      id: '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f',
      decimals: 18,
      symbol: 'gOHM',
      name: 'Governance OHM'
    }, // GOHM
    {
      id: '0x8cd309e14575203535ef120b5b0ab4dded0c2073'
    }, // WSOHM (rebrand?)
    {
      id: '0x090185f2135308bad17527004364ebcc2d37e5f6',
      decimals: 18,
      symbol: 'SPELL',
      name: 'Spell Token'
    }, // SPELL
    {
      id: '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',
      decimals: 18,
      symbol: 'AXS',
      name: 'Axie Infinity Shard'
    }, // AXS
    {
      id: '0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25'
    }, // SLP (MIGRATED? decimals = 0 in contract)
    {
      id: '0x6bb61215298f296c55b19ad842d3df69021da2ef',
      decimals: 18,
      symbol: 'DOP',
      name: 'Drops Ownership Power'
    }, // DOP
    {
      id: '0x9813037ee2218799597d83d4a5b6f3b6778218d9',
      decimals: 18,
      symbol: 'BONE',
      name: 'BONE SHIBASWAP'
    }, // BONE
    {
      id: '0x27c70cd1946795b66be9d954418546998b546634',
      decimals: 18,
      symbol: 'LEASH',
      name: 'DOGE KILLER'
    }, // LEASH
    {
      id: '0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a',
      decimals: 9,
      symbol: 'BTRFLY',
      name: 'BTRFLY'
    }, // BTRFLY
    {
      id: '0x4b16d95ddf1ae4fe8227ed7b7e80cf13275e61c9',
      decimals: 18,
      symbol: 'wxBTRFLY',
      name: 'wxBTRFLY'
    }, //wxBTRFLY
    {
      id: '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
      decimals: 18,
      symbol: 'TOKE',
      name: 'Tokemak'
    }, // TOKE
    {
      id: '0x000000007a58f5f58e697e51ab0357bc9e260a04',
      decimals: 18,
      symbol: 'CNV',
      name: 'Concave'
    }, // CNV
    {
      id: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
      decimals: 18,
      symbol: 'ALCX',
      name: 'Alchemix'
    }, // ALCX
    {
      id: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
      decimals: 18,
      symbol: 'alUSD',
      name: 'Alchemix USD'
    }, // alUSD
    {
      id: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
      decimals: 18,
      symbol: 'alETH',
      name: 'Alchemix ETH'
    }, // alETH
    {
      id: '0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35',
      decimals: 18,
      symbol: 'gALCX',
      name: 'governanceALCX'
    }, // gALCX
    {
      id: '0xf0f9D895aCa5c8678f706FB8216fa22957685A13',
      decimals: 18,
      symbol: 'CULT',
      name: 'Cult DAO'
    }, // CULT
    {
      id: '0x2d77B594B9BBaED03221F7c63Af8C4307432daF1',
      decimals: 18,
      symbol: 'dCULT',
      name: 'dCULT'
    }, // gCULT
    {
      id: '0x865377367054516e17014CcdED1e7d814EDC9ce4',
      decimals: 18,
      symbol: 'DOLA',
      name: 'Dola USD Stablecoin'
    }, // DOLA
    {
      id: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
      decimals: 18,
      symbol: 'agEUR',
      name: 'agEUR'
    }, // agEUR
    {
      id: '0x35872fea6A4843fACBCDbCe99e3B69596A3680b8',
      decimals: 4,
      symbol: '1337',
      name: '1337'
    }, // 1337
    {
      id: '0x9355372396e3F6daF13359B7b607a3374cc638e0',
      decimals: 4,
      symbol: 'WHALE',
      name: 'WHALE'
    }, // WHALE
    {
      id: '0xA392c35EC6900346aDEc720Abe50413F48Ee5143',
      decimals: 4,
      symbol: 'GENRE',
      name: 'GENRE'
    }, // GENRE
    {
      id: '0x1e906717De2E4A4600F13b6909736b0346bDde3E',
      decimals: 4,
      symbol: 'PIXEL',
      name: 'Pixel'
    },
    {
      id: '0xf552b656022c218C26dAd43ad88881Fc04116F76',
      decimals: 4,
      symbol: 'MORK',
      name: 'Mork'
    },
    {
      id: '0xE400013Df86249838B720eaB5a7F816aD82433c0',
      decimals: 4,
      symbol: 'GOB',
      name: 'Game Of Bitcoins'
    },
    {
      id: '0xE5f55a3b74874531a99359b833b92866A6609f6B',
      decimals: 4,
      symbol: 'ATS',
      name: 'All The Smoke'
    },
    {
      id: '0xdc8092AaF83e00Ebf9B01A2e90b7B7eF867ba503',
      decimals: 4,
      symbol: 'CALVIN',
      name: 'Calvin'
    },
    {
      id: '0x8BDfaE0F83a03F5fa98B0bDf339F56df3C9F8BD5',
      decimals: 18,
      symbol: 'AIN',
      name: 'AndjelaNadja'
    },
    {
      id: '0x78a0eE7ad08E2C746518387BeA867BE0199514B8',
      decimals: 4,
      symbol: 'MARTE',
      name: 'Marte'
    },
    {
      id: '0xe6710e0CdA178f3D921f456902707B0d4C4A332B',
      decimals: 4,
      symbol: 'JULIEN',
      name: 'Julien'
    },
    {
      id: '0x27fD686Db10E0aE047fe8FE1DE9830C0e0dC3CFA',
      decimals: 4,
      symbol: 'SCOTT',
      name: 'SCOTT'
    },
    {
      id: '0xA809CeDeE9B61956c768EAa10272dd5E0FD1A985',
      decimals: 4,
      symbol: 'CAMI',
      name: 'CAMI'
    },
    {
      id: '0xFAD44249C2cd1F661BAc5f97C2Ff9f625ce27197',
      decimals: 4,
      symbol: 'GREY',
      name: 'GREY'
    },
    {
      id: '0x56687cf29Ac9751Ce2a4E764680B6aD7E668942e',
      decimals: 4,
      symbol: 'JAMM',
      name: 'FlynnJamm'
    },
    {
      id: '0xBcc66ed2aB491e9aE7Bf8386541Fb17421Fa9d35',
      decimals: 4,
      symbol: 'SKULL',
      name: 'Skull'
    },
    {
      id: '0x6da447a8992eC6580f398C5BAAf5fc5d30ddD08F',
      decimals: 18,
      symbol: 'TIDE',
      name: 'Tide'
    },
    {
      id: '0x7841B2A48D1F6e78ACeC359FEd6D874Eb8a0f63c',
      decimals: 4,
      symbol: 'KERMAN',
      name: 'KERMAN'
    },
    {
      id: '0x3C9Ca73d5309d38c6F2C21b78b9aE1f4b2441188',
      decimals: 4,
      symbol: 'RDR',
      name: 'RADAR'
    },
    {
      id: '0x2Ad128fBEFF2B781D028148DEc82bBe2498Dc08e',
      decimals: 4,
      symbol: 'LIFE',
      name: 'LIFE'
    },
    {
      id: '0x833E4c02c47B7e38f5b9A80b26eb07D23d1961f4',
      decimals: 4,
      symbol: 'FAMILY',
      name: 'The Bitcoin Family'
    },
    {
      id: '0x4317Ea4820F8D9ea6A103553A89Cb261B6Ea7F2a',
      decimals: 4,
      symbol: 'ALXO',
      name: 'Alxocity'
    },
    {
      id: '0xDcfE18bc46f5A0Cd0d3Af0c2155d2bCB5AdE2fc5',
      decimals: 4,
      symbol: 'HUE',
      name: 'Hue'
    },
    {
      id: '0x39Ad22C916F42aF5f67371d6f2Fb0dab42321a89',
      decimals: 4,
      symbol: 'OSINA',
      name: 'Osinachi'
    },
    {
      id: '0x1287c0509df9a475Ef178471aB2132b9dfD312B3',
      decimals: 4,
      symbol: 'LADZ',
      name: 'LADZ'
    },
    {
      id: '0x25859743ED0861665611B81E47682e889b48313B',
      decimals: 4,
      symbol: 'YUMI',
      name: 'Yumi'
    },
    {
      id: '0x81B1bFD6CB9Ad42DB395c2a27F73D4DCf5777e2D',
      decimals: 4,
      symbol: 'RARE',
      name: 'Rare'
    },
    {
      id: '0xAf162491C0B21900C01F4Cc0F7110238AAcdebE7',
      decimals: 4,
      symbol: 'BEAR',
      name: 'arcane bear'
    },
    {
      id: '0xA9248F8e40d4b9c3Ca8ebd8E07E9BCB942C616d8',
      decimals: 4,
      symbol: 'ARKE',
      name: 'ARKE'
    },
    {
      id: '0xa19A40FbD7375431fAB013a4B08F00871B9a2791',
      decimals: 4,
      symbol: 'SWAGG',
      name: 'SWAGG'
    },
    {
      id: '0xd1B183f425F7E6A0C83aB1cd84cFDE2d84Ba049d',
      decimals: 4,
      symbol: 'TING',
      name: 'Tingles'
    },
    {
      id: '0x537A9095b78517597b5f2058EDcd6E1978095909',
      decimals: 4,
      symbol: 'DSGN',
      name: 'Design'
    },
    {
      id: '0x1eCe1739DAE08253aE582C404511B37355B42C84',
      decimals: 4,
      symbol: 'PICA',
      name: 'PICA'
    },
    {
      id: '0x862caA11AbE48c945D5361E80EaF19348C479240',
      decimals: 4,
      symbol: 'HERO',
      name: 'HERO'
    },
    {
      id: '0xC1fB6C015fC535aBD331D3029De76a62e412Fb23',
      decimals: 4,
      symbol: 'FORCER',
      name: 'Forcer'
    },
    {
      id: '0xF21D65979bD89b28f05EF19F3c65dd2A1D02946D',
      decimals: 4,
      symbol: 'BPC',
      name: 'BloodyPercent'
    },
    {
      id: '0x6BFfa07a1B0ceBC474cE6833eAf2bE6326252449',
      decimals: 4,
      symbol: 'BAEPAY',
      name: 'BAEPAY'
    },
    {
      id: '0x219803d17f3067eb53d521ba8948d2734f402f7d',
      decimals: 4,
      symbol: 'WGM',
      name: 'WGM'
    },
    {
      id: '0xbB98Fc1fD1080D2B8bdaD75c51D30B50c6F59b62',
      decimals: 4,
      symbol: 'PYGOZ',
      name: 'PYGOZ'
    },
    {
      id: '0xc53f6C2Ac35D30cc47Ddf3C320874b21dFA38791',
      decimals: 4,
      symbol: 'GCASH',
      name: 'Gcash'
    },
    {
      id: '0x3A75731f9e16244dE01DD431636Db7c07D42A166',
      decimals: 4,
      symbol: 'BONES',
      name: 'Bones'
    },
    {
      id: '0xDB7eB3edE973665b1BB9F3016861E3255062E4ED',
      decimals: 4,
      symbol: 'MNFT',
      name: 'MNFT'
    },
    {
      id: '0x9903A4Cd589DA8e434f264deAFc406836418578E',
      decimals: 4,
      symbol: 'FIRST',
      name: 'Harrison First'
    },
    {
      id: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
      decimals: 18,
      symbol: 'LDO',
      name: 'Lido DAO Token'
    }, // LDO
    {
      id: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      decimals: 18,
      symbol: 'stETH',
      name: 'Liquid staked Ether 2.0'
    }, // stETH
    {
      symbol: 'yvUSDC',
      id: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
      decimals: 6,
      name: 'USDC yVault'
    },
    {
      symbol: 'yvDAI',
      id: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
      decimals: 18,
      name: 'DAI yVault'
    },
    {
      symbol: 'yvWETH',
      id: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
      decimals: 18,
      name: 'WETH yVault'
    },
    {
      symbol: 'yvWBTC',
      id: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
      decimals: 8,
      name: 'WBTC yVault'
    },
    {
      symbol: 'yvSUSHI',
      id: '0x6d765CbE5bC922694afE112C140b8878b9FB0390',
      decimals: 18,
      name: 'SUSHI yVault'
    },
    {
      symbol: 'yvYFI',
      id: '0xdb25cA703181E7484a155DD612b06f57E12Be5F0',
      decimals: 18,
      name: 'YFI yVault'
    },
    {
      symbol: 'yvLUSD',
      id: '0x378cb52b00F9D0921cb46dFc099CFf73b42419dC',
      decimals: 18,
      name: 'LUSD yVault'
    },
    {
      symbol: 'yvSNX',
      id: '0xF29AE508698bDeF169B89834F76704C3B205aedf',
      decimals: 18,
      name: 'SNX yVault'
    },
    {
      symbol: 'yvAAVE',
      id: '0xd9788f3931Ede4D5018184E198699dC6d66C1915',
      decimals: 18,
      name: 'AAVE yVault'
    },
    {
      symbol: 'yvUNI',
      id: '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42',
      decimals: 18,
      name: 'UNI yVault'
    }
  ],
  fantom: [],
  polygon: [],
  avalanche: [],
  binance: []
};

const isDirEmpty = (dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
    return true;
  }
  const files = readdirSync(dir);
  return files.length === 0;
};

const progress = ({ method, stage, progress }) => {
  logger.info(`git.${method} ${stage} stage ${progress}% complete`);
};

const twDIR = './tw';
const repDIR = `${twDIR}/assets`;

const updateTrustwalletRepo = async () => {
  if (!isDirEmpty(twDIR)) {
    const pullResult = await simpleGit({ baseDir: repDIR, progress }).pull();
    logger.info('trustwallet git pull success:', pullResult.summary);
  } else {
    logger.warn(`Trustwallet folder (${twDIR}) is empty. Make git clone.`);
    await simpleGit({ baseDir: twDIR, progress }).clone(
      'git@github.com:trustwallet/assets.git'
    );
    await simpleGit({ baseDir: repDIR, progress }).checkout('master');
    logger.info('trustwallet git checkout success');
  }
};

const iterateOverAssets = async (network) => {
  let assetsAddresses = [];
  try {
    const files = await promises.readdir(
      `${repDIR}/blockchains/${getTrustWalletBlockchainName(network)}/assets`
    );
    let assetCount = 0;
    for (const file of files) {
      const fromPath = join(
        `${repDIR}/blockchains/${getTrustWalletBlockchainName(network)}/assets`,
        file
      );
      const stat = await promises.stat(fromPath);

      if (stat.isDirectory()) {
        const assetChecksumAddress = basename(fromPath);
        assetsAddresses.push(assetChecksumAddress);
        assetCount += 1;
      }
    }
    logger.info(`${assetCount} assets found`);
  } catch (err) {
    logger.error(
      `can't iterate over asset folder: ${err.message ? err.message : err}`
    );
  }
  return assetsAddresses;
};

const getCoingekoList = async () => {
  const allTokentsUrl =
    'https://api.coingecko.com/api/v3/coins/list?include_platform=true';
  return (await axios.get(allTokentsUrl)).data;
};

const getExtendedCoingeckoTokenData = async (id) => {
  try {
    if (id === undefined) {
      return undefined;
    }

    return (
      await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false&sparkline=false`
      )
    ).data;
  } catch (e) {
    logger.error(
      'failed to get extended info from coingecko for',
      id,
      e.message ?? e
    );
    return undefined;
  }
};

const getCoingekoMarketData = async (coingeckoIds) => {
  const marketUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingeckoIds.join(
    ','
  )}`;
  return (await axios.get(marketUrl)).data;
};

const getAssetImageColor = async (source, address) => {
  try {
    const palette = await Vibrant.from(source).getPalette();

    return palette.Vibrant ? palette.Vibrant.hex : undefined;
  } catch (e) {
    logger.warn(
      'failed to get color pallet for',
      address,
      e.message ? e.message : e
    );
  }
};

const enrichWithTWdata = async (assetAddresses, network) => {
  return assetAddresses.reduce(async (acc, address) => {
    const forceIncludedToken = alsoIncludedTokens[network].find(
      (t) => t.id.toLowerCase() === address.toLowerCase()
    );

    try {
      const buf = readFileSync(
        `${repDIR}/blockchains/${getTrustWalletBlockchainName(
          network
        )}/assets/${address}/info.json`,
        'utf8'
      );
      const info = JSON.parse(buf);
      if (info.status !== 'active' && !forceIncludedToken) {
        console.log(`Not active status (${info.status}) of token ${address}`);
        return await acc;
      }
      info.status = 'active';
      logger.info(`Add token: ${address}`);

      const imgPath = `${`${repDIR}/blockchains/${getTrustWalletBlockchainName(
        network
      )}/assets`}/${address}/logo.png`;
      if (existsSync(imgPath)) {
        const buffer = Buffer.from(readFileSync(imgPath));
        info.color = await getAssetImageColor(buffer, address);
      } else {
        logger.warn('logo file for', imgPath, 'does not exist');
      }

      return [...(await acc), info];
    } catch (e) {
      logger.warn(
        'failed to read info for, create an incomplete entry',
        address,
        e
      );

      if (forceIncludedToken) {
        return [...(await acc), forceIncludedToken];
      }

      const fallbackInfo = {
        isIncomplete: true,
        id: address
      };
      return [...(await acc), fallbackInfo];
    }
  }, []);
};

const enrichWithCoingeckoData = async (assets, network, web3) => {
  const platfrom = getCoingeckoPlatform(network);
  const coingeckoList = (await getCoingekoList()).filter(
    (c) => c?.platforms?.[platfrom]
  );

  console.log('Network:', network, 'coingecko list:', coingeckoList.length);
  let newAssets = [];

  if (network !== 'ethereum' && network !== 'binance') {
    for (let i = 0; i < coingeckoList.length; i++) {
      await new Promise((r) => setTimeout(r, 700));

      try {
        const coingeckoAsset = coingeckoList[i];
        const address = coingeckoAsset?.platforms?.[platfrom];

        const coingeckoExtendedToken = await getExtendedCoingeckoTokenData(
          coingeckoAsset?.id
        );

        if (coingeckoExtendedToken === undefined) {
          continue;
        }

        const data = {
          id: address,
          coingeckoId: coingeckoAsset.id,
          name: coingeckoAsset.name,
          symbol: coingeckoAsset.symbol.toUpperCase(),
          decimals: parseInt(await getDecimalsFromContract(address, web3)),
          status: 'active',
          type: 'ERC20',
          imageUrl: coingeckoExtendedToken.image?.large ?? undefined
        };

        data.color = await getAssetImageColor(data.imageUrl, address);

        console.log('added token from coingecko:', data);
        newAssets.push(data);
      } catch (err) {
        console.error("Can't add token from coingecko");
      }
    }
  }

  for (let i = 0; i < assets.length; i++) {
    const as = assets[i];
    const coingeckoAsset = coingeckoList.find((cas) => {
      return (
        (cas?.platforms?.[platfrom] ?? '').toLowerCase() ===
        (as?.id ?? '').toLowerCase()
      );
    });

    const address = coingeckoAsset?.platforms?.[platfrom];

    if (as.isIncomplete) {
      const coingeckoExtendedToken = await getExtendedCoingeckoTokenData(
        coingeckoAsset?.id
      );

      if (coingeckoExtendedToken === undefined) {
        logger.warn('failed to get remote info for', as.id);

        const forceIncludedToken = alsoIncludedTokens[network].find(
          (t) => t.id.toLowerCase() === as.id.toLowerCase()
        );

        if (forceIncludedToken) {
          newAssets.push({ ...forceIncludedToken });
        } else {
          newAssets.push({ ...as, coingeckoId: coingeckoAsset?.id });
        }
        continue;
      }

      const recoveredData = {
        ...as,
        isIncomplete: false,
        coingeckoId: coingeckoAsset.id,
        name: coingeckoAsset.name,
        decimals:
          as.decimals ?? parseInt(await getDecimalsFromContract(address, web3)),
        symbol: coingeckoAsset.symbol.toUpperCase(),
        description: coingeckoExtendedToken.description?.en ?? '',
        explorer:
          coingeckoExtendedToken?.links?.blockchain_site?.find((url) =>
            url.includes('etherscan.io/token/')
          ) ?? `https://etherscan.io/token/${as.id}`,
        status: 'active',
        type: 'ERC20',
        website:
          coingeckoExtendedToken.links?.homepage?.find((url) => !!url) ?? '',
        imageUrl: coingeckoExtendedToken.image?.large ?? undefined,
        color: undefined
      };

      if (recoveredData.imageUrl) {
        recoveredData.color = await getAssetImageColor(
          recoveredData.imageUrl,
          as.id
        );
      }

      delete recoveredData.isIncomplete;

      newAssets.push(recoveredData);
      continue;
    }

    newAssets.push({ ...as, coingeckoId: coingeckoAsset?.id });
  }
  return newAssets;
};

const enrichWithCoingeckoMarketData = async (assets) => {
  const chunk = 250;
  let res = [];
  for (let i = 0, j = assets.length; i < j; i += chunk) {
    const temporary = assets.slice(i, i + chunk);
    const coingeckoList = await getCoingekoMarketData(
      temporary.map((t) => t.coingeckoId).filter((t) => t !== undefined)
    );
    const enrichedAssets = temporary.map((as) => {
      const coingeckoMarketAsset = coingeckoList.find(
        (cma) => cma.id === as.coingeckoId
      );
      if (coingeckoMarketAsset?.market_cap !== undefined) {
        return { ...as, marketCap: coingeckoMarketAsset.market_cap };
      }
      return { ...as, marketCap: 0 };
    });
    res.push(...enrichedAssets);
  }

  return res;
};

const filterCompleteTokenData = (assets) => {
  return assets.filter(
    (asset) =>
      !asset.isIncomplete &&
      asset.decimals !== undefined &&
      asset.decimals !== null
  );
};

const preprocess = (assets) =>
  assets.map((asset) => ({
    id: asset.id,
    decimals: asset.decimals,
    symbol: asset.symbol,
    name: asset.name,
    ...(asset.imageUrl ? { imageUrl: asset.imageUrl } : undefined),
    ...(asset.color ? { color: asset.color } : undefined),
    ...(asset.marketCap ? { marketCap: asset.marketCap } : undefined)
  }));

const deduplicate = (tokens) => {
  const knownAddresses = new Set();
  return tokens.reduce((acc, t) => {
    if (knownAddresses.has(t.id.toLowerCase())) {
      return acc;
    }

    knownAddresses.add(t.id.toLowerCase());
    return acc.concat(t);
  }, []);
};

const sort = (assets) =>
  assets.slice().sort((a, b) => a.name.localeCompare(b.name));

const save = (assets, network) =>
  writeFileSync(
    `./data/assetList-${network}.json`,
    JSON.stringify(sort(deduplicate(preprocess(assets))))
  );

const getWeb3 = (network) => {
  let rpcUrl = undefined;
  switch (network) {
    case 'ethereum':
      rpcUrl = `https://mainnet.infura.io/v3/d7de8e7d8f364da0b0f4b4be9a1636fd`;
      break;
    case 'fantom':
      rpcUrl = 'https://rpc.ftm.tools/';
      break;
    case 'polygon':
      rpcUrl = 'https://polygon-rpc.com/';
      break;
    case 'avalanche':
      rpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
      break;
    case 'binance':
      rpcUrl = 'https://bsc-dataseed.binance.org/';
      break;
    default:
      throw new Error(`There is no RPC link for network: ${network}`);
  }
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  return web3;
};

const generateNewList = async () => {
  await updateTrustwalletRepo();
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    console.log('\n\nNETWORK:', network);

    const web3 = getWeb3(network);

    let assets = await iterateOverAssets(network);
    assets = Array.from(
      new Set([...assets, ...alsoIncludedTokens[network].map((a) => a.id)])
    );
    console.log('enriching...');
    assets = await enrichWithTWdata(assets, network);
    console.log('assets enriched with TW data length: ', assets.length);
    assets = await enrichWithCoingeckoData(assets, network, web3);
    console.log('assets enriched with Coingecko data length: ', assets.length);
    assets = await filterCompleteTokenData(assets);
    assets = await enrichWithCoingeckoMarketData(assets);
    save(assets, network);
  }
};

generateNewList().catch((e) => {
  logger.error('failed to create an asset list', e.message ? e.message : e);
});
