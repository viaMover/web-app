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

const networks = ['ethereum', 'fantom', 'polygon'];

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
    } // DOLA
  ],
  fantom: [],
  polygon: []
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
      `${repDIR}/blockchains/${network}/assets`
    );
    let assetCount = 0;
    for (const file of files) {
      const fromPath = join(`${repDIR}/blockchains/${network}/assets`, file);
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
    try {
      const buf = readFileSync(
        `${repDIR}/blockchains/${network}/assets/${address}/info.json`,
        'utf8'
      );
      const info = JSON.parse(buf);
      if (info.status !== 'active') {
        return await acc;
      }

      logger.info(`Add token: ${address}`);

      const imgPath = `${`${repDIR}/blockchains/${network}/assets`}/${address}/logo.png`;
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

  if (network !== 'ethereum') {
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
