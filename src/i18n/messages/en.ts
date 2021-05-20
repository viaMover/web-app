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
  lblSmartTreasury: 'Smart Treasury',
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
  btnView: {
    simple: 'View'
  },
  btnSwap: 'Swap',
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
  },
  /* NFTs end */

  /* other pages start */
  asset: {
    txtAlt: '{name} icon',
    txtFallbackAlt: '{fieldRole} asset icon',
    lblSelectMax: 'MAX {amount} {name}'
  },
  swapsPage: {
    lblSwapPrefix: 'Swap',
    lblSwapFrom: '@:swapsPage.lblSwapPrefix from',
    lblSwapTo: '@:swapsPage.lblSwapPrefix to',
    lblChooseAsset: 'Choose asset',
    lblMinimumReceived: 'Minimum received',
    lblRate: 'Rate',
    lblEstimatedNetworkFee: 'Estimated network fee',
    lblSmartTreasuryCover: 'Smart Treasury coven',
    lblSlippage: 'Slippage',
    lblGasSettings: 'Gas Settings'
  },
  savingsPage: {
    lblSavingsPrefix: 'Savings',
    lblManageSavings: 'Manage @:savingsPage.lblSavingsPrefix',
    lblSavingsOverview: '@:savingsPage.lblSavingsPrefix overview',
    lblDepositedAssets: 'Deposited assets',
    lblCurrentVariableAPY: 'Current variable APY',
    lbl30DayAverageAPY: '30-day average APY',
    lblTotalAssetsUnderManagement: 'Total assets under management',
    lblSavingsStats: '@:savingsPage.lblSavingsPrefix Stats',
    lblSavingsEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblSavingsEstimation: '@:savingsPage.lblSavingsPrefix Estimation',
    lblEstimatedEarningsTomorrow: 'Est. earnings tomorrow',
    lblEstimatedEarningsNextMonth: 'Est. earnings next month',
    lblEstimatedEarningsAnnually: 'Est. earnings annually',
    btnDeposit: {
      simple: 'Deposit in @:savingsPage.lblSavingsPrefix',
      emoji: '💰 @:savingsPage.btnDeposit.simple'
    },
    btnWithdraw: {
      simple: 'Withdraw from @:savingsPage.lblSavingsPrefix',
      emoji: '🚪 @:savingsPage.btnWithdraw.simple'
    },
    lblEarnedRelativeMonthlyChange: '{amount} earned this month',
    lblEarnedRelativeMonthlyChangeExtended: '{amount} earned on {date}',
    lblEarnedRelativeMonthlyChangeExtendedMonthOnly:
      '{amount} earned in {date}',
    lblInProgress: 'In progress',
    statement: {
      lblMonthStatisticFallback: 'Month statistic',
      lblBalance: '{month} balance',
      lblDeposits: '{month} deposits',
      lblWithdrawals: '{month} withdrawals',
      lblSavedFees: 'Saved fees',
      lblPayoutsToTreasury: 'Payouts to @:lblTreasury'
    },
    deposit: {
      lblDepositInSavings: 'Deposit in @:savingsPage.lblSavingsPrefix',
      txtDepositDescription:
        'Once you deposit your assets in savings, Mover is ' +
        'constantly searching for the highest paying option using multiple DeFi protocols. ' +
        'Mover does automatic rebalancing, yield collection, and capital optimization.',
      txtAssetWillBeConverted: {
        part1: 'Your asset will be automatically convered to ',
        part2: 'USDC at the market rate at the time of the deposit transaction.'
      },
      lblWhatToDeposit: 'What to deposit',
      btnDeposit: 'Deposit',
      lblYieldEstimation: 'Yield estimation',
      txtYieldEstimation:
        'Estimated annual yield based on your deposit amount is {amount} at the current rate of {apy}% APY.'
    },
    withdraw: {
      lblWithdrawFromSavings: 'Withdraw from @:savingsPage.lblSavingsPrefix',
      txtWithdrawDescription:
        'You can withdraw the entire or partial balance. ' +
        'Available balance consists of principal amount you deposited together with the accumulated yield.',
      lblWhatToWithdraw: 'What to withdraw',
      btnWithdraw: 'Withdraw',
      lblWhatAboutTheYield: 'What about the yield?',
      txtWhatAboutTheYield:
        'Estimated lost annual yield based on your withdrawal amount is {amount} at the current rate of {apy}% APY.'
    },
    btnEnterAmount: 'Enter amount'
  },
  treasuryPage: {
    lblTreasuryPrefix: 'Treasury',
    lblManageTreasury: 'Manage @:treasuryPage.lblTreasuryPrefix',
    lblTreasuryOverview: '@:treasuryPage.lblTreasuryPrefix Overview',
    lblReservedAssetsValue: 'Reserved assets value',
    lblCurrentBoost: 'Current boost',
    lblMaximumBoost: 'Maximum boost',
    lblSmartTreasurySize: 'Smart Treasury Size',
    lblTreasuryStats: '@:treasuryPage.lblTreasuryPrefix Stats',
    lblEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblSpentToday: 'Spent today',
    lblSpentThisMonth: 'Spent this month',
    lblSpentInTotal: 'Spent in total',
    lblReservedAssets: 'Reserved Assets',
    btnDeposit: {
      simple: 'Increase Boost',
      emoji: '📈 @:treasuryPage.btnDeposit.simple'
    },
    btnWithdraw: {
      simple: 'Decrease Boost',
      emoji: '📉 @:treasuryPage.btnWithdraw.simple'
    },
    btnClaimAndBurn: {
      simple: 'Claim & Burn',
      emoji: '🔥 @:treasuryPage.btnClaimAndBurn.simple'
    },
    lblEarnedRelativeMonthlyChange:
      '{amount} bonuses from @:treasuryPage.lblTreasuryPrefix this month',
    lblEarnedRelativeMonthlyChangeExtended:
      '{amount} bonuses from @:treasuryPage.lblTreasuryPrefix on {date}',
    lblEarnedRelativeMonthlyChangeExtendedMonthOnly:
      '{amount} bonuses from @:treasuryPage.lblTreasuryPrefix in {month}',
    lblInProgress: 'In progress',
    statement: {
      lblMonthStatisticFallback: 'Month statistic',
      lblBalance: '{month} balance',
      lblRewardsUsed: 'Rewards used',
      lblReservedAssets: 'Reserved assets',
      lblRemovedAssets: 'Removed assets',
      lblAverageBoost: 'Average boost'
    },
    increaseBoost: {
      lblIncreaseBoost: 'Increase boost',
      txtIncreaseBoostDescription: {
        part1: 'There are two boost options. Reserving ',
        part2:
          ' MOVE tokens will increase (1x) your rewards share based on the ' +
          'total amount of the tokens you have reserved. Reserving ',
        part3:
          ' MOVE-ETH LP tokens will multiply by 2,5 (2.5x) your rewards share ' +
          'based on the total amount of LP tokens you have reserved.'
      },
      lblWhatToReserve: 'What to reserve',
      btnIncreaseBoost: 'Increase Boost',
      lblEstimatedBoost: 'Estimated boost',
      txtEstimatedBoost:
        'Estimated new Treasury boost is {estimatedAmount}x. ' +
        'As a reminder, your current boost rate is {currentAmount}x.'
    },
    decreaseBoost: {
      lblDecreaseBoost: 'Decrease Boost',
      txtDecreaseBoostDescription:
        'Decrease the boost, will return your reserved assets, ' +
        'but will also decrease your Treasury share.',
      lblWhatToReturn: 'What to return',
      btnDecreaseBoost: 'Decrease Boost',
      lblWhatAboutTheBoost: 'What about the boost?',
      txtWhatAboutTheBoost:
        'Estimated new Treasury boost is {estimatedAmount}x. ' +
        'As a reminder, your current boost rate is {currentAmount}x.'
    },
    claimAndBurn: {
      lblClaimAndBurn: 'Claim & Burn',
      txtClaimAndBurnDescription:
        'Claim & Burn allows you to exchange your MOVE tokens for a larger ' +
        'portion of the Smart Treasury. You will burn your MOVE tokens, ' +
        'and receive four times (4x) of your treasury share in a one-time payout.',
      lblWhatToBurn: 'What to burn',
      btnClaimAndBurn: 'Claim & Burn',
      lblThePayout: 'The payout',
      txtThePayout:
        'Estimated one-time payout {payout} USDC. As a reminder, you will burn {burning} MOVE.'
    }
  },
  transactionPage: {
    lblState: {
      prefix: 'Your transaction',
      pending: '@:transactionPage.lblState.prefix is processing',
      processed: '@:transactionPage.lblState.prefix was processed!',
      failed: 'Something went wrong. @:transactionPage.lblState.prefix failed'
    }
  }
  /* other pages end */
};
