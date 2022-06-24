import { sameAddress } from '@/utils/address';
import { toWei } from '@/utils/bigmath';
import { getNetwork, Network } from '@/utils/networkTypes';
import {
  getSimpleYearnVaultTokenByAddress,
  getSimpleYearnVaultTokens,
  isSimpleYearnVault
} from '@/wallet/references/yearnVaultsData';
import { SmallTokenInfo, SmallTokenInfoWithIcon, Token } from '@/wallet/types';

import BALANCE_CHECKER_ABI from './abi/balances-checker-abi.json';
import { getCentralTransferProxyAbi } from './abi/central-transfer-proxy';
import DCULT_ABI from './abi/dcult-abi.json';
import EARNINGS_ETHEREUM_ABI from './abi/earnings-ethereum-abi.json';
import EARNINGS_OLYMPUS_ABI from './abi/earnings-olympus-abi.json';
import ERC20_ABI from './abi/erc20-abi.json';
import ERC721_ABI from './abi/erc721-abi.json';
import GALCX_ABI from './abi/galcx-abi.json';
import HOLY_PASSAGE_ABI from './abi/holy-passage.json';
import HOLY_POOL_ABI from './abi/holy-pool.json';
import HOLY_VISOR_ABI from './abi/holy-visor.json';
import MASTER_CHEF_ABI from './abi/master-chef.json';
import NFT_BASELEDGER_STAKING_OG_ABI from './abi/nft-baseledger-staking-og.json';
import NFT_DICE_ABI from './abi/nft-dice.json';
import NFT_NIBBLE_SHOP_ABI from './abi/nft-nibble-shop.json';
import NFT_OLYMPUS_ABI from './abi/nft-olympus.json';
import NFT_ORDER_OF_LIBERTY_ABI from './abi/nft-order-of-liberty.json';
import NFT_RARI_ABI from './abi/nft-rari.json';
import NFT_SWEET_AND_SOUR_ABI from './abi/nft-sweet-and-sour.json';
import NFT_UNEXPECTED_MOVE_ABI from './abi/nft-unexpected-move.json';
import NFT_VAULTS_ABI from './abi/nft-vaults.json';
import POWERCARD_STAKER_ABI from './abi/powercard-staker.json';
import REVERSE_RECORDS_ABI from './abi/reverse-records-abi.json';
import SAVINGS_PLUS_POOL_ABI from './abi/savings-plus-pool-abi.json';
import SMART_TREASURY_ABI from './abi/smart-treasury.json';
import SUSHI_UNI_PAIR_V2_ABI from './abi/sushi-uni-pair-v2.json';
import UBT_STAKING_CONTRACT_ABI from './abi/ubt-staking-contract-abi.json';
import UNS_RESOLVER_CONTRACT_ABI from './abi/uns-resolver-contract-abi.json';
import WX_BTRFLY_ABI from './abi/wxbtrfly-abi.json';
import YEARN_SIMPLE_VAULT_ABI from './abi/yearn/simple_vault_token.json';

