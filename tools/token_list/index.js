import {
  existsSync,
  mkdirSync,
  readdirSync,
  promises,
  readFileSync,
  writeFileSync
} from 'fs';
import simpleGit from 'simple-git';
import { join, basename } from 'path';
import Vibrant from 'node-vibrant';
import logger from 'node-color-log';
import axios from 'axios';

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
  const coingeckoList = (await axios.get(allTokentsUrl)).data;
  return coingeckoList;
};

const getCoingekoMarketData = async (coingeckoIds) => {
  const marketUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingeckoIds.join(
    ','
  )}`;
  const coingeckoList = (await axios.get(marketUrl)).data;
  return coingeckoList;
};

const enrichWithTWdata = async (assetAddresses) => {
  return assetAddresses.reduce(async (acc, address) => {
    logger.info(`Add token: ${address}`);
    const buf = readFileSync(`${twAssetFoler}/${address}/info.json`, 'utf8');
    const info = JSON.parse(buf);
    if (info.status !== 'active') {
      return await acc;
    }

    const imgPath = `${twAssetFoler}/${address}/logo.png`;
    if (existsSync(imgPath)) {
      try {
        const buffer = Buffer.from(readFileSync(imgPath));
        const palette = await Vibrant.from(buffer).getPalette();

        info.color = palette.Vibrant ? palette.Vibrant.hex : undefined;
      } catch (e) {
        logger.warn(
          'failed to get color pallet for',
          imgPath,
          e.message ? e.message : e
        );
      }
    } else {
      logger.warn('logo file for', imgPath, 'does not exist');
    }

    return [...(await acc), info];
  }, []);
};

const enrichWithCoingeckoData = async (assets) => {
  const coingeckoList = await getCoingekoList();
  const enrichedAssets = assets.map((as) => {
    const coingeckoAsset = coingeckoList
      .filter((c) => c?.platforms?.ethereum)
      .find((cas) => {
        return (
          (cas?.platforms?.ethereum ?? '').toLowerCase() ===
          (as?.id ?? '').toLowerCase()
        );
      });
    if (coingeckoAsset !== undefined) {
      return { ...as, coingeckoId: coingeckoAsset.id };
    }
    return { ...as, coingeckoId: undefined };
  });
  return enrichedAssets;
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

const save = (assets) => {
  writeFileSync('./data/assetList.json', JSON.stringify(assets, null, 2));
};

const generateNewList = async () => {
  await updateTrustwalletRepo();
  let assets = await iterateOverAssets();
  assets = await enrichWithTWdata(assets);
  assets = await enrichWithCoingeckoData(assets);
  assets = await enrichWithCoingeckoMarketData(assets);
  save(assets);
};

generateNewList().catch((e) => {
  logger.error('failed to create an asset list', e.message ? e.message : e);
});
