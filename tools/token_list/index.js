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

const alsoIncludedAddresses = [
  '0x383518188c0c6d7730d91b2c03a03c837814a899', // OHM
  '0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f', // SOHM
  '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', // GOHM
  '0x8cd309e14575203535ef120b5b0ab4dded0c2073', // WSOHM
  '0x090185f2135308bad17527004364ebcc2d37e5f6', // SPELL
  '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b', // AXS
  '0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25', // SLP
  '0x6bb61215298f296c55b19ad842d3df69021da2ef', // DOP
  '0x9813037ee2218799597d83d4a5b6f3b6778218d9', // BONE
  '0x27c70cd1946795b66be9d954418546998b546634', // LEASH
  '0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a', // BTRFLY
  '0x4B16d95dDF1AE4Fe8227ed7B7E80CF13275e61c9' //wxBTRFLY
];

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
const twAssetFoler = `${repDIR}/blockchains/ethereum/assets`;

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

const iterateOverAssets = async () => {
  let assetsAddresses = [];
  try {
    const files = await promises.readdir(twAssetFoler);
    let assetCount = 0;
    for (const file of files) {
      const fromPath = join(twAssetFoler, file);
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

const getEthplorerTokenData = async (address, deep = 0) => {
  try {
    return (
      await axios.get(
        `https://api.ethplorer.io/getTokenInfo/${address}?apiKey=freekey`
      )
    ).data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 429) {
      if (deep > 2) {
        logger.error(
          'failed to get ethplorer info for',
          address,
          'recursion limit reached'
        );
        return undefined;
      }

      logger.warn('ethplorer api returns 429 for', address, 'waiting');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000);
      }).then(async () => await getEthplorerTokenData(address, deep + 1));
    }
    logger.error('failed to get ethplorer info for', address, e.message ?? e);
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

const enrichWithTWdata = async (assetAddresses) => {
  return assetAddresses.reduce(async (acc, address) => {
    try {
      const buf = readFileSync(`${twAssetFoler}/${address}/info.json`, 'utf8');
      const info = JSON.parse(buf);
      if (info.status !== 'active') {
        return await acc;
      }

      logger.info(`Add token: ${address}`);

      const imgPath = `${twAssetFoler}/${address}/logo.png`;
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
        address
      );
      const fallbackInfo = {
        isIncomplete: true,
        id: address
      };
      return [...(await acc), fallbackInfo];
    }
  }, []);
};

const enrichWithCoingeckoData = async (assets) => {
  const coingeckoList = (await getCoingekoList()).filter(
    (c) => c?.platforms?.ethereum
  );
  return await Promise.all(
    assets.map(async (as) => {
      const coingeckoAsset = coingeckoList.find((cas) => {
        return (
          (cas?.platforms?.ethereum ?? '').toLowerCase() ===
          (as?.id ?? '').toLowerCase()
        );
      });

      if (as.isIncomplete) {
        const [coingeckoExtendedToken, ethplorerToken] = await Promise.all([
          getExtendedCoingeckoTokenData(coingeckoAsset?.id),
          getEthplorerTokenData(as.id)
        ]);

        if (
          coingeckoExtendedToken === undefined ||
          ethplorerToken === undefined
        ) {
          logger.warn('failed to get remote info for', as.id);
          return as;
        }

        const recoveredData = {
          ...as,
          isIncomplete: false,
          coingeckoId: coingeckoAsset.id,
          name: coingeckoAsset.name,
          symbol: coingeckoAsset.symbol.toUpperCase(),
          description: coingeckoExtendedToken.description?.en ?? '',
          explorer:
            coingeckoExtendedToken?.links?.blockchain_site?.find((url) =>
              url.includes('etherscan.io/token/')
            ) ?? `https://etherscan.io/token/${as.id}`,
          status: 'active',
          type: 'ERC20',
          decimals: Number.parseInt(ethplorerToken.decimals),
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

        return recoveredData;
      }

      return { ...as, coingeckoId: coingeckoAsset?.id };
    })
  );
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
      if (coingeckoMarketAsset !== undefined) {
        return { ...as, marketCap: coingeckoMarketAsset.market_cap };
      }
      return { ...as, marketCap: 0 };
    });
    res.push(...enrichedAssets);
  }

  return res;
};

const filterCompleteTokenData = (assets) => {
  return assets.filter((asset) => !asset.isIncomplete);
};

const save = (assets) => {
  writeFileSync('./data/assetList.json', JSON.stringify(assets, null, 2));
};

const generateNewList = async () => {
  await updateTrustwalletRepo();
  let assets = await iterateOverAssets();
  assets = [...assets, ...alsoIncludedAddresses];
  assets = await enrichWithTWdata(assets);
  assets = await enrichWithCoingeckoData(assets);
  assets = await filterCompleteTokenData(assets);
  assets = await enrichWithCoingeckoMarketData(assets);
  save(assets);
};

generateNewList().catch((e) => {
  logger.error('failed to create an asset list', e.message ? e.message : e);
});