export type AddressMapKey =
  | 'MOVE_ADDRESS'
  | 'MOBO_ADDRESS'
  | 'HOLY_HAND_ADDRESS'
  | 'HOLY_PASSAGE_ADDRESS'
  | 'HOLY_SAVINGS_POOL_ADDRESS'
  | 'HOLY_VISOR_ADDRESS'
  | 'SMART_TREASURY_ADDRESS'
  | 'SUSHI_TOKEN_ADDRESS'
  | 'SUSHISWAP_MOVE_WETH_POOL_ADDRESS'
  | 'UNSIWAP_USDC_WETH_POOL_ADDRESS'
  | 'USDC_TOKEN_ADDRESS'
  | 'WETH_TOKEN_ADDRESS'
  | 'BALANCE_CHECKER_ADDRESS'
  | 'NFT_UNEXPECTED_MOVE'
  | 'NFT_SWEET_AND_SOUR'
  | 'NFT_OLYMPUS'
  | 'NFT_VAULTS'
  | 'NFT_DICE'
  | 'POWERCARD'
  | 'POWERCARD_STAKER'
  | 'MASTER_CHEF_ADDRESS'
  | 'EURS_TOKEN_ADDRESS'
  | 'UNISWAP_EURS_WETH_POOL_ADDRESS'
  | 'OHM_ADDRESS'
  | 'OHM_V2_ADDRESS'
  | 'ETH_V2_STAKER_POOL'
  | 'OHM_STAKER_POOL'
  | 'WBTC_TOKEN_ADDRESS'
  | 'RENBTC_TOKEN_ADDRESS'
  | 'UST_TOKEN_ADDRESS'
  | 'MIM_TOKEN_ADDRESS'
  | 'FRAX_TOKEN_ADDRESS'
  | 'RAI_TOKEN_ADDRESS'
  | 'FEI_TOKEN_ADDRESS'
  | 'USDT_TOKEN_ADDRESS'
  | 'SHIB_TOKEN_ADDRESS'
  | 'AXS_TOKEN_ADDRESS'
  | 'SLP_TOKEN_ADDRESS'
  | 'DOP_TOKEN_ADDRESS'
  | 'LEASH_TOKEN_ADDRESS'
  | 'BONE_TOKEN_ADDRESS'
  | 'BTRFLY_TOKEN_ADDRESS'
  | 'WX_BTRFLY_TOKEN_ADDRESS'
  | 'GOHM_TOKEN_ADDRESS'
  | 'TOKE_TOKEN_ADDRESS'
  | 'NFT_ORDER_OF_LIBERTY'
  | 'APE_TOKEN_ADDRESS'
  | 'UBT_TOKEN_ADDRESS'
  | 'STAKING_UBT_CONTRACT_ADDRESS'
  | 'CONCAVE_TOKEN_ADDRESS'
  | 'NFT_BASELEDGER_STAKING_OG'
  | 'ALCX_TOKEN_ADDRESS'
  | 'GALCX_TOKEN_ADDRESS'
  | 'AL_USD_TOKEN_ADDRESS'
  | 'AL_ETH_TOKEN_ADDRESS'
  | 'GTC_TOKEN_ADDRESS'
  | 'CULT_TOKEN_ADDRESS'
  | 'DOLA_TOKEN_ADDRESS'
  | 'DCULT_TOKEN_ADDRESS'
  | 'LUSD_TOKEN_ADDRESS'
  | 'SAVINGS_PLUS_POOL_ADDRESS'
  | 'AG_EUR_TOKEN_ADDRESS'
  | 'EXCHANGE_PROXY_ADDRESS'
  | 'AG_EUR_TOKEN_ADDRESS'
  | 'L33T_TOKEN_ADDRESS'
  | 'WHALE_TOKEN_ADDRESS'
  | 'GENRE_TOKEN_ADDRESS'
  | 'PIXEL_TOKEN_ADDRESS'
  | 'MORK_TOKEN_ADDRESS'
  | 'GOB_TOKEN_ADDRESS'
  | 'ATS_TOKEN_ADDRESS'
  | 'CALVIN_TOKEN_ADDRESS'
  | 'AIN_TOKEN_ADDRESS'
  | 'MARTE_TOKEN_ADDRESS'
  | 'JULIEN_TOKEN_ADDRESS'
  | 'SCOTT_TOKEN_ADDRESS'
  | 'CAMI_TOKEN_ADDRESS'
  | 'GREY_TOKEN_ADDRESS'
  | 'JAMM_TOKEN_ADDRESS'
  | 'SKULL_TOKEN_ADDRESS'
  | 'TIDE_TOKEN_ADDRESS'
  | 'KERMAN_TOKEN_ADDRESS'
  | 'RDR_TOKEN_ADDRESS'
  | 'LIFE_TOKEN_ADDRESS'
  | 'FAMILY_TOKEN_ADDRESS'
  | 'ALXO_TOKEN_ADDRESS'
  | 'HUE_TOKEN_ADDRESS'
  | 'OSINA_TOKEN_ADDRESS'
  | 'LADZ_TOKEN_ADDRESS'
  | 'YUMI_TOKEN_ADDRESS'
  | 'RARE_TOKEN_ADDRESS'
  | 'BEAR_TOKEN_ADDRESS'
  | 'ARKE_TOKEN_ADDRESS'
  | 'SWAGG_TOKEN_ADDRESS'
  | 'TING_TOKEN_ADDRESS'
  | 'DSGN_TOKEN_ADDRESS'
  | 'PICA_TOKEN_ADDRESS'
  | 'HERO_TOKEN_ADDRESS'
  | 'FORCER_TOKEN_ADDRESS'
  | 'BPC_TOKEN_ADDRESS'
  | 'BAEPAY_TOKEN_ADDRESS'
  | 'WGM_TOKEN_ADDRESS'
  | 'PYGOZ_TOKEN_ADDRESS'
  | 'GCASH_TOKEN_ADDRESS'
  | 'BONES_TOKEN_ADDRESS'
  | 'MNFT_TOKEN_ADDRESS'
  | 'FIRST_TOKEN_ADDRESS'
  | 'LDO_TOKEN_ADDRESS'
  | 'ST_ETH_TOKEN_ADDRESS'
  | 'ENS_REVERSE_RECORDS_CONTRACT'
  | 'ENS_NFT_CONTRACT'
  | 'UNS_RESOLVER_CONTRACT'
  | 'EXCHANGE_PROXY_ADDRESS';

type AddressMapNetworkEntry = Readonly<Record<AddressMapKey, string>>;
type AddressMap = Readonly<Record<Network, AddressMapNetworkEntry>>;

