export default {
  lblPageTitleDefault: 'Mover App',
  lblWelcome: 'Welcome',
  lblBalance: 'Balance',
  headingBalance: 'Your wallet balance',
  lblConnectWallet: 'Please connect your wallet',
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
  lblInsufficientBalance: 'Insufficient Balance',
  lblEnterAmount: 'Enter amount',
  lblNoData: 'No data',
  releaseRadar: {
    lblReleaseRadar: 'Release Radar',
    lblReleaseRadarNewTokensToday: 'There are {amount} new tokens for you'
  },
  connect: {
    txtMoverDescription:
      'Mover is a non-custodial service. It means that you need to connect your wallet first, to continue. By connecting your wallet, you agree with the {0}',
    lblTermsAndConditions: 'Terms and Conditions.',
    btnConnectOtherWallet: 'Connect other wallet providers',
    txtQrDescriptionPartOne: 'Scan QR code from your Mover app. {0} {1}',
    txtQrDescriptionPartTwo:
      'Or use another compatible mobile wallet with WalletConnect.',
    lblChooseProvider: 'Choose from Metamask and other popular wallets'
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
    btnSavingsDepositCard: 'Deposit in Savings',
    txtCardImageAlt: 'Savings icon'
  },
  savings: {
    icon: '💰',
    USDC: 'USDC',
    lblSavings: 'Savings',
    lblMySavings: 'My Savings',
    lblGlobalAnalytics: 'Global analytics',
    txtGlobalAnalytics: 'All information about Savings',
    txtYouCouldApproximately:
      'You could approximately earn in a year if you deposit $10,000 now.',
    txtIfYouDeposit: 'If you deposit in Savings now, you are getting',
    lblAPYOnAllSavings: 'APY on all savings',
    lblStartSaving: 'Start saving',
    lblReviewTransaction: 'Review transaction',
    lblChooseToken: 'Choose Token',
    lblNothingInSavings: 'Nothing in @:savings.lblSavings',
    txtNothingInSavings: 'Looks like you don’t have any savings, yet',
    lblSavingsHeader: '{amount} in @:savings.lblSavings',
    lblSavingsEarnedTodaySection: 'You earned {amount} today',
    lblSavingsPrefix: 'Savings',
    lblSavingsBalance: '@:savings.lblSavingsPrefix Balance',
    lblSavingsStatements: '@:savings.lblSavingsPrefix Statements',
    lblManageSavings: 'Manage @:savings.lblSavingsPrefix',
    lblSavingsOverview: '@:savings.lblSavingsPrefix Overview',
    lblDepositedAssets: 'My total deposited assets value',
    lblCurrentVariableAPY: 'Current variable APY',
    lbl30DayAverageAPY: '30-day average APY',
    lblTotalAssetsUnderManagement: 'Total assets under management',
    lblSavingsStats: '@:savings.lblSavingsPrefix Stats',
    lblEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblSavingsEstimation: '@:savings.lblSavingsPrefix Estimation',
    lblEstimatedEarningsTomorrow: 'Estimated earnings tomorrow',
    lblEstimatedEarningsNextMonth: 'Estimated earnings next month',
    lblEstimatedEarningsAnnually: 'Estimated earnings annually',
    txtSavingsOverviewDescription:
      'Savings is a non-custodial and permissionless product. ' +
      'Check the global statistics across the board.',
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
    txtUSDCCoinIsAStable:
      'USD Coin is a stable asset and the easiest way to grow your ' +
      'savings. Your returns will also be in USDC.',
    lblInProgress: 'In progress',
    lblAvailable: 'Available',
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
      lblChooseAmount: 'Choose the amount to deposit',
      lblDepositInSavings: 'Deposit in @:savings.lblSavingsPrefix',
      txtDepositShortDescription: 'Get {apy}% APY on simple savings in USDC',
      txtYouCouldEarnInYear:
        'You could earn in a year. Considering all changes.',
      txtDepositDescription:
        'Once you deposit your assets in savings, Mover is ' +
        'constantly searching for the highest paying option using multiple DeFi protocols. ' +
        'Mover does automatic rebalancing, yield collection, and capital optimization.',
      txtAssetWillBeConverted:
        'You chose a non USDC asset. It means that it will be converted ' +
        'to USDC at the time of the deposit at the current market rate.',
      lblWhatDoWeDeposit: 'What do we deposit',
      btnDeposit: 'Deposit',
      lblYieldEstimation: 'Yield estimation',
      lblSwappingFor: 'Swapping for',
      lblAmountWeDepositIn: 'Amount we deposit in',
      lblReviewYourDeposit: 'Review your deposit',
      lblAndTotalOf: 'And it will be a total of',
      lblUseSmartTreasury: 'Use Smart Treasury rewards to cover gas',
      lblEstimatedGasCost: 'Estimated gas cost',
      txtYieldEstimation:
        'Estimated annual yield based on your deposit amount is {amount} at the current rate of {apy}% APY.'
    },
    withdraw: {
      lblChooseAmount: 'Choose the amount to withdraw',
      lblAmountWeWithdrawIn: 'Amount we withdraw in',
      lblWhatDoWeWithdraw: 'What we do withdraw',
      lblAndTotalOf: 'And it will be a total of',
      lblWithdrawFromSavings: 'Withdraw from @:savings.lblSavingsPrefix',
      txtWithdrawShortDescription:
        'Remove your assets from savings fully or partially',
      txtWithdrawDescription:
        'You can withdraw the entire or partial balance. ' +
        'Available balance consists of principal amount you deposited ' +
        'together with the accumulated yield.',
      lblWhatToWithdraw: 'What to withdraw',
      lblReviewYourWithdraw: 'Review your withdrawal',
      btnWithdraw: 'Withdraw',
      lblWhatAboutTheYield: 'What about the yield?',
      lblUseSmartTreasury: 'Use Smart Treasury rewards to cover gas',
      lblEstimatedGasCost: 'Estimated gas cost',
      txtIfYouKeepSavings:
        'If you keep your savings, you could earn in a year.',
      txtWhatAboutTheYield:
        'Estimated lost annual yield based on your withdrawal amount is {amount} at the current rate of {apy}% APY.'
    }
  },
  treasury: {
    icon: '🐷',
    lblTreasuryHeader: '{amount} @:treasury.lblTreasuryBonuses',
    lblSmartTreasury: 'Smart Treasury',
    lblMySmartTreasury: 'My Smart Treasury',
    lblNothingInTreasury: 'Nothing in @:treasury.lblTreasury',
    txtNothingInTreasury: 'Looks like you don’t have Treasury Boost, yet',
    lblTreasuryEarnedToday: '@:treasury.lblTreasury brought you {amount} today',
    lblTreasuryBonuses: 'Treasury Bonuses',
    lblTreasuryBonusBalance: '@:treasury.lblSmartTreasury Bonus Balance',
    lblTreasuryBalance: '@:treasury.lblSmartTreasury Balance',
    lblTreasury: 'Treasury',
    lblTreasuryPrefix: 'Treasury',
    lblManageTreasury: 'Manage @:treasury.lblTreasuryPrefix',
    lblIfYouReserveMoveInST:
      'If you reserve MOVE in Smart Treasury now, you are getting',
    txtTreasuryEmptyDescription:
      'Movers save on gas every year with the rewards from Treasury',
    lblTreasuryOverview: '@:treasury.lblSmartTreasury Overview',
    txtTreasuryOverviewDescription:
      'It is a piggy bank that automatically distributes Mover performance ' +
      'rewards to you, and covers your costs.',
    lblTreasuryStatements: '@:treasury.lblTreasuryPrefix Statements',
    lblReservedAssetsValue: 'My reserved boost value',
    lblCurrentBoost: 'My current boost',
    lblMaximumBoost: 'Maximum boost',
    lblStartBoosting: 'Start boosting',
    lblGasCostCoverage: 'Gas cost coverage',
    lblSmartTreasurySize: 'Smart Treasury Size',
    lblTreasuryStats: '@:treasury.lblTreasuryPrefix Stats',
    lblEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblSpentToday: 'Spent today',
    lblSpentThisMonth: 'Spent this month',
    lblSpentInTotal: 'Spent in total',
    lblReservedAssets: 'Reserved assets',
    leftRail: {
      lblManageSmartTreasury: 'Manage Smart Treasury',
      lblIncreaseBoost: 'Increase Boost',
      lblIncreaseBoostDescription: 'Increase your Treasury rewards',
      lblDecreaseBoost: 'Decrease Boost',
      lblDecreaseBoostDescription: 'Remove assets from Treasury',
      lblClaimAndBurn: 'Claim & Burn',
      lblClaimAndBurnDescription: 'Burn MOVE and claim USDC',
      lblPowerCard: 'Powercard',
      lblPowerCardDescription: 'NFT with benefits',
      lblGlobalAnalytics: 'Global analytics',
      lblGlobalAnalyticsDescription: 'All information about Treasury'
    },
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
    lblReviewTransaction: 'Review transaction',
    powercard: {
      lblThePowercard: 'The Powercard',
      txtThePowercardPageDescription:
        'The Powercard allows it’s owner to temporary increase the boost ' +
        'in the treasury. Think of it as a superpower perk. It activates ' +
        'extra double boost for 30 days, and then it cools down for 60 days.',
      lblAdditionalBoost: 'Additional boost',
      lblActive: 'Active',
      lblCooldown: 'Cooldown',
      lblPowercardStatus: 'Powercard Status',
      lblRemainingTime: 'Remaining time',
      btnActivateThePowercard: 'Activate the Powercard',
      btnRemoveThePowercard: 'Remove the Powercard',
      lblIfYouActivateCard: 'If you activate the Powercard now, you are getting'
    },
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
      txtYouApproximateBoost: 'Your approximate boost in the Smart Treasury.',
      txtIncreaseBoostPageDescription:
        'The larger your share of the Smart Treasury is, the more rewards ' +
        'you can get. To increase your share, use increase boost. Reserve ' +
        'MOVE or MOVE-ETH LP tokens to increase your boost.',
      txtIncreaseBoostDescription: {
        part1: 'There are two boost options. Reserving ',
        part2:
          ' MOVE tokens will increase (1x) your rewards share based on the ' +
          'total amount of the tokens you have reserved. Reserving ',
        part3:
          ' MOVE-ETH LP tokens will multiply by 2,5 (2.5x) your rewards share ' +
          'based on the total amount of LP tokens you have reserved.'
      },
      txtYouChooseMove:
        'You chose MOVE token. It means that the maximum boost can be 1x.',
      txtYouChooseMoveETHLp:
        'You chose MOVE-ETH LP token on Sushi. It means that the maximum ' +
        'boost can be up to 2.5x.',
      lblAvailable: 'Available',
      lblWhatDoWeReserve: 'What do we reserve',
      lblAmountWeReserveIn: 'Amount we reserve in',
      lblChooseAmount: 'Choose the amount to reserve',
      lblReviewYourIncrease: 'Review your increase',
      lblAmountWeDepositIn: 'Amount we deposit in',
      lblAndTotalOf: 'And it will be a total of',
      lblUseSmartTreasury: 'Use Smart Treasury rewards to cover gas',
      lblEstimatedGasCost: 'Estimated gas cost',
      lblWhatToReserve: 'What to reserve',
      btnIncreaseBoostInSmartTreasury: 'Increase boost in Smart Treasury',
      btnIncreaseBoost: 'Increase Boost',
      lblEstimatedBoost: 'Estimated boost',
      txtEstimatedBoost:
        'Estimated new Treasury boost is {estimatedAmount}x. ' +
        'As a reminder, your current boost rate is {currentAmount}x.'
    },
    decreaseBoost: {
      lblDecreaseBoost: 'Decrease Boost',
      txtYouApproximateBoost: 'Your approximate boost in the Smart Treasury.',
      txtDecreaseBoostPageDescription:
        'Decrease the boost will return your reserved assets, but will also ' +
        'decrease your Smart Treasury share and future rewards. ' +
        'Earned rewards always stay with you.',
      txtDecreaseBoostDescription:
        'Decrease the boost, will return your reserved assets, ' +
        'but will also decrease your Treasury share.',
      txtYouChooseMove:
        'You chose to remove MOVE token. It means that your new ' +
        'boost value will be up to 1x lower.',
      txtYouChooseMoveETHLp:
        'You chose MOVE-ETH LP token on Sushi. It means that the maximum ' +
        'boost can be up to 2.5x.',
      lblAvailable: 'Available',
      lblWhatDoWeRemove: 'What do we remove',
      lblAmountWeRemoveIn: 'Amount we remove in',
      lblChooseAmount: 'Choose the amount to remove',
      lblReviewYourDecrease: 'Review your decrease',
      lblAndTotalOf: 'And it will be a total of',
      lblUseSmartTreasury: 'Use Smart Treasury rewards to cover gas',
      lblEstimatedGasCost: 'Estimated gas cost',
      btnDecreaseBoostInSmartTreasury: 'Decrease boost in Smart Treasury',
      lblWhatToReturn: 'What to return',
      btnDecreaseBoost: 'Decrease Boost',
      lblWhatAboutTheBoost: 'What about the boost?',
      txtWhatAboutTheBoost:
        'Estimated new Treasury boost is {estimatedAmount}x. ' +
        'As a reminder, your current boost rate is {currentAmount}x.'
    },
    claimAndBurn: {
      lblClaimAndBurn: 'Claim & Burn',
      txtYouApproximateExit: 'Your approximate exit one-time payout.',
      txtClaimAndBurnPageDescription:
        'Claim & Burn allows you to exchange your MOVE tokens for a larger ' +
        'portion of the Smart Treasury. You will burn your MOVE tokens, and ' +
        'receive a one-time payout in USDC.',
      txtClaimAndBurnDescription:
        'Claim & Burn allows you to exchange your MOVE tokens for a larger ' +
        'portion of the Smart Treasury. You will burn your MOVE tokens, ' +
        'and receive four times (4x) of your treasury share in a one-time payout.',
      txtYouChooseMove:
        'You chose MOVE. You will burn your MOVE tokens in exchange ' +
        'for a one-time payout from the Treasury.',
      lblWhatDoWeBurn: 'What do we burn',
      lblWhatToBurn: 'What to burn',
      lblAvailable: 'Available',
      lblAmountWeBurnIn: 'Amount we burn in',
      lblChooseAmount: 'Choose the amount to burn',
      lblReviewYourClaim: 'Review your claim',
      lblAndTotalOf: 'The amount you will receive',
      lblUseSmartTreasury: 'Use Smart Treasury rewards to cover gas',
      lblEstimatedGasCost: 'Estimated gas cost',
      btnClaimAndBurnWithAssets: 'Claim {asset1} and burn {asset2}',
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
      txt: 'Vote FOR',
      emoji: '👍'
    },
    btnVoteAgainst: {
      txt: 'Vote AGAINST',
      emoji: '👎'
    },
    btnProposalAnalytics: {
      txt: 'Proposal analytics',
      emoji: '🌍'
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
    lblCurrentOutcome: 'Current outcome',
    txtGovernanceImageAlt: 'Governance icon image',
    lblMyGovernance: 'My Governance',
    lblManageGovernance: 'Manage Governance',
    txtCreateAProposal: 'Community Voting',
    txtCreateAProposalAlt: 'Create a proposal icon image',
    txtGlobalAnalytics: 'All information about Governance',
    lblGlobalAnalytics: 'Global analytics',
    txtGetInvolved:
      'Community governance is the key in ' +
      'Mover’s ecosystem. Your voice matters.',
    txtGovernanceGlobalAnalyticsImageAlt: 'Global analytics icon image',
    txtGovernanceOverview:
      'Governance is a non-custodial and permissionless ' +
      'product. Check the global statistics across the board.',
    lblMyVotingPower: 'My voting power',
    lblPowerNeeded: 'Power needed to become a proposer',
    lblTotalNumberOfProposals: 'Total number of proposals',
    txtVoteFor:
      'You are about to vote FOR. ' +
      'It means that you want this proposal to pass.',
    txtVoteAgainst:
      'You are about to vote AGAINST. ' +
      'It means that you want this proposal to defeat.'
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
    txtLogoAlt: '@:nibbleShop.lblNibbleShop image',
    txtProductAlt: '{title} product image',
    lblTotalAvailable: 'Total available',
    lblPrice: 'Price',
    lblWhatElseCanDo: 'What else can you do',
    btn: {
      get: {
        txt: 'Purchase the {item}'
      },
      redeem: {
        emoji: '📦',
        txt: 'Reedem'
      },
      sell: {
        emoji: '🚪',
        txt: 'Sell'
      },
      buy: {
        emoji: '🛍',
        txt: 'Buy'
      }
    },
    lblNoNFT: "That's sour! You don't have Sweet & Sour NFT",
    txtNoNFT:
      "Looks like you don't have Sweet & Sour NFT. It means that you can't access Nibble Shop.",
    txtAssets: {
      $CEO1: {
        description:
          'Nothing really to add here. This cap is hand-made for all the CEOs of all the monies. ' +
          'CEOs are very busy, thus it is a limited addition with only 30 caps ever to be made. ' +
          'This is a genesis limited addition with only 30 caps ever to be made. One size fits all CEOs.'
      },
      $SJ1: {
        description:
          'The face mask is stylish and cool, and it’s also hand-made. It’s how you can be different from ' +
          'all other folks on the street. It’s also how you can spot a fellow mover in the wild. ' +
          'This mask is also a limited edition with only 30 ever to be released.'
      },
      $IC1: {
        description:
          'What can be better than a classic? An instant classic. This limited edition T-shirt is an instant ' +
          'classic. The print is hand-made, with the highest quality and attention to details. In fact, this ' +
          'T-shirt is so attentive, that it has all attention. There are only 50 of these ever to be made.'
      },
      $PWR01: {
        description:
          'What a power! So, if you have the Powercard NFT, you can get this T-Shirt. The club is small, and elite. ' +
          'There are only 21 Power T-Shirts, and there are only 21 Powercards. You do the math.'
      }
    }
  },
  NFTs: {
    lblDiceProject: 'Dice Project',
    lblVaults: 'Vaults',
    lblUnexpectedMove: 'Unexpected Move',
    lblMovingWithOlympus: 'Moving with Olympus',
    lblSweetAndSour: 'Sweet & Sour',
    lblNFTDrops: 'NFT Drops',
    lblNFTOverview: '{name} Overview',
    lblTotalNumberOfNFTs: 'Total number of NFTs',
    lblTotalAmount: 'Total amount',
    lblTotalClaimed: 'Total claimed',
    lblTotalExchanged: 'Total exchanged',
    lblAvailableFrom: 'Available from',
    lblAvailableTo: 'Available to',
    lblWhatElseCanDo: 'What else can you do',
    lblDontFitTheCriteria: 'Don’t fit the criteria?',
    lblOtherDiceOptions: 'Other dice options?',
    txtLogoAlt: '@:NFTs.lblNFTDrops image',
    txtAssetAlt: '{name} NFT asset image',
    txtOhNo: 'Oh no. Seems like you can’t claim this NFT.',
    txtOhNoSomething: 'Oh no. Something went wrong',
    txtNFTs: {
      dice: {
        description:
          'Dice is a randomizer contract as NFT. You can roll from ' +
          'your wallet, and store results on chain',
        pageDescriptionPartOne:
          'Every adventure starts with rolling a dice. Make your next step ' +
          'in the Loot Metaverse. Dice is the NFT you can claim. It also ' +
          'allows you to roll a dice and store results on chain.',
        pageDescriptionPartTwo: 'For more details, please visit the {0}.'
      },
      vaults: {
        description:
          'Vault is a randomized adventurer bank account generated and ' +
          'stored on chain.',
        pageDescriptionPartOne:
          'Vault is a randomized adventurer bank account generated and stored ' +
          'on chain. Every day vault owners can roll the dice on chain. ' +
          'Every week the vault that has the highest number of points ' +
          'wins the entire pool balance.',
        pageDescriptionPartTwo:
          'For more details on the criteria, please see the {0}',
        faq: 'FAQ'
      },
      movingWithOlympus: {
        description:
          'The Moving with Olympus NFT gives you an exclusive avatar.',
        pageDescriptionPartOne:
          'The Moving with Olympus is the limited NFT series available only ' +
          'for 3 hours. 3 hours is all it takes to become a part of something ' +
          'bigger than any one of us.',
        pageDescriptionPartTwo:
          'This NFT gives it’s owner a right to a ' +
          'unique avatar on Mover. Wear the badge of honor.'
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
        pageDescriptionPartOne:
          'This NFT is dropped for all unique addresses that have held HOLY ' +
          'until April 31, 2021; and those that participated in the early LP ' +
          'program but didn’t migrate.',
        pageDescriptionPartTwo:
          'The Sweet & Sour NFT gives early access to Nibble Shop.'
      },
      unexpectedMove: {
        description:
          'The Unexpected Move NFT can be exchanged for 1 MOVE token, ' +
          'but only once.',
        pageDescriptionPartOne:
          'This NFT is dropped for all participants in our Twitter promo.',
        pageDescriptionPartTwo:
          'The Unexpected Move NFT can be exchanged for 1 MOVE token, ' +
          'but only once.'
      }
    },
    btn: {
      unexpectedMove: {
        get: {
          txt: 'Get my Unexpected Move'
        },
        claimAndExchange: {
          emoji: '🦍',
          txt: 'Claim and Exchange for MOVE'
        },
        exchange: {
          emoji: '🔄',
          txt: 'Exchange for MOVE'
        }
      },
      sweetAndSour: {
        get: {
          txt: 'Get my Swet & Sour'
        }
      },
      movingWithOlympus: {
        get: {
          txt: 'Get my Moving with Olympus'
        }
      },
      vaults: {
        get: {
          txt: 'I fit the criteria, get my Vault'
        },
        noWorries: {
          emoji: '🤓',
          txt: 'No worries, still get the Vault'
        }
      },
      dice: {
        get: {
          txt: 'Get the 20-sided dice'
        },
        fourSide: {
          emoji: '🍀',
          txt: '4-sided dice'
        },
        sixSide: {
          emoji: '🎲',
          txt: '6-sided dice'
        },
        doubleSixSide: {
          emoji: '👯‍♀️',
          txt: 'two 6-sided dice'
        },
        eightSide: {
          emoji: '🎱',
          txt: '8-sided dice'
        },
        tenSide: {
          emoji: '🔟',
          txt: '10-sided dice'
        },
        twelveSide: {
          emoji: '🕛',
          txt: '12-sided dice'
        },
        twentySide: {
          emoji: '🧙‍♂️',
          txt: '20-sided dice'
        }
      }
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
    txtTokenInfoAlt: '{name} info on Etherscan',
    txtMovingWithOlympusAvatarAlt: 'Moving with Olympus'
  },
  more: {
    lblMore: 'More'
  }
};
