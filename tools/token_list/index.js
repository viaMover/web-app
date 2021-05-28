/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const simpleGit = require('simple-git/promise');
const path = require('path');

const isDirEmpty = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return true;
  }
  const files = fs.readdirSync(dir);
  return files.length === 0;
};

const twDIR = './tw';
const repDIR = `${twDIR}/assets`;
const twAssetFoler = `${repDIR}/blockchains/ethereum/assets`;

const updateTrustwalletRepo = async () => {
  if (!isDirEmpty(twDIR)) {
    const git = simpleGit.default(repDIR);
    const pullResult = await git.pull();
    console.log('trustwallet git pull success:', pullResult.summary);
  } else {
    console.log(`Trustwallet folder (${twDIR}) is empty. Make git clone.`);
    let git = simpleGit.default(twDIR);
    await git.clone('git@github.com:trustwallet/assets.git');
    git = simpleGit.default(repDIR);
    await git.checkout('master');
    console.log('trustwallet git checkout success');
  }
};

const iterateOverAssets = async () => {
  let assetsAddresses = [];
  try {
    const files = await fs.promises.readdir(twAssetFoler);
    let assetCount = 0;
    for (const file of files) {
      const fromPath = path.join(twAssetFoler, file);
      const stat = await fs.promises.stat(fromPath);

      if (stat.isDirectory()) {
        const assetChecksumAddress = path.basename(fromPath);
        assetsAddresses.push(assetChecksumAddress);
        //console.log("'%s' asset found", assetChecksumAddress);
        assetCount += 1;
      }
    }
    console.log("'%d' assets found", assetCount);
  } catch (err) {
    console.error(`can't iterate over asset folder: ${err}`);
  }
  return assetsAddresses;
};

updateTrustwalletRepo()
  .then(iterateOverAssets)
  .then((assetsAddresss) => {
    const assetList = assetsAddresss.reduce((acc, address) => {
      console.log('Add token: %s', address);
      const buf = fs.readFileSync(
        `${twAssetFoler}/${address}/info.json`,
        'utf8'
      );
      const info = JSON.parse(buf);
      acc.push(info);
      return acc;
    }, []);
    fs.writeFileSync('./data/assetList.json', JSON.stringify(assetList));
  });