const addresses = {
  [Network.mainnet]: {
    MOVE_ADDRESS: '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C',
    MOBO_ADDRESS: '0x94f748bfd1483750a7df01acd993213ab64c960f',
    HOLY_HAND_ADDRESS: '0x1eF7A557cfA8436ee08790e3F2b190b8937fDa0E',
    HOLY_PASSAGE_ADDRESS: '0x39ac24FD08991B1d69A9ef7189Bc718C988fF5B3',
    HOLY_SAVINGS_POOL_ADDRESS: '0xAF985437DCA19DEFf89e61F83Cd526b272523719',
    HOLY_VISOR_ADDRESS: '0x636356f857f89AF15Cb67735b68B9b673b5Cda6c',
    SMART_TREASURY_ADDRESS: '0x94F748BfD1483750a7dF01aCD993213Ab64C960F',
    SUSHI_TOKEN_ADDRESS: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS:
      '0x87b918e76c92818DB0c76a4E174447aeE6E6D23f',
    UNSIWAP_USDC_WETH_POOL_ADDRESS:
      '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    BALANCE_CHECKER_ADDRESS: '0x4dcf4562268dd384fe814c00fad239f06c2a0c2b',
    NFT_UNEXPECTED_MOVE: '0x0769747d4cac06bc2320e0bb1efb31d53fa0aaa1',
    NFT_SWEET_AND_SOUR: '0x129b9083a9f02aed65e31644a8103d5aa2c73701',
    NFT_OLYMPUS: '0x2733a766d2d79d26b2d23343db5bf38290f67f22',
    NFT_VAULTS: '0x0B7438606a13f4e91305b36B7596dDA4679689e3',
    NFT_DICE: '0xB75acecE1F77fe7059cFff8eF76F73b7E999EDD2',
    POWERCARD: '0xd07dc4262bcdbf85190c01c996b4c06a461d2430',
    POWERCARD_STAKER: '0xa8AFB8272434f76f9cD0Fd483F15C69AAF9a2E68',
    MASTER_CHEF_ADDRESS: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd',
    EURS_TOKEN_ADDRESS: '0xdb25f211ab05b1c97d595516f45794528a807ad8',
    UNISWAP_EURS_WETH_POOL_ADDRESS:
      '0x7cc34ea5d7103d01b76e0dccf1ddad9f376801e9',
    OHM_ADDRESS: '0x383518188c0c6d7730d91b2c03a03c837814a899',
    OHM_V2_ADDRESS: '0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5',
    WBTC_TOKEN_ADDRESS: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    RENBTC_TOKEN_ADDRESS: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    UST_TOKEN_ADDRESS: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
    MIM_TOKEN_ADDRESS: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
    FRAX_TOKEN_ADDRESS: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    RAI_TOKEN_ADDRESS: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
    FEI_TOKEN_ADDRESS: '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
    USDT_TOKEN_ADDRESS: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    SHIB_TOKEN_ADDRESS: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    AXS_TOKEN_ADDRESS: '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',
    SLP_TOKEN_ADDRESS: '0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25',
    DOP_TOKEN_ADDRESS: '0x6bb61215298f296c55b19ad842d3df69021da2ef',
    LEASH_TOKEN_ADDRESS: '0x27c70cd1946795b66be9d954418546998b546634',
    BONE_TOKEN_ADDRESS: '0x9813037ee2218799597d83d4a5b6f3b6778218d9',
    BTRFLY_TOKEN_ADDRESS: '0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a',
    WX_BTRFLY_TOKEN_ADDRESS: '0x4B16d95dDF1AE4Fe8227ed7B7E80CF13275e61c9',
    GOHM_TOKEN_ADDRESS: '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f',
    TOKE_TOKEN_ADDRESS: '0x2e9d63788249371f1dfc918a52f8d799f4a38c94',
    APE_TOKEN_ADDRESS: '0x4d224452801aced8b2f0aebe155379bb5d594381',
    UBT_TOKEN_ADDRESS: '0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e',
    NFT_ORDER_OF_LIBERTY: '0xebFB3B9f34307De7a72eDdA8696c1E14e0f41d8b',
    STAKING_UBT_CONTRACT_ADDRESS: '0x1f15F293C1Cd3d05d58d3EdeAf0C72c5A2dfeaFf',
    CONCAVE_TOKEN_ADDRESS: '0x000000007a58f5f58E697e51Ab0357BC9e260A04',
    AL_ETH_TOKEN_ADDRESS: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
    AL_USD_TOKEN_ADDRESS: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
    ALCX_TOKEN_ADDRESS: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',
    GALCX_TOKEN_ADDRESS: '0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35',
    GTC_TOKEN_ADDRESS: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',
    CULT_TOKEN_ADDRESS: '0xf0f9D895aCa5c8678f706FB8216fa22957685A13',
    DOLA_TOKEN_ADDRESS: '0x865377367054516e17014CcdED1e7d814EDC9ce4',
    DCULT_TOKEN_ADDRESS: '0x2d77B594B9BBaED03221F7c63Af8C4307432daF1',
    LUSD_TOKEN_ADDRESS: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
    AG_EUR_TOKEN_ADDRESS: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
    L33T_TOKEN_ADDRESS: '0x35872fea6A4843fACBCDbCe99e3B69596A3680b8',
    WHALE_TOKEN_ADDRESS: '0x9355372396e3F6daF13359B7b607a3374cc638e0',
    GENRE_TOKEN_ADDRESS: '0xA392c35EC6900346aDEc720Abe50413F48Ee5143',
    PIXEL_TOKEN_ADDRESS: '0x1e906717De2E4A4600F13b6909736b0346bDde3E',
    MORK_TOKEN_ADDRESS: '0xf552b656022c218C26dAd43ad88881Fc04116F76',
    GOB_TOKEN_ADDRESS: '0xE400013Df86249838B720eaB5a7F816aD82433c0',
    ATS_TOKEN_ADDRESS: '0xE5f55a3b74874531a99359b833b92866A6609f6B',
    CALVIN_TOKEN_ADDRESS: '0xdc8092AaF83e00Ebf9B01A2e90b7B7eF867ba503',
    AIN_TOKEN_ADDRESS: '0x8BDfaE0F83a03F5fa98B0bDf339F56df3C9F8BD5',
    MARTE_TOKEN_ADDRESS: '0x78a0eE7ad08E2C746518387BeA867BE0199514B8',
    JULIEN_TOKEN_ADDRESS: '0xe6710e0CdA178f3D921f456902707B0d4C4A332B',
    SCOTT_TOKEN_ADDRESS: '0x27fD686Db10E0aE047fe8FE1DE9830C0e0dC3CFA',
    CAMI_TOKEN_ADDRESS: '0xA809CeDeE9B61956c768EAa10272dd5E0FD1A985',
    GREY_TOKEN_ADDRESS: '0xFAD44249C2cd1F661BAc5f97C2Ff9f625ce27197',
    JAMM_TOKEN_ADDRESS: '0x56687cf29Ac9751Ce2a4E764680B6aD7E668942e',
    SKULL_TOKEN_ADDRESS: '0xBcc66ed2aB491e9aE7Bf8386541Fb17421Fa9d35',
    TIDE_TOKEN_ADDRESS: '0x6da447a8992eC6580f398C5BAAf5fc5d30ddD08F',
    KERMAN_TOKEN_ADDRESS: '0x7841B2A48D1F6e78ACeC359FEd6D874Eb8a0f63c',
    RDR_TOKEN_ADDRESS: '0x3C9Ca73d5309d38c6F2C21b78b9aE1f4b2441188',
    LIFE_TOKEN_ADDRESS: '0x2Ad128fBEFF2B781D028148DEc82bBe2498Dc08e',
    FAMILY_TOKEN_ADDRESS: '0x833E4c02c47B7e38f5b9A80b26eb07D23d1961f4',
    ALXO_TOKEN_ADDRESS: '0x4317Ea4820F8D9ea6A103553A89Cb261B6Ea7F2a',
    HUE_TOKEN_ADDRESS: '0xDcfE18bc46f5A0Cd0d3Af0c2155d2bCB5AdE2fc5',
    OSINA_TOKEN_ADDRESS: '0x39Ad22C916F42aF5f67371d6f2Fb0dab42321a89',
    LADZ_TOKEN_ADDRESS: '0x1287c0509df9a475Ef178471aB2132b9dfD312B3',
    YUMI_TOKEN_ADDRESS: '0x25859743ED0861665611B81E47682e889b48313B',
    RARE_TOKEN_ADDRESS: '0x81B1bFD6CB9Ad42DB395c2a27F73D4DCf5777e2D',
    BEAR_TOKEN_ADDRESS: '0xAf162491C0B21900C01F4Cc0F7110238AAcdebE7',
    ARKE_TOKEN_ADDRESS: '0xA9248F8e40d4b9c3Ca8ebd8E07E9BCB942C616d8',
    SWAGG_TOKEN_ADDRESS: '0xa19A40FbD7375431fAB013a4B08F00871B9a2791',
    TING_TOKEN_ADDRESS: '0xd1B183f425F7E6A0C83aB1cd84cFDE2d84Ba049d',
    DSGN_TOKEN_ADDRESS: '0x537A9095b78517597b5f2058EDcd6E1978095909',
    PICA_TOKEN_ADDRESS: '0x1eCe1739DAE08253aE582C404511B37355B42C84',
    HERO_TOKEN_ADDRESS: '0x862caA11AbE48c945D5361E80EaF19348C479240',
    FORCER_TOKEN_ADDRESS: '0xC1fB6C015fC535aBD331D3029De76a62e412Fb23',
    BPC_TOKEN_ADDRESS: '0xF21D65979bD89b28f05EF19F3c65dd2A1D02946D',
    BAEPAY_TOKEN_ADDRESS: '0x6BFfa07a1B0ceBC474cE6833eAf2bE6326252449',
    WGM_TOKEN_ADDRESS: '0x219803d17f3067eb53d521ba8948d2734f402f7d',
    PYGOZ_TOKEN_ADDRESS: '0xbB98Fc1fD1080D2B8bdaD75c51D30B50c6F59b62',
    GCASH_TOKEN_ADDRESS: '0xc53f6C2Ac35D30cc47Ddf3C320874b21dFA38791',
    BONES_TOKEN_ADDRESS: '0x3A75731f9e16244dE01DD431636Db7c07D42A166',
    MNFT_TOKEN_ADDRESS: '0xDB7eB3edE973665b1BB9F3016861E3255062E4ED',
    FIRST_TOKEN_ADDRESS: '0x9903A4Cd589DA8e434f264deAFc406836418578E',
    LDO_TOKEN_ADDRESS: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    ST_ETH_TOKEN_ADDRESS: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    ENS_REVERSE_RECORDS_CONTRACT: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C',
    ENS_NFT_CONTRACT: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    UNS_RESOLVER_CONTRACT: '0x049aba7510f45BA5b64ea9E658E342F904DB358D'
  },
  [Network.ropsten]: {
    MOVE_ADDRESS: '0x3B055b3c00E8e27bB84a1E98391443Bff4049129',
    HOLY_PASSAGE_ADDRESS: '0xf413F5b36C3c9C121d2b66858382F0368678CAc1',
    HOLY_SAVINGS_POOL_ADDRESS: '0x39e0Efd667c5760ec98F105eEAd8F8a77d608108',
    HOLY_VISOR_ADDRESS: '0x5c2508fd52DA2AB53361BD24B374bE35ed8cdCF0',
    USDC_TOKEN_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH_TOKEN_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    BALANCE_CHECKER_ADDRESS: '0xf17adbb5094639142ca1c2add4ce0a0ef146c3f9',
    ENS_REVERSE_RECORDS_CONTRACT: '0x72c33B247e62d0f1927E8d325d0358b8f9971C68',
    ENS_NFT_CONTRACT: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  },
  [Network.rinkeby]: {
    USDC_TOKEN_ADDRESS: '0xb6c8e5f00117136571d260bfb1baff62ddfd9960',
    BALANCE_CHECKER_ADDRESS: '0xc55386617db7b4021d87750daaed485eb3ab0154',
    NFT_DICE: '0x2253067F3AF865abD7e279f80e272B89ae054134',
    ENS_REVERSE_RECORDS_CONTRACT: '0x196eC7109e127A353B709a20da25052617295F6f',
    ENS_NFT_CONTRACT: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  },
  [Network.kovan]: {
    MOVE_ADDRESS: '0xF6e1AC0Fd5d90963624124fd20f8A209489D3621',
    HOLY_HAND_ADDRESS: '0xA5D1f7a25377187E6c7d0A464D1e51D3Aa697B41',
    HOLY_SAVINGS_POOL_ADDRESS: '0x8967A200c69136B7c8C768dC9AB58F2e295aD771',
    SMART_TREASURY_ADDRESS: '0xdD17122a055588242c0bF2e6ED84145F4A1e2e40',
    SUSHISWAP_MOVE_WETH_POOL_ADDRESS:
      '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
    USDC_TOKEN_ADDRESS: '0x75b0622cec14130172eae9cf166b92e5c112faff',
    BALANCE_CHECKER_ADDRESS: '0xf3352813b612a2d198e437691557069316b84ebe',
    NFT_UNEXPECTED_MOVE: '0x05425c5e19456c6b2773C3595fCf56cC469902AF',
    NFT_SWEET_AND_SOUR: '0x164c1cc343b6a45eDb37F0dD7558FdCddF173c82',
    NFT_OLYMPUS: '0x125601b455fDdceD0d008ED007bF5eAe361c9EFf'
  },
  [Network.polygon]: {
    MOVE_ADDRESS: '0x521CddC0CBa84F14c69C1E99249F781AA73Ee0BC',
    USDC_TOKEN_ADDRESS: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    WETH_TOKEN_ADDRESS: '0xAe740d42E4ff0C5086b2b5b5d149eB2F9e1A754F',
    BALANCE_CHECKER_ADDRESS: '0x9eC70CEa6Ae472a2cdacD5d4A580eC43548c9Afb',
    NFT_ORDER_OF_LIBERTY: '0x34082fA0229979fFD8E6c327ce462eD6d619F9a2',
    HOLY_HAND_ADDRESS: '0x568f6dc40b2520522dc4745d881c990e57672d94',
    UBT_TOKEN_ADDRESS: '0x7fbc10850cae055b27039af31bd258430e714c62',
    NFT_BASELEDGER_STAKING_OG: '0x2784c71d7F406232bcE50A724c64c7104fA516D8',
    SAVINGS_PLUS_POOL_ADDRESS: '0x77D5333d97A092cA01A783468E53E550C379dc3C',
    UNS_RESOLVER_CONTRACT: '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f'
  },
  [Network.binance]: {
    USDC_TOKEN_ADDRESS: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    WETH_TOKEN_ADDRESS: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    BALANCE_CHECKER_ADDRESS: '0x9eC70CEa6Ae472a2cdacD5d4A580eC43548c9Afb'
  },
  [Network.binanceTest]: {
    USDC_TOKEN_ADDRESS: '0x64544969ed7ebf5f083679233325356ebe738930',
    WETH_TOKEN_ADDRESS: '0xf670e09e0221a4100fbc83f4f49eda6e7bc923b0',
    BALANCE_CHECKER_ADDRESS: '0x9eC70CEa6Ae472a2cdacD5d4A580eC43548c9Afb'
  },
  [Network.fantom]: {
    NFT_ORDER_OF_LIBERTY: '0x568F6DC40B2520522dC4745D881c990e57672d94',
    HOLY_HAND_ADDRESS: '0xFDB9B2a9E3A94be3Bd134F6066065cccEa89926B',
    USDC_TOKEN_ADDRESS: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'
  },
  [Network.avalanche]: {
    HOLY_HAND_ADDRESS: '0x4632F0a161216Fda13f4beCe327516cC9c5357d0',
    USDC_TOKEN_ADDRESS: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664'
  },
  [Network.binance]: {
    HOLY_HAND_ADDRESS: '0x34082fA0229979fFD8E6c327ce462eD6d619F9a2',
    USDC_TOKEN_ADDRESS: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
  },
  [Network.arbitrum]: {
    HOLY_HAND_ADDRESS: '0x34082fa0229979ffd8e6c327ce462ed6d619f9a2',
    EXCHANGE_PROXY_ADDRESS: '0x4632F0a161216Fda13f4beCe327516cC9c5357d0',
    USDC_TOKEN_ADDRESS: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
  }
} as AddressMap;

