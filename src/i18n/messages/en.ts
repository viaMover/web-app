export default {
  /* Labels */
  /* Home screen labels */
  lblWelcome: 'Welcome',
  lblReleaseRadar: 'Release Radar',
  lblSwaps: 'Swaps',
  lblDebitCard: 'Debit Card',
  lblSavings: 'Savings',
  lblTreasuryBonuses: 'Treasury Bonuses',
  lblTreasury: 'Treasury',
  lblGovernance: 'Governance',
  lblNibbleShop: 'Nibble Shop',
  lblNFTDrops: 'NFT Drops',
  lblConnectWallet: 'Connect a wallet',
  lblWallet: 'Wallet',
  /* Home screen labels end */

  /* Transaction history labels */
  lblConnectWalletTransactionHistory: '@:lblConnectWallet to see history',
  /* Transaction history labels end*/

  /* Release Radar section labels */
  lblReleaseRadarNewTokensToday: '{amount} new tokens today',
  /* Release Radar section labels end */

  /* Swaps section labels */
  lblSwapsSubheading: 'Swap any tokens with @:lblTreasury benefits',
  /* Swaps section labels end */

  /* Debit card section labels */
  lblDebitCardHeading: 'Great news!',
  txtDebitCard:
    'You can now order the Beautiful debit card brought you by Mover and Trastra',
  /* Debit card section labels end */

  /* Savings section labels */
  lblSavingsHeader: '{amount} in @:lblSavings',
  lblSavingsEarnedToday: 'You earned {amount} today',
  /* Savings section labels end */

  /* Treasury section labels */
  lblTreasuryHeader: '{amount} @:lblTreasuryBonuses',
  lblTreasuryEarnedToday: '@:lblTreasury brought you {amount} today',
  /* Treasury section labels end */
  /* Labels end */

  /* Governance section labels */
  lblVoting: {
    open: 'Voting is open',
    closed: 'Voting closed'
  },
  lblProposal: 'Proposal',
  lblProposalTitle: '@:lblProposal title',
  proposalTitlePlaceholder: "Let's make Mover great again",
  lblProposalDescription: '@:lblProposal description',
  proposalDescriptionPlaceholder: 'A detailed proposal description',
  lblProposalDetails: '@:lblProposal Details',
  lblProposalOverview: '@:lblProposal Overview',
  lblVotingPrefix: 'Voting',
  lblProposalId: '@:lblProposal ID',
  lblVotingEnds: '@:lblVotingPrefix ends',
  lblProposer: 'Proposer',
  lblVotingActivity: '@:lblVotingPrefix activity',
  lblVotingPowerSuffix: 'voting power',
  lblVotingPower: {
    available: 'Available @:lblVotingPowerSuffix',
    community: 'Community @:lblVotingPowerSuffix'
  },
  lblVotesCount: {
    for: 'Votes FOR',
    against: 'Votes AGAINST'
  },
  lblOutcome: {
    label: 'Current outcome',
    quorumNotReached: 'Quorum not reached',
    for: 'FOR',
    against: 'AGAINST'
  },
  lblSummary: 'Summary',
  lblPurpose: 'Purpose',
  lblVotingPeriod: 'Voting period',
  lblMinimumVotingThreshold: 'Minimum voting threshold',
  /* Governance section labels end */

  /* Nibble shop section labels */
  lblNoSweetAndSourNFTHeading: "That's sour! You have no Sweet & Sour",
  lblNoSweetAndSourNFTSubheading:
    "Looks like you don't have Sweet & Sour NFT. It means that you can't access Nibble Shop",
  lblAssetOverview: '{name} Overview',
  lblTotalTrades: 'Total trades',
  lblQuantity: {
    initial: 'Initial quantity',
    redeemed: 'Redeemed',
    remaining: 'Remaining quantity',
    available: 'Available to purchase'
  },
  lblCurrentPrice: 'Current price',
  lblAssetActions: {
    buy: 'Buy {name}',
    sell: 'Sell {name}',
    redeem: 'Redeem {name}'
  },
  txtTokenizedAsset:
    '{name} is a tokenized asset. When buying a tokenized asset, you are buying a token that can be redeemed for a physical asset. ' +
    "Buying and selling affects the current price of the asset. Purchasing a token doesn't require redemption",
  lblBuyWith: 'Buy with',
  lblBalance: 'Balance',
  lblRedeem: 'Redeem',
  lblFullName: 'Full name',
  fullNamePlaceholder: 'Antoshi Nakamoto',
  lblEmail: 'Email',
  emailPlaceholder: 'your@email.com',
  lblCountry: 'Country',
  countryPlaceholder: 'Nakamoto Land',
  lblFullAddress: 'Full address',
  fullAddressPlaceholder: 'Street name, house or apartment number',
  lblTownOrCity: 'Town or city',
  townOrCityPlaceholder: 'Nakamoto Town',
  lblPostalCode: 'Postal code',
  postalCodePlaceholder: 'Just a code',
  /* Nibble shop section labels end*/

  /* Sweet and sour section labels */
  lblNftOverview: '{name} Overview',
  lblTotalNumberOfNFTs: 'Total number of NFTs',
  lblTotalClaimed: 'Total claimed',
  lblTotalExchanged: 'Total exchanged',
  /* Sweet and sour section labels end */

  /* Buttons */
  btnOrderDebitCard: 'Order the card',
  btnSeeAll: 'See All',
  btnVote: 'Vote',
  btnVoteFor: '👍 @:btnVote FOR',
  btnVoteAgainst: '👎 @:btnVote AGAINST',
  btnCreateProposal: 'Create a proposal',
  btnLearnSweetAndSour: 'Learn more about Sweet & Sour',
  btnGet: 'Get',
  btnBuy: {
    simple: 'Buy',
    emoji: '🛍 @:btnBuy.simple'
  },
  btnSell: {
    simple: 'Sell',
    emoji: '🚪 @:btnSell.simple'
  },
  btnRedeem: {
    simple: 'Redeem',
    emoji: '📦 @:btnRedeem.simple'
  },
  btnExchange: {
    simple: 'Exchange',
    emoji: '🔥 @:btnExchange.simple'
  },
  btnClaim: {
    simple: 'Claim',
    emoji: '🎉 @:btnClaim.simple'
  },
  btnClaimAndExchange: {
    simple: '@:btnClaim.simple & @:btnExchange.simple',
    emoji: '🦍 @:btnClaimAndExchange.simple'
  },
  /* Buttons end */

  /* NFTs */
  txtNFTs: {
    sweetAndSour: {
      description:
        'This NFT is dropped for all unique addresses that have held HOLY until April 31, 2021. ' +
        'The Sweet & Sour NFT gives early access to Nibble Shop. ' +
        'This NFT has no expiry date, and can be exchanged, swapped or sent to other addresses.'
    },
    unexpectedMove: {
      description:
        'This NFT is dropped for all participants in our Twitter promo. ' +
        'The Unexpected Move NFT can be exchanged for 1 MOVE token, but only once.'
    }
  }
  /* NFTs end */
};
