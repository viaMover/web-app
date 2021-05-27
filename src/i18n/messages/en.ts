export default {
  lblWelcome: 'Welcome',
  lblConnectWallet: 'Connect a wallet',
  lblWallet: 'Wallet',
  lblConnectWalletTransactionHistory: '@:lblConnectWallet to see history',
  releaseRadar: {
    lblReleaseRadar: 'Release Radar',
    lblReleaseRadarNewTokensToday: '{amount} new tokens today'
  },
  swaps: {
    lblSwaps: 'Swaps',
    lblSwapFrom: '@:swaps.lblSwapPrefix from',
    lblSwapPrefix: 'Swap',
    lblSwapTo: '@:swaps.lblSwapPrefix to',
    lblChooseAsset: 'Choose asset',
    lblMinimumReceived: 'Minimum received',
    lblRate: 'Rate',
    lblEstimatedNetworkFee: 'Estimated network fee',
    lblSmartTreasuryCover: 'Smart Treasury coven',
    lblSlippage: 'Slippage',
    lblGasSettings: 'Gas Settings',
    lblSwapsSubheading: 'Swap any tokens with @:treasury.lblTreasury benefits',
    btnSwap: {
      simple: 'Swap'
    }
  },
  debitCard: {
    lblDebitCard: 'Debit Card',
    lblDebitCardHeading: 'Great news!',
    txtDebitCard:
      'You can now order the Beautiful debit card brought you by Mover and Trastra',
    btnOrderDebitCard: 'Order the card'
  },
  savings: {
    lblSavings: 'Savings',
    lblSavingsHeader: '{amount} in @:savings.lblSavings',
    lblSavingsEarnedTodaySection: 'You earned {amount} today',
    lblSavingsPrefix: 'Savings',
    lblManageSavings: 'Manage @:savings.lblSavingsPrefix',
    lblSavingsOverview: '@:savings.lblSavingsPrefix overview',
    lblDepositedAssets: 'Deposited assets',
    lblCurrentVariableAPY: 'Current variable APY',
    lbl30DayAverageAPY: '30-day average APY',
    lblTotalAssetsUnderManagement: 'Total assets under management',
    lblSavingsStats: '@:savings.lblSavingsPrefix Stats',
    lblSavingsEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblSavingsEstimation: '@:savings.lblSavingsPrefix Estimation',
    lblEstimatedEarningsTomorrow: 'Est. earnings tomorrow',
    lblEstimatedEarningsNextMonth: 'Est. earnings next month',
    lblEstimatedEarningsAnnually: 'Est. earnings annually',
    btnDeposit: {
      simple: 'Deposit in @:savings.lblSavingsPrefix',
      emoji: '💰 @:savings.btnDeposit.simple'
    },
    btnWithdraw: {
      simple: 'Withdraw from @:savings.lblSavingsPrefix',
      emoji: '🚪 @:savings.btnWithdraw.simple'
    },
    btnView: {
      simple: 'View'
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
      lblPayoutsToTreasury: 'Payouts to @:treasury.lblTreasury'
    },
    deposit: {
      lblDepositInSavings: 'Deposit in @:savings.lblSavingsPrefix',
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
      lblWithdrawFromSavings: 'Withdraw from @:savings.lblSavingsPrefix',
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
  treasury: {
    lblTreasuryHeader: '{amount} @:treasury.lblTreasuryBonuses',
    lblSmartTreasury: 'Smart Treasury',
    lblTreasuryEarnedToday: '@:treasury.lblTreasury brought you {amount} today',
    lblTreasuryBonuses: 'Treasury Bonuses',
    lblTreasury: 'Treasury',
    lblTreasuryPrefix: 'Treasury',
    lblManageTreasury: 'Manage @:treasury.lblTreasuryPrefix',
    lblTreasuryOverview: '@:treasury.lblTreasuryPrefix Overview',
    lblReservedAssetsValue: 'Reserved assets value',
    lblCurrentBoost: 'Current boost',
    lblMaximumBoost: 'Maximum boost',
    lblSmartTreasurySize: 'Smart Treasury Size',
    lblTreasuryStats: '@:treasury.lblTreasuryPrefix Stats',
    lblEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblSpentToday: 'Spent today',
    lblSpentThisMonth: 'Spent this month',
    lblSpentInTotal: 'Spent in total',
    lblReservedAssets: 'Reserved Assets',
    btnDeposit: {
      simple: 'Increase Boost',
      emoji: '📈 @:treasury.btnDeposit.simple'
    },
    btnWithdraw: {
      simple: 'Decrease Boost',
      emoji: '📉 @:treasury.btnWithdraw.simple'
    },
    btnClaimAndBurn: {
      simple: 'Claim & Burn',
      emoji: '🔥 @:treasury.btnClaimAndBurn.simple'
    },
    btnView: {
      simple: 'View'
    },
    lblEarnedRelativeMonthlyChange:
      '{amount} bonuses from @:treasury.lblTreasuryPrefix this month',
    lblEarnedRelativeMonthlyChangeExtended:
      '{amount} bonuses from @:treasury.lblTreasuryPrefix on {date}',
    lblEarnedRelativeMonthlyChangeExtendedMonthOnly:
      '{amount} bonuses from @:treasury.lblTreasuryPrefix in {month}',
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
  governance: {
    lblGovernance: 'Governance',
    lblGetInvolved: 'Get involved',
    lblGovernancePrefix: 'Governance',
    lblGovernanceOverview: '@:governance.lblGovernancePrefix Overview',
    lblVotingPower: 'Voting power',
    lblTimesVoted: 'Times voted',
    lblProposalsCreated: 'Proposals created',
    lblGovernanceStats: '@:governance.lblGovernancePrefix Stats',
    lblPowerToBecomeAProposer: 'Power to become a proposer',
    lblCommunityVotingPower: 'Community voting power',
    lblOpenProposals: 'Open proposals',
    lblTotalProposals: 'Total proposals',
    lblSucceededProposals: 'Succeeded proposals',
    lblDefeatedProposals: 'Defeated proposals',
    btnCreateAProposal: {
      simple: 'Create a proposal',
      emoji: '🗳 @:governance.btnCreateAProposal.simple'
    },
    lblVotingStatus: {
      open: 'Voting is open',
      closed: 'Voting is closed'
    },
    btnVote: {
      simple: 'Vote'
    },
    btnVoteFor: {
      simple: 'Vote FOR',
      emoji: '👍 @:governance.btnVoteFor.simple'
    },
    btnVoteAgainst: {
      simple: 'Vote AGAINST',
      emoji: '👍 @:governance.btnVoteAgainst.simple'
    },
    btnView: {
      simple: 'View'
    },
    btnSeeAll: {
      simple: 'See All'
    },
    lblOutcome: {
      quorumNotReached: 'Quorum not reached',
      quorumReached: 'Quorum reached',
      accepted: 'Accepted',
      defeated: 'Defeated'
    },
    lblProposal: 'Proposal',
    lblCreateAProposal: 'Create a proposal',
    lblProposalOverview: 'Proposal overview',
    lblVotingPeriod: 'Voting period',
    txtVotingPeriod: '{days} days',
    lblMinimumVotingThreshold: 'Minimum voting threshold',
    lblProposer: 'Proposer',
    lblProposalId: '@:governance.lblProposal ID',
    lblVotingEnds: 'Voting ends',
    lblVotingActivity: 'Voting activity',
    txtVotingActivity: '{amount}%',
    lblProposalDetails: '@:governance.lblProposal Details',
    lblAvailableVotingPower: 'Available voting power',
    lblVotesFor: 'Votes FOR',
    lblVotesAgainst: 'Votes AGAINST',
    lblCurrentOutcome: 'Current outcome'
  },
  nibbleShop: {
    lblNibbleShop: 'Nibble shop',
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
      buy: 'Buy {title}',
      sell: 'Sell {title}',
      redeem: 'Redeem {title}'
    },
    txtTokenizedAsset:
      '{name} is a tokenized asset. When buying a tokenized asset, you are buying a token that can be redeemed for a physical asset. ' +
      "Buying and selling affects the current price of the asset. Purchasing a token doesn't require redemption",
    lblBuyWith: 'Buy with',
    lblBalance: 'Balance',
    lblRedeem: 'Redeem',
    lblSell: 'Sell',
    lblFullName: 'Full name',
    lblEmail: 'Email',
    lblCountry: 'Country',
    lblFullAddress: 'Full address',
    lblTownOrCity: 'Town or city',
    lblPostalCode: 'Postal code',
    lblPlaceholders: {
      fullName: 'Antoshi Nakamoto',
      email: 'your@email.com',
      country: 'Nakamoto Land',
      fullAddress: 'Street name, house or apartment number',
      townOrCity: 'Nakamoto Town',
      postalCode: 'Just a code'
    },
    btnGet: 'Get',
    txtLogoAlt: '@:nibbleShop.lblNibbleShop image',
    txtProductAlt: '{title} product image',
    btnBuy: {
      simple: 'Buy',
      emoji: '🛍 @:nibbleShop.btnBuy.simple'
    },
    btnSell: {
      simple: 'Sell',
      emoji: '🚪 @:nibbleShop.btnSell.simple'
    },
    btnRedeem: {
      simple: 'Redeem',
      emoji: '📦 @:nibbleShop.btnRedeem.simple'
    },
    lblNoNFT: "That's sour! You don't have Sweet & Sour NFT",
    txtNoNFT:
      "Looks like you don't have Sweet & Sour NFT. It means that you can't access Nibble Shop.",
    txtAssetActionDescription:
      'CEO of Money is a tokenized asset. When buying a tokenized asset, you are buying a token ' +
      'that can be redeemed for a physical asset. Buying and selling affects the current price of ' +
      'the asset. Purchasing a token doesn’t require redemption.'
  },
  NFTs: {
    lblNFTDrops: 'NFT Drops',
    lblNftOverview: '{name} Overview',
    lblTotalNumberOfNFTs: 'Total number of NFTs',
    lblTotalClaimed: 'Total claimed',
    lblTotalExchanged: 'Total exchanged',
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
  },
  asset: {
    txtAlt: '{name} icon',
    txtFallbackAlt: '{fieldRole} asset icon',
    lblSelectMax: 'MAX {amount} {name}'
  },
  transaction: {
    lblState: {
      prefix: 'Your transaction',
      pending: '@:transaction.lblState.prefix is processing',
      processed: '@:transaction.lblState.prefix was processed!',
      failed: 'Something went wrong. @:transaction.lblState.prefix failed'
    }
  }
};