const defaultSlippage = '10'; // 10%
const defaultAddress = '0x1';
export const lookupAddress = <K extends AddressMapKey, N extends Network>(
  network: N,
  key: K
): string => {
  return addresses[network]?.[key] ?? defaultAddress;
};

export const isDefaultAddress = (address?: string | null): boolean => {
  return address === defaultAddress;
};

const getBaseAssetData = (
  network: Network
): SmallTokenInfoWithIcon & {
  name: string;
} => {
  return (
    getNetwork(network)?.baseAsset ?? {
      address: 'eth',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ethereum',
      iconURL:
        'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/info/logo.png'
    }
  );
};

type ConstantsMapNetworkEntry = Readonly<{
  MASTER_CHEF_POOL_INDEX: number;
  POWERCARD_RARI_ID: number;
  ORDER_OF_LIBERTY_DEFAULT_PRICE: string;
  ORDER_OF_LIBERTY_AVAILABLE_PRICES: Array<string>;
  SUBSIDIZED_WALLET_ADDRESSES: Array<string>;
  CUSTOM_TOKEN_SLIPPAGE: Map<string, string>;
  USDC_SPECIFIC_DECIMALS: number;
}>;
type ConstantsMap = Readonly<Record<Network, ConstantsMapNetworkEntry>>;

