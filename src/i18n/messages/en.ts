export default {
  lblPageTitleDefault: 'Mover App',
  lblWelcome: 'Welcome',
  lblBalance: 'Balance',
  headingBalance: 'Your wallet balance',
  lblConnectWallet: 'Please connect a wallet',
  txtConnectWallet:
    'Mover is a non-custodial service. It means that you need to connect your wallet first, to continue.',
  txtNotFound:
    'Wow, how did you end up here?\nSeems like even Google isn’t as of help.',
  btnConnectWallet: 'Connect a wallet',
  txtChangeWalletAlt: 'Change wallet icon',
  lblWallet: 'Wallet',
  lblDisconnectEmoji: '🚪',
  lblDisconnect: '@:lblDisconnectEmoji Disconnect',
  lblConnectWalletTransactionHistory: 'Looks like you are new to Mover',
  lblMore: 'More',
  lblPageTitleSuffix: 'Portfolio',
  releaseRadar: {
    lblReleaseRadar: 'Release Radar',
    lblReleaseRadarNewTokensToday: 'There are {amount} new tokens for you'
  },
  menu: {
    lblSwapTokenEmoji: '🔄',
    lblSwapToken: 'Swap Tokens',
    lblGetMoveEmoji: '💸',
    lblGetMove: 'Get MOVE',
    lblProvideLiquidityMoveEmoji: '💧',
    lblProvideLiquidityMove: 'Provide liquidity for MOVE',
    lblDepositInSavingsEmoji: '💰',
    lblDepositInSavings: 'Deposit in Savings',
    lblIncreaseBoostEmoji: '📈',
    lblIncreaseBoost: 'Increase boost',
    lblPurchaseBondsEmoji: '🏦',
    lblPurchaseBonds: 'Purchase Bonds',
    lblBeautifulCard: 'Beautiful card',
    lblComingSoon: 'Coming soon',
    lblBonds: 'Bonds'
  },
  swaps: {
    lblSwaps: 'Swaps',
    lblSwapFrom: '@:swaps.lblSwapPrefix from',
    lblSwapPrefix: 'Swap',
    lblSwapTo: '@:swaps.lblSwapPrefix to',
    lblChooseToken: 'Choose Token',
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
    icon: '💳',
    lblDebitCard: 'Debit Card',
    lblDebitCardHeading: 'Great news!',
    txtDebitCard:
      'You can now order the Beautiful debit card brought you by Mover and Trastra',
    btnOrderDebitCard: 'Order the card'
  },
  savingsDepositCard: {
    icon: '💰',
    lblSavingsDepositCardHeading: 'Save it!',
    txtSavingsDepositCard:
      'Savings just got better. Enjoy easy higher rates and even less hassle.',
    btnSavingsDepositCard: '@:savingsDepositCard.icon Deposit in Savings'
  },
  savings: {
    icon: '💰',
    lblSavings: 'Savings',
    lblNothingInSavings: 'Nothing in @:savings.lblSavings',
    txtNothingInSavings: 'Looks like you don’t have any savings, yet',
    lblSavingsHeader: '{amount} in @:savings.lblSavings',
    lblSavingsEarnedTodaySection: 'You earned {amount} today',
    lblSavingsPrefix: 'Savings',
    lblSavingsBalance: '@:savings.lblSavingsPrefix Balance',
    lblSavingsStatements: '@:savings.lblSavingsPrefix Statements',
    lblManageSavings: 'Manage @:savings.lblSavingsPrefix',
    lblSavingsOverview: '@:savings.lblSavingsPrefix Overview',
    lblDepositedAssets: 'Deposited assets',
    lblCurrentVariableAPY: 'Current variable APY',
    lbl30DayAverageAPY: '30-day average APY',
    lblTotalAssetsUnderManagement: 'Total assets under management',
    lblSavingsStats: '@:savings.lblSavingsPrefix Stats',
    lblEarnedToday: 'Earned today',
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
    lblEarnedRelativeMonthlyChange: 'Yield earned this month',
    lblEarnedRelativeMonthlyChangeExtended: '{amount} earned on {date}',
    lblEarnedRelativeMonthlyChangeExtendedMonthOnlyPrefix:
      'Yield earned in {date}',
    lblInProgress: 'In progress',
    statement: {
      lblMonthStatisticFallback: 'Month statistic',
      lblBalance: '{month} balance',
      lblDeposits: '{month} deposits',
      lblWithdrawals: '{month} withdrawals',
      lblSavedFees: 'Saved fees',
      lblPayoutsToTreasury: 'Payouts to @:treasury.lblTreasury',
      lblTotalEarnedInMonth: 'Total earned in {month}',
      lblAverageDailyEarningsInMonth: 'Average daily earnings in {month}'
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
    icon: '🐷',
    lblTreasuryHeader: '{amount} @:treasury.lblTreasuryBonuses',
    lblSmartTreasury: 'Smart Treasury',
    lblNothingInTreasury: 'Nothing in @:treasury.lblTreasury',
    txtNothingInTreasury: 'Looks like you don’t have Treasury Boost, yet',
    lblTreasuryEarnedToday: '@:treasury.lblTreasury brought you {amount} today',
    lblTreasuryBonuses: 'Treasury Bonuses',
    lblTreasuryBonusBalance: '@:treasury.lblSmartTreasury Bonus Balance',
    lblTreasury: 'Treasury',
    lblTreasuryPrefix: 'Treasury',
    lblManageTreasury: 'Manage @:treasury.lblTreasuryPrefix',
    lblTreasuryOverview: '@:treasury.lblTreasuryPrefix Overview',
    lblTreasuryStatements: '@:treasury.lblTreasuryPrefix Statements',
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
    lblEarnedRelativeMonthlyChange: 'Treasury rewards earned this month',
    lblEarnedRelativeMonthlyChangeExtended:
      '{amount} bonuses from @:treasury.lblTreasuryPrefix on {date}',
    lblEarnedRelativeMonthlyChangeExtendedMonthOnly:
      'Treasury rewards earned in {date}',
    lblInProgress: 'In progress',
    statement: {
      lblMonthStatisticFallback: 'Month statistic',
      lblBalance: '{month} balance',
      lblRewardsEarned: 'Rewards earned',
      lblAverageDailyEarnings: 'Average daily earnings',
      lblRewardsUsed: 'Rewards used',
      lblAverageDailySpendings: 'Average daily spendings',
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
    btnGet: {
      simple: 'Get'
    },
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
    txtAssets: {
      $CEO1: {
        description:
          'Nothing really to add here. This cap is hand-made for all the CEOs of all the monies. ' +
          'This is a genesis limited addition with only 30 ever caps to be made. ' +
          'This item will not be restocked. One size fits all CEOs.'
      }
    }
  },
  NFTs: {
    lblNFTDrops: 'NFT Drops',
    lblNFTOverview: '{name} Overview',
    lblTotalNumberOfNFTs: 'Total number of NFTs',
    lblTotalClaimed: 'Total claimed',
    lblTotalExchanged: 'Total exchanged',
    lblWhatElseCanDo: 'What else can you do',
    txtLogoAlt: '@:NFTs.lblNFTDrops image',
    txtAssetAlt: '{name} NFT asset image',
    txtNFTs: {
      movingWithOlympus: {
        description:
          'The Moving with Olympus NFT gives you an exclusive avatar.',
        pageDescription:
          'The Moving with Olympus is the limited NFT series available only ' +
          'for 3 days. 3 days is all it takes to become a part of something ' +
          'bigger than any one of us. This NFT gives it’s owner a right to a ' +
          'unique avatar on Mover. Wear the badge of honor.\n'
      },
      swapPassport: {
        description:
          'The Swap Passport NFT can be exchanged for one free swap via Mover.',
        pageDescription:
          'The Swap Passport is the limited NFT series available to those, ' +
          'who was present during the Sushi AMA on July 14th 2021. This NFT ' +
          'can be exchanged for one free swap on Mover platform.'
      },
      sweetAndSour: {
        description: 'The Sweet & Sour NFT gives early access to Nibble Shop.',
        pageDescription:
          'This NFT is dropped for all unique addresses that have held HOLY ' +
          'until April 31, 2021; and those that participated in the early LP ' +
          'program bu didn’t migrate. The Sweet & Sour NFT gives early access ' +
          'to Nibble Shop.'
      },
      unexpectedMove: {
        description:
          'The Unexpected Move NFT can be exchanged for 1 MOVE token, ' +
          'but only once.',
        pageDescription:
          'This NFT is dropped for all participants in our Twitter promo. ' +
          'The Unexpected Move NFT can be exchanged for 1 MOVE token, ' +
          'but only once.'
      }
    },
    btnGet: {
      simple: 'Get'
    },
    btnClaimAndExchange: {
      simple: 'Claim & Exchange',
      emoji: '🦍 @:NFTs.btnClaimAndExchange.simple'
    },
    btnExchange: {
      simple: 'Exchange',
      emoji: '🔥 @:NFTs.btnExchange.simple'
    },
    btnClaim: {
      simple: 'Claim',
      emoji: '🎉 @:NFTs.btnClaim.simple'
    }
  },
  asset: {
    txtAlt: '{name} icon',
    txtFallbackAlt: '{fieldRole} asset icon',
    lblSelectMax: 'Use Max',
    lblBalance: 'Balance'
  },
  transaction: {
    lblState: {
      waiting: {
        header: 'Waiting for confirmation',
        description: 'Confirm this transaction in your wallet'
      },
      pending: {
        header: 'Your transaction is processing',
        description: 'Waiting for transaction to be confirmed'
      },
      processed: {
        header: 'Success!',
        description: 'Your transaction was processed!'
      },
      reverted: {
        header: 'Transaction was reverted',
        description: 'Your transaction failed'
      }
    }
  },
  radar: {
    lblTokenOfTheDay: 'Token of the day',
    liveUpdates: {
      lblLiveUpdates: 'Live updates',
      lblTopMovers: 'Top Movers',
      lblTopLosers: 'Top losers',
      lblNewTokens: 'New tokens',
      lblDeFi: 'DeFi',
      lblStablecoins: 'Stablecoins'
    },
    lblPersonalLists: 'Personal Lists',
    lblCuratedLists: 'Curated Lists',
    lblRune: 'RUNE',
    txtRuneAlt: '{name} coin icon',
    txtRadar: {
      runeDescription:
        'RUNE is a native token of THORChain — a cross-network AMM exchange. ' +
        'THORChain allows for native swaps between various blockchains e.g. a ' +
        'native swap between ETH and BTC.'
    },
    btnGet: {
      simple: 'Get'
    },
    btnSearch: {
      emoji: '🔍'
    }
  },
  bonds: {
    icon: '🏦',
    lblBonds: 'Bonds'
  },
  card: {
    lblCard: 'Card'
  },
  search: {
    lblSearch: 'Search',
    lblSearchBar: 'Search tokens',
    lblSearchBarPlaceholder: 'Search any token',
    lblSearchTransaction: 'Search any transaction',
    lblFavorite: 'Favorite',
    lblVerified: 'Verified',
    lblTokensInTheWallet: 'Tokens in the wallet',
    lblGlobalSearch: 'Global search'
  },
  gas: {
    lblNetworkFee: 'Network fee',
    lblSelector: {
      low: '🐌 Slow',
      normal: '⏱ Normal',
      high: '🚀 Fast',
      treasury: '🐷 Smart Treasury'
    }
  },
  dates: {
    sameDay: '[Today]',
    lastDay: '[Yesterday]'
  },
  icon: {
    txtFlipAssetsIconAlt: 'flip',
    txtBackLinkIconAlt: 'back',
    txtCloseIconAlt: 'close',
    txtContextButtonAlt: 'open menu',
    txtLogoAlt: 'Mover logo',
    txtSelectAssetButtonAlt: 'select asset',
    txtNavigationLinkAlt: 'navigation link',
    txtSwapDetailsIconAlt: 'swap details',
    txtTokenInfoAlt: '{name} info on Etherscan'
  },
  more: {
    lblMore: 'More'
  }
};