const constants = {
  [Network.mainnet]: {
    MASTER_CHEF_POOL_INDEX: 257,
    POWERCARD_RARI_ID: 107150,
    ORDER_OF_LIBERTY_DEFAULT_PRICE: toWei(
      '0.1',
      getBaseAssetData(Network.mainnet).decimals
    ),
    ORDER_OF_LIBERTY_AVAILABLE_PRICES: [
      toWei('1', getBaseAssetData(Network.mainnet).decimals),
      toWei('10', getBaseAssetData(Network.mainnet).decimals)
    ],
    SUBSIDIZED_WALLET_ADDRESSES: [
      '0x213793865Aca451B28fB15bf940b2b7E3aDd34a5',
      '0x70Fb7f7840bD33635a7e33792F2bBeBDCde19889',
      '0xdAc8619CD25a6FEDA197e354235c3bBA7d847b90'
    ],
    CUSTOM_TOKEN_SLIPPAGE: new Map<string, string>([
      ['0xf0f9d895aca5c8678f706fb8216fa22957685a13', '25']
    ])
  },
  [Network.fantom]: {
    ORDER_OF_LIBERTY_DEFAULT_PRICE: toWei(
      '10',
      getBaseAssetData(Network.fantom).decimals
    ),
    ORDER_OF_LIBERTY_AVAILABLE_PRICES: [
      toWei('100', getBaseAssetData(Network.fantom).decimals),
      toWei('1000', getBaseAssetData(Network.fantom).decimals)
    ]
  },
  [Network.polygon]: {
    ORDER_OF_LIBERTY_DEFAULT_PRICE: toWei(
      '10',
      getBaseAssetData(Network.polygon).decimals
    ),
    ORDER_OF_LIBERTY_AVAILABLE_PRICES: [
      toWei('100', getBaseAssetData(Network.polygon).decimals),
      toWei('1000', getBaseAssetData(Network.polygon).decimals)
    ]
  },
  [Network.binance]: {
    USDC_SPECIFIC_DECIMALS: 18
  }
} as ConstantsMap;
export const lookupConstant = <
  N extends Network,
  K extends keyof ConstantsMap[N]
>(
  network: N,
  key: K
): ConstantsMap[N][K] | undefined => {
  return constants[network]?.[key];
};

export const isSubsidizedWalletAddress = (
  network: Network,
  address?: string | null
): boolean => {
  return (
    lookupConstant(network, 'SUBSIDIZED_WALLET_ADDRESSES')?.some(
      (wallet: string) => sameAddress(wallet, address)
    ) ?? false
  );
};

const getMoveAssetData = (
  network: Network
): SmallTokenInfoWithIcon & {
  name: string;
} => {
  return {
    address: lookupAddress(network, 'MOVE_ADDRESS'),
    decimals: 18,
    symbol: 'MOVE',
    name: 'Mover',
    iconURL:
      'https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C/logo.png'
  };
};

const getMoboAssetData = (
  network: Network
): SmallTokenInfoWithIcon & {
  name: string;
} => {
  return {
    address: lookupAddress(network, 'MOBO_ADDRESS'),
    decimals: 6,
    symbol: 'MOBO',
    name: 'Mover Bonus Token',
    iconURL: ''
  };
};

const getBTRFLYAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: lookupAddress(network, 'BTRFLY_TOKEN_ADDRESS'),
    decimals: 9,
    symbol: 'BTRFLY',
    iconURL:
      'https://assets.coingecko.com/coins/images/21718/small/3.png?1640248507'
  };
};

const getALCXAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: lookupAddress(network, 'ALCX_TOKEN_ADDRESS'),
    decimals: 18,
    symbol: 'ALCX',
    iconURL:
      'https://assets.coingecko.com/coins/images/14113/small/Alchemix.png'
  };
};

const getCULTAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: lookupAddress(network, 'CULT_TOKEN_ADDRESS'),
    decimals: 18,
    symbol: 'CULT',
    iconURL:
      'https://assets.coingecko.com/coins/images/23331/small/quxZPrbC_400x400.jpg'
  };
};

const getMoveWethLPAssetData = (network: Network): SmallTokenInfo => {
  return {
    address: lookupAddress(network, 'SUSHISWAP_MOVE_WETH_POOL_ADDRESS'),
    decimals: 18,
    symbol: 'SLP'
  };
};

const getOhmAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: lookupAddress(network, 'OHM_ADDRESS'),
    symbol: 'OHM',
    decimals: 9,
    iconURL:
      'https://assets.coingecko.com/coins/images/14483/large/token_OHM_%281%29.png?1628311611'
  };
};

const getUSDCAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: lookupAddress(network, 'USDC_TOKEN_ADDRESS'),
    decimals: lookupConstant(network, 'USDC_SPECIFIC_DECIMALS') ?? 6,
    symbol: 'USDC',
    iconURL:
      'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
  };
};

const getEURSAssetData = (network: Network): SmallTokenInfoWithIcon => {
  return {
    address: lookupAddress(network, 'EURS_TOKEN_ADDRESS'),
    decimals: 2,
    symbol: 'EURS',
    iconURL:
      'https://token-icons.s3.amazonaws.com/0xdb25f211ab05b1c97d595516f45794528a807ad8.png'
  };
};

const getUBTAssetData = (
  network: Network
): SmallTokenInfoWithIcon & { name: string } => {
  return {
    address: lookupAddress(network, 'UBT_TOKEN_ADDRESS'),
    decimals: 8,
    symbol: 'UBT',
    name: 'Unibright',
    iconURL:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e/logo.png'
  };
};

const SavingsPlusUSDCDecimals = 6;

const getAssetsForTreasury = (
  network: Network,
  moveNativePrice: string,
  slpNativePrice: string
): Array<Token> => {
  const move = getMoveAssetData(network);
  const slp = getMoveWethLPAssetData(network);
  return [
    {
      address: move.address,
      decimals: move.decimals,
      symbol: move.symbol,
      name: move.name,
      priceUSD: moveNativePrice,
      logo: move.iconURL,
      marketCap: Number.MAX_SAFE_INTEGER
    },
    {
      address: slp.address,
      decimals: slp.decimals,
      symbol: slp.symbol,
      name: 'Sushi MOVE-ETH LP',
      priceUSD: slpNativePrice,
      logo: 'https://protocol-icons.s3.amazonaws.com/sushi-exchange.png',
      marketCap: Number.MAX_SAFE_INTEGER
    }
  ];
};

const isTokenValidForTreasuryDeposit = (
  address: string,
  network: Network
): boolean => {
  return (
    address.toUpperCase() ===
      lookupAddress(network, 'MOVE_ADDRESS').toUpperCase() ||
    address.toUpperCase() ===
      lookupAddress(network, 'SUSHISWAP_MOVE_WETH_POOL_ADDRESS').toUpperCase()
  );
};

const getSlippage = (
  tokenAddress: string,
  network: Network,
  defaultValue?: string
): string => {
  const customSlippages = lookupConstant(network, 'CUSTOM_TOKEN_SLIPPAGE');
  return (
    customSlippages?.get(tokenAddress.toLowerCase()) ??
    defaultValue ??
    defaultSlippage
  );
};

const validTopUpAssets = (network: Network): Array<string> => {
  return [
    'eth',
    lookupAddress(network, 'WETH_TOKEN_ADDRESS'),
    lookupAddress(network, 'WBTC_TOKEN_ADDRESS'),
    lookupAddress(network, 'RENBTC_TOKEN_ADDRESS'),
    lookupAddress(network, 'UST_TOKEN_ADDRESS'),
    lookupAddress(network, 'MIM_TOKEN_ADDRESS'),
    lookupAddress(network, 'FRAX_TOKEN_ADDRESS'),
    lookupAddress(network, 'RAI_TOKEN_ADDRESS'),
    lookupAddress(network, 'OHM_ADDRESS'),
    lookupAddress(network, 'OHM_V2_ADDRESS'),
    lookupAddress(network, 'FEI_TOKEN_ADDRESS'),
    lookupAddress(network, 'USDT_TOKEN_ADDRESS'),
    lookupAddress(network, 'USDC_TOKEN_ADDRESS'),
    lookupAddress(network, 'SHIB_TOKEN_ADDRESS'),
    lookupAddress(network, 'AXS_TOKEN_ADDRESS'),
    lookupAddress(network, 'SLP_TOKEN_ADDRESS'),
    lookupAddress(network, 'DOP_TOKEN_ADDRESS'),
    lookupAddress(network, 'BONE_TOKEN_ADDRESS'),
    lookupAddress(network, 'LEASH_TOKEN_ADDRESS'),
    lookupAddress(network, 'BTRFLY_TOKEN_ADDRESS'),
    lookupAddress(network, 'WX_BTRFLY_TOKEN_ADDRESS'),
    lookupAddress(network, 'GOHM_TOKEN_ADDRESS'),
    lookupAddress(network, 'TOKE_TOKEN_ADDRESS'),
    lookupAddress(network, 'APE_TOKEN_ADDRESS'),
    lookupAddress(network, 'UBT_TOKEN_ADDRESS'),
    lookupAddress(network, 'CONCAVE_TOKEN_ADDRESS'),
    lookupAddress(network, 'AL_ETH_TOKEN_ADDRESS'),
    lookupAddress(network, 'AL_USD_TOKEN_ADDRESS'),
    lookupAddress(network, 'ALCX_TOKEN_ADDRESS'),
    lookupAddress(network, 'GALCX_TOKEN_ADDRESS'),
    lookupAddress(network, 'GTC_TOKEN_ADDRESS'),
    lookupAddress(network, 'CULT_TOKEN_ADDRESS'),
    lookupAddress(network, 'DOLA_TOKEN_ADDRESS'),
    lookupAddress(network, 'LUSD_TOKEN_ADDRESS'),
    lookupAddress(network, 'AG_EUR_TOKEN_ADDRESS'),
    lookupAddress(network, 'L33T_TOKEN_ADDRESS'),
    lookupAddress(network, 'WHALE_TOKEN_ADDRESS'),
    lookupAddress(network, 'GENRE_TOKEN_ADDRESS'),
    lookupAddress(network, 'PIXEL_TOKEN_ADDRESS'),
    lookupAddress(network, 'MORK_TOKEN_ADDRESS'),
    lookupAddress(network, 'GOB_TOKEN_ADDRESS'),
    lookupAddress(network, 'ATS_TOKEN_ADDRESS'),
    lookupAddress(network, 'CALVIN_TOKEN_ADDRESS'),
    lookupAddress(network, 'AIN_TOKEN_ADDRESS'),
    lookupAddress(network, 'MARTE_TOKEN_ADDRESS'),
    lookupAddress(network, 'JULIEN_TOKEN_ADDRESS'),
    lookupAddress(network, 'SCOTT_TOKEN_ADDRESS'),
    lookupAddress(network, 'CAMI_TOKEN_ADDRESS'),
    lookupAddress(network, 'GREY_TOKEN_ADDRESS'),
    lookupAddress(network, 'JAMM_TOKEN_ADDRESS'),
    lookupAddress(network, 'SKULL_TOKEN_ADDRESS'),
    lookupAddress(network, 'TIDE_TOKEN_ADDRESS'),
    lookupAddress(network, 'KERMAN_TOKEN_ADDRESS'),
    lookupAddress(network, 'RDR_TOKEN_ADDRESS'),
    lookupAddress(network, 'LIFE_TOKEN_ADDRESS'),
    lookupAddress(network, 'FAMILY_TOKEN_ADDRESS'),
    lookupAddress(network, 'ALXO_TOKEN_ADDRESS'),
    lookupAddress(network, 'HUE_TOKEN_ADDRESS'),
    lookupAddress(network, 'OSINA_TOKEN_ADDRESS'),
    lookupAddress(network, 'LADZ_TOKEN_ADDRESS'),
    lookupAddress(network, 'YUMI_TOKEN_ADDRESS'),
    lookupAddress(network, 'RARE_TOKEN_ADDRESS'),
    lookupAddress(network, 'BEAR_TOKEN_ADDRESS'),
    lookupAddress(network, 'ARKE_TOKEN_ADDRESS'),
    lookupAddress(network, 'SWAGG_TOKEN_ADDRESS'),
    lookupAddress(network, 'TING_TOKEN_ADDRESS'),
    lookupAddress(network, 'DSGN_TOKEN_ADDRESS'),
    lookupAddress(network, 'PICA_TOKEN_ADDRESS'),
    lookupAddress(network, 'HERO_TOKEN_ADDRESS'),
    lookupAddress(network, 'FORCER_TOKEN_ADDRESS'),
    lookupAddress(network, 'BPC_TOKEN_ADDRESS'),
    lookupAddress(network, 'BAEPAY_TOKEN_ADDRESS'),
    lookupAddress(network, 'WGM_TOKEN_ADDRESS'),
    lookupAddress(network, 'PYGOZ_TOKEN_ADDRESS'),
    lookupAddress(network, 'GCASH_TOKEN_ADDRESS'),
    lookupAddress(network, 'BONES_TOKEN_ADDRESS'),
    lookupAddress(network, 'MNFT_TOKEN_ADDRESS'),
    lookupAddress(network, 'FIRST_TOKEN_ADDRESS'),
    lookupAddress(network, 'ST_ETH_TOKEN_ADDRESS'),
    lookupAddress(network, 'LDO_TOKEN_ADDRESS'),
    ...getSimpleYearnVaultTokens(network).map((v) => v.vaultToken.address)
  ];
};

export {
  getMoveAssetData,
  getMoboAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData,
  getAssetsForTreasury,
  getBaseAssetData,
  getOhmAssetData,
  getBTRFLYAssetData,
  isTokenValidForTreasuryDeposit,
  getEURSAssetData,
  getUBTAssetData,
  getALCXAssetData,
  getCULTAssetData,
  HOLY_PASSAGE_ABI,
  HOLY_POOL_ABI,
  HOLY_VISOR_ABI,
  getCentralTransferProxyAbi,
  SMART_TREASURY_ABI,
  BALANCE_CHECKER_ABI,
  ERC20_ABI,
  NFT_UNEXPECTED_MOVE_ABI,
  NFT_SWEET_AND_SOUR_ABI,
  NFT_OLYMPUS_ABI,
  NFT_VAULTS_ABI,
  NFT_DICE_ABI,
  NFT_NIBBLE_SHOP_ABI,
  SUSHI_UNI_PAIR_V2_ABI,
  NFT_RARI_ABI,
  POWERCARD_STAKER_ABI,
  MASTER_CHEF_ABI,
  ERC721_ABI,
  EARNINGS_ETHEREUM_ABI,
  EARNINGS_OLYMPUS_ABI,
  WX_BTRFLY_ABI,
  NFT_ORDER_OF_LIBERTY_ABI,
  UBT_STAKING_CONTRACT_ABI,
  NFT_BASELEDGER_STAKING_OG_ABI,
  GALCX_ABI,
  DCULT_ABI,
  YEARN_SIMPLE_VAULT_ABI,
  SAVINGS_PLUS_POOL_ABI,
  getSimpleYearnVaultTokens,
  getSimpleYearnVaultTokenByAddress,
  isSimpleYearnVault,
  validTopUpAssets,
  getSlippage,
  SavingsPlusUSDCDecimals,
  REVERSE_RECORDS_ABI,
  UNS_RESOLVER_CONTRACT_ABI
};
