import VueI18n from 'vue-i18n';

import { ValidationErrorReason } from '@/services/v2/api/0x/types';
import { NftAssetId } from '@/store/modules/nft/types';

const messages: VueI18n.LocaleMessageObject = {
  lblPageTitleDefault: 'Mover App',
  lblWelcome: 'Welcome',
  lblBalance: 'Balance',
  lblYourWallet: 'Your wallet',
  headingBalance: 'Your wallet balance',
  lblConnectWallet: 'Please connect your wallet',
  txtNotFound:
    'Wow, how did you end up here?\nSeems like even Google isn’t as of help.',
  btnConnectWallet: 'Connect a wallet',
  txtChangeWalletAlt: 'Change wallet icon',
  lblWallet: 'Wallet',
  lblDisconnectEmoji: '🚪',
  lblDisconnect: '@:lblDisconnectEmoji Disconnect',
  lblNewToMover: 'Looks like you are new to Mover',
  lblMore: 'More',
  lblPageTitleSuffix: 'Portfolio',
  lblInsufficientBalance: 'Insufficient Balance',
  lblEnterAmount: 'Enter amount',
  lblNoData: 'No data',
  lblDashboardMobile: 'Oh no!',
  txtDashboardMobile:
    'Mover web app is for the big screens. We’ve got mobile apps for all the smaller screens.',
  btnDashboardMobile: 'Got it. Take me home',
  lblTokenAlt: '{symbol} token image',
  lblHistory: 'History',
  lblTotalBalance: 'Total balance',
  lblCollectibles: 'Collectibles',
  lblNoMoreTransactions: 'No more transactions',
  lblNoMoreTokens: 'No more tokens',
  errors: {
    default: 'Oh no. Something went wrong'
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
  estimationError: 'Estimation error',
  exchangeError: 'Exchange error',
  forms: {
    lblUseSmartTreasury: 'Use Smart Treasury rewards to cover gas',
    lblEstimatedGasCost: 'Estimated gas cost',
    lblAvailable: 'Available',
    lblSwappingFor: 'Swapping for',
    lblChooseToken: 'Choose Token',
    lblChooseAmount: 'Choose amount',
    lblReviewTransaction: 'Review transaction'
  },
  menu: {
    lblSwapToken: 'Swap Tokens',
    lblDepositInSavings: 'Deposit in Savings',
    lblIncreaseBoost: 'Increase boost',
    lblBeautifulCard: 'Beautiful Card',
    lblComingSoon: 'Coming soon',
    lblCardTopUp: 'Card top up',
    lblDepositInSavingsPlus: 'Deposit in Savings Plus',
    lblStakeUBT: 'Stake UBT'
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
    },
    errors: {
      [ValidationErrorReason.InsufficientAssetLiquidity]:
        'Cannot execute swap. Not enough liquidity'
    }
  },
  debitCard: {
    icon: '💳',
    lblDebitCard: 'Debit Card',
    lblDebitCardHeading: 'It’s here!',
    txtDebitCard: 'The Beautiful Card is here! Order yours now.',
    btnOrderDebitCard: 'Order the card',
    lblMyCard: 'My Card',
    lblBeautifulCard: 'Beautiful Card',
    txtBeautifulCard:
      'The Beautiful Card is brought to you by Mover and our partner Trastra',
    txtBeautifulCardBenefits: 'Your Beautiful Card has the following benefits',
    lblFree: 'Free',
    txtFree: 'Crypto to EUR for free',
    lblNoLimit: 'No limit',
    txtNoLimit: 'No monthly or annual limit',
    lblEUR: 'EUR',
    txtEUR: 'Personal EUR IBAN',
    lblYourEmailAddress: 'Your email address',
    txtYourEmailAddressPlaceholder: 'your@email.com',
    lblYourPhoneNumber: 'Your phone number',
    txtYourPhoneNumberPlaceholder: '+441234567890',
    lblYourGender: {
      label: 'Your gender',
      placeholder: 'Choose gender',
      male: 'Male',
      female: 'Female'
    },
    lblYourTitle: {
      label: 'Your title',
      placeholder: 'Choose title',
      mr: 'Mr.',
      mrs: 'Mrs.',
      miss: 'Miss',
      dr: 'Dr.'
    },
    lblOrderCard: 'gm! Order a card',
    txtOrderCard:
      'You can now order a Beautiful Card brought to you by our partner Trastra. ' +
      'Keep in mind, this is a Beautiful Card, meaning that this type of a card is an “alpha” version. ' +
      'It also means that Mover doesn’t store or collect your personal data, it is handled securely by licensed partner.',
    lblYourHonorificPrefix: 'Your honorific prefix',
    txtYourHonorificPrefixPlaceholder: 'Mr. or Ms. or Mx.',
    lblYourFamilyName: 'Your last name',
    txtYourFamilyNamePlaceholder: 'Movemoto',
    lblYourGivenName: 'Your first name',
    txtYourGivenNamePlaceholder: 'Antoshi',
    lblYourDateOfBirth: 'Date of birth',
    lblYourSecurityCode: 'Security code',
    txtYourSecurityCodePlaceholder: '1234',
    btnValidateOrOrderCard: 'Validate or order card',
    btnOrderCard: 'Order Beautiful Card',
    lblValidateYourNumber: 'Validate your number',
    txtEnterSecurityCode: 'Enter a security code your received in the SMS',
    btnChangePhoneNumber: 'Change your phone number',
    lblNotAvailable: 'n/a',
    lblManageCard: 'Manage Card',
    lblCardTopUp: 'Card top up',
    txtCardTopUp: 'Top up your debit card with crypto',
    lblChangeSkin: 'Change skin',
    txtChangeSkin: 'Your digital NFT card skin',
    lblSkins: 'Skins',
    txtSymbolImageAlt: '{name} skin image',
    state: {
      active: 'Active',
      order_now: 'Order now',
      pending: 'Pending',
      frozen: 'Frozen',
      expired: 'Expired'
    },
    txtCardStatus: {
      orderNow: 'Order now',
      pending: 'Pending',
      active: 'Active',
      frozen: 'Frozen',
      expired: 'Expired'
    },
    txtHistoryMessage: {
      order_process_started:
        'You have started your Beautiful Card order process',
      kyc_process_started: 'You have started your KYC process. Beautiful day!',
      documents_verified: 'Your documents have been verified. Lovely!',
      card_shipped: 'Your Beautiful Card has been shipped to you'
    },
    txtVisaDebitCard: 'Visa Debit Card',
    lblLast4Digits: 'Last 4-digits',
    lblExpiryDate: 'Expiry date',
    lblIBAN: 'IBAN',
    lblBIC: 'BIC',
    kycLink: {
      description:
        'You have successfully started your Beautiful Card order process. Here is your {0}',
      link: 'KYC link'
    },
    lblProceedAfterKyc: 'Proceed',
    topUp: {
      lblTopUp: 'Card top up',
      txtTopUp:
        'You can top up your card with any asset, and it will be automatically settled for your EUR balance.',
      txtApproximateEUREstimation: 'That would be approximately in Euro',
      lblWhatDoWeTopUp: 'What do we top up',
      lblAmountWeDepositIn: 'Amount we deposit in',
      btnChooseAmount: 'Choose the amount to top up',
      txtNativeAsset:
        'USDC is a native asset used for the conversion, so there is no additional gas fees for conversion required.',
      txtNonNativeAsset:
        'You chose a non USDC asset. It means that it will be converted ' +
        'to USDC at the time of the top up at the current market rate.',
      lblReviewYourTopUp: 'Review your top up',
      lblAmountWeTopUpIn: 'Amount we top up in',
      lblAndItWillBeTotalOf: 'And it will be total of',
      btnTopUpCard: 'Top up Beautiful Card'
    },
    changeSkin: {
      lblDigitalCardSkin: 'Digital card skin',
      txtDigitalCardSkin:
        'If you hold a special NFT skin, you can change it at any point of time for free. There is no expiry date or limitations. Make it your card!',
      lblWhatSkinDoWeChoose: 'What skin do we choose',
      skins: {
        default: {
          name: 'Default skin',
          description: 'This is a default skin. It means that you are a mover!'
        },
        'cat-ass': {
          name: 'Cat Ass',
          description:
            'You see the world from a non-conventional angle. You are different. We are different.'
        },
        'shiny-one': {
          name: 'Shiny one'
        },
        gorilla: {
          name: 'Gorilla'
        },
        badge: {
          name: 'Badge'
        },
        horns: {
          name: 'Horns'
        },
        txtSkinAlt: '{name} skin image'
      },
      btnChooseAnotherCardSkin: 'Choose another card skin',
      btnApplySkin: 'Apply skin',
      lblSkin: 'Skin',
      lblSearchAnySkin: 'Search any skin',
      lblAvailableSkins: 'Available skins',
      lblWeCouldNotFindThisSkinAnywhere: "We couldn't find this skin anywhere"
    },
    errors: {
      default: 'Oh no. Something went wrong',
      minAmount: 'Minimum card top-up amount is {min} EUR',
      email: {
        required: 'Email is required',
        invalid: 'Enter a valid email address'
      },
      phoneNumber: {
        required: 'Phone number is required',
        minLength:
          'Phone number length should be at least {minLength} symbols (not including "+" sign)',
        maxLength:
          'Phone number length should be {maxLength} symbols maximum (not including "+" sign)'
      },
      familyName: {
        required: 'Last name is required',
        invalid:
          "Last name should not contain symbols rather than letters, space, apostrophe (') or hyphen (-)"
      },
      givenName: {
        required: 'First name is required',
        invalid:
          "First name should not contain symbols rather than letters, space, apostrophe (') or hyphen (-)"
      },
      dateOfBirth: {
        required: 'Date of birth is required',
        invalid: 'Value should represent a valid date (e.g. 1998/03/18)'
      },
      code: {
        required: 'Security code is required',
        numeric: 'Security code should contain digits only (0-9)',
        length: 'Security code should contain exactly {length} symbols'
      },
      gender: {
        required: 'Gender is required'
      },
      title: {
        required: 'Title is required'
      },
      alreadyRegistered: 'This email is already used',
      badPhoneSyntax:
        'Phone number should be valid (e.g. @:debitCard.txtYourPhoneNumberPlaceholder)',
      incorrectCode: 'Security code is invalid. Please try again',
      notSupportedCountry:
        'Sorry, but {country}{flag} is not supported yet. We are looking forward to expanding as soon as possible.',
      notSupportedCountryFallback:
        'Sorry but the country associated with your phone number is not supported yet. We are looking forward to expanding as soon as possible.'
    }
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
    lblLoadMonthStatError: 'Failed to load Savings monthly statements',
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
      lblAmountWeDepositIn: 'Amount we deposit in',
      lblReviewYourDeposit: 'Review your deposit',
      lblAndTotalOf: 'And it will be a total of',
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
    lblRemainingDays: '{days} days',
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
    lblSmartTreasuryStatements: 'Smart Treasury Statements',
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
    lblCurrentCostCoverage: 'up to 100%',
    lblLoadMonthStatError: 'Failed to load Treasury monthly statements',
    leftRail: {
      lblManageSmartTreasury: 'Manage Smart Treasury',
      lblIncreaseBoost: 'Increase Boost',
      lblIncreaseBoostDescription: 'Increase your Treasury rewards',
      lblDecreaseBoost: 'Decrease Boost',
      lblDecreaseBoostDescription: 'Remove assets from Treasury',
      lblClaimAndBurn: 'Claim & Burn',
      lblClaimAndBurnDescription: 'Burn MOVE and claim USDC',
      lblClaimAndBurnMOBODescription: 'Burn MOBO and claim USDC',
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
      lblWhatDoWeReserve: 'What do we reserve',
      lblAmountWeReserveIn: 'Amount we reserve in',
      lblChooseAmount: 'Choose the amount to reserve',
      lblReviewYourIncrease: 'Review your increase',
      lblAmountWeDepositIn: 'Amount we deposit in',
      lblAndTotalOf: 'And it will be a total of',
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
      lblWhatDoWeRemove: 'What do we remove',
      lblAmountWeRemoveIn: 'Amount we remove in',
      lblChooseAmount: 'Choose the amount to remove',
      lblReviewYourDecrease: 'Review your decrease',
      lblAndTotalOf: 'And it will be a total of',
      btnDecreaseBoostInSmartTreasury: 'Decrease boost in Smart Treasury',
      lblWhatToReturn: 'What to return',
      btnDecreaseBoost: 'Decrease Boost',
      lblWhatAboutTheBoost: 'What about the boost?',
      txtWhatAboutTheBoost:
        'Estimated new Treasury boost is {estimatedAmount}x. ' +
        'As a reminder, your current boost rate is {currentAmount}x.'
    },
    claimAndBurnMOBO: {
      lblClaimAndBurn: 'Claim & Burn',
      txtYouApproximateExit: 'Your approximate exit one-time payout.',
      txtPageDescription:
        'MOBO will be deprecated, and replaced with a new upgraded system. ' +
        'You can now exchange it 1:1 for USDC. You will burn your MOBO ' +
        'tokens, and receive a one-time payout in USDC.',
      txtYouChooseMOBO:
        'You chose MOBO. You will burn your MOBO tokens in exchange for a ' +
        'one-time payout from the Treasury.',
      lblWhatDoWeBurn: 'What do we burn',
      lblAmountWeBurnIn: 'Amount we burn in',
      lblChooseAmount: 'Choose the amount to burn',
      btnClaimAndBurnWithAssets: 'Claim USDC and burn MOBO',
      lblBurnError: 'Burn conditions error',
      lblAndTotalOf: 'The amount you will receive',
      lblReviewYourClaim: 'Review your claim',
      lblBurnLimitReached: 'Burn limit reached',
      lblDontHaveMOBO: `You don't have any MOBO to convert to USDC`
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
      lblAmountWeBurnIn: 'Amount we burn in',
      lblChooseAmount: 'Choose the amount to burn',
      lblReviewYourClaim: 'Review your claim',
      lblAndTotalOf: 'The amount you will receive',
      btnClaimAndBurnWithAssets: 'Claim USDC and burn MOVE',
      btnClaimAndBurn: 'Claim & Burn',
      lblThePayout: 'The payout',
      txtThePayout:
        'Estimated one-time payout {payout} USDC. As a reminder, you will burn {burning} MOVE.',
      lblBurnError: 'Burn conditions error',
      lblBurnLimitReached: 'Burn limit reached'
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
    txtMovingWithOlympusAvatarAlt: 'Moving with Olympus',
    txtPendingIconAlt: 'pending'
  },
  more: {
    lblMore: 'More'
  },
  provider: {
    errors: {
      4001: 'Oh no. You have rejected the provider request. Please try again',
      4100: 'Oh no. Something is wrong with your provider. Please try again or use different provider instead',
      4200: 'Oh no. Your provider does not support this method. Please use different provider instead',
      4900: 'Oh no. Your provider is disconnected from all chains. Please refresh the page or use different provider instead',
      4901: 'Oh no. Your provider is disconnected from Ethereum chain. Please refresh the page or use different provider instead'
    }
  },
  lblSearch: 'Search',
  lblOhSnap: 'Oh, snap!',
  txtCouldNotFindToken: 'We couldn’t find this token anywhere',
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
      active: 'Voting is open',
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
      text: 'View'
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
    lblDaysToRun: 'Days to run',
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
      'It means that you want this proposal to defeat.',
    lblProposalStats: 'Proposal Stats',
    txtCreateAProposal:
      'You are about to create a governance proposal. Make it count.',
    txtCreateAProposalTip:
      'A small tip. To make it easier for other community members a proposal should be answered as simple ' +
      'yes or no. Make a descriptive title, and an accurate explanation. The more details you provide, the ' +
      'easier it will be to make a decision for others.',
    lblProposalTitle: 'Proposal title',
    txtProposalTitlePlaceholder: 'My title',
    lblProposalDescription: 'Proposal description',
    txtProposalDescriptionPlaceholder: 'My proposal description',
    errors: {
      default: 'Oh no. Something went wrong',
      'too large message': 'The description is too large',
      'no voting power': 'You have no voting power to do this',
      'not in voting window': 'The voting is already closed',
      'too many requests':
        'You are making too many requests, please wait at least 10 seconds then try again',
      'already voted': 'Oh no. Seems like you already voted',
      'not enough power to vote':
        "Oh no. Seems like you don't have enough power to vote",
      'not enough power to create a proposal':
        "Oh no. Seems like you don't have enough power to create a proposal",
      'voting is not started yet': 'Oh no. Voting is not started yet',
      'voting is closed': 'Oh no. Voting is already closed',
      'wrong timestamp':
        "Oh no. The request too long, or your system is out of sync. Looks like you'll have to try again later"
    },
    btnTogglePreview: 'Toggle preview',
    txtTogglePreview: 'Toggle markdown preview',
    createProposal: {
      validations: {
        title: {
          required: 'This field is required. Please provide a title',
          maxLength: 'Maximum length should be less than {boundary}'
        },
        description: {
          required: 'This field is required. Please provide a description',
          maxLength: 'Maximum length should be less than {boundary}'
        }
      }
    },
    lblIpfsLink: 'Your registered vote',
    txtIpfsLink: 'Link'
  },
  NFTs: {
    lblDiceProject: 'Dice Project',
    lblVaults: 'Vaults',
    lblUnexpectedMove: 'Unexpected Move',
    lblMovingWithOlympus: 'Moving with Olympus',
    lblSweetAndSour: 'Sweet & Sour',
    lblOrderOfLiberty: 'Help Ukraine',
    lblNFTDrops: 'NFT Drops',
    lblNFTOverview: '{name} Overview',
    lblTotalNumberOfNFTs: 'Total number of NFTs',
    lblTotalAmount: 'Total amount',
    lblTotalClaimed: 'Total claimed',
    lblTotalMinted: 'Total minted',
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
    lblPrice: 'Price',
    txtNFTs: {
      [NftAssetId.OrderOfLiberty]: {
        description:
          'The Order of Liberty honours your noble merit ' +
          'of supporting the most vulnerable Ukrainians during the terrible times of war.',
        pageDescriptionPartOne:
          'Ukraine can’t remain just a white spot on the map. It’s a beautiful country, full of brave people, ' +
          'promising talents, loving families. It’s our Homeland. ' +
          'The place we were born and grew up in. The place we admire wholeheartedly.',
        pageDescriptionPartTwo:
          'But, as you read this, Ukraine is being destroyed.',
        pageDescriptionPartThree:
          'To help the country and the nation recover, ' +
          'we’ve arranged a collective humanitarian fundraising. ' +
          'It is organised and built by Ukrainians and compassionate people all over the world. ' +
          'The artists, {0}, {1}, and {2}, are Ukrainians. The creative team is also {3}.',
        pageDescriptionPartFour:
          '100% of proceeds will go to help the most vulnerable Ukrainians with food, water, shelter, ' +
          'and essential supplies. Crypto has no borders. We must help. ' +
          'If you want to donate non-crypto, here is an alternative {0} focusing on humanitarian help' +
          'as well.',
        pageDescriptionDisclaimer:
          'Disclaimer: This is strictly a humanitarian aid help mission. ' +
          'Nothing shall be used for any political and/or commercial goals by Mover or any 3rd parties.',
        txtArtistRoman: 'Roman',
        txtArtistAlina: 'Alina',
        txtArtistOksana: 'Oksana',
        txtUkrainian: 'Ukrainian',
        txtRegisteredCharity: 'registered UK charity',
        lblOtherOptions: 'Other options?'
      },
      [NftAssetId.Dice]: {
        description:
          'Dice is a randomizer contract as NFT. You can roll from ' +
          'your wallet, and store results on chain',
        pageDescriptionPartOne:
          'Every adventure starts with rolling a dice. Make your next step ' +
          'in the Loot Metaverse. Dice is the NFT you can claim. It also ' +
          'allows you to roll a dice and store results on chain.',
        pageDescriptionPartTwo: 'For more details, please visit the {0}.'
      },
      [NftAssetId.Vaults]: {
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
      [NftAssetId.MovingWithOlympus]: {
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
      [NftAssetId.SwapPassport]: {
        description:
          'The Swap Passport NFT can be exchanged for one free swap via Mover.',
        pageDescription:
          'The Swap Passport is the limited NFT series available to those, ' +
          'who was present during the Sushi AMA on July 14th 2021. This NFT ' +
          'can be exchanged for one free swap on Mover platform.'
      },
      [NftAssetId.SweetAndSour]: {
        description: 'The Sweet & Sour NFT gives early access to Nibble Shop.',
        pageDescriptionPartOne:
          'This NFT is dropped for all unique addresses that have held HOLY ' +
          'until April 31, 2021; and those that participated in the early LP ' +
          'program but didn’t migrate.',
        pageDescriptionPartTwo:
          'The Sweet & Sour NFT gives early access to Nibble Shop.'
      },
      [NftAssetId.UnexpectedMove]: {
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
      [NftAssetId.OrderOfLiberty]: {
        help: 'Help Ukraine'
      },
      [NftAssetId.UnexpectedMove]: {
        get: 'Get my Unexpected Move',
        claimAndExchange: 'Claim and Exchange for MOVE',
        exchange: 'Exchange for MOVE'
      },
      [NftAssetId.SweetAndSour]: {
        get: 'Get my Sweet & Sour'
      },
      [NftAssetId.MovingWithOlympus]: {
        get: 'Get my Moving with Olympus'
      },
      [NftAssetId.Vaults]: {
        get: 'I fit the criteria, get my Vault'
      },
      [NftAssetId.Dice]: {
        get: 'Get the 20-sided dice',
        fourSide: '4-sided dice',
        sixSide: '6-sided dice',
        doubleSixSide: 'two 6-sided dice',
        eightSide: '8-sided dice',
        tenSide: '10-sided dice',
        twelveSide: '12-sided dice',
        twentySide: '20-sided dice'
      }
    }
  },
  transactionTypes: {
    // lowercased human-readable type as a key
    'deposit in savings': 'Deposit',
    withdraw: 'Withdraw',
    receive: 'Receive',
    'decrease boost': 'Decrease Boost',
    'card top up': 'Card top up',
    send: 'Send',
    self: 'Self',
    approve: 'Approve',
    unknown: 'Unknown'
  },
  orderOfLiberty: {
    btnOrderOfLiberty: 'Help Ukraine',
    txtOrderOfLiberty:
      'Humanitarian-only aid dedicated to the most vulnerable groups that need help now.',
    lblOrderOfLibertyHeading: 'Help Ukraine'
  },
  vaultsRace: {
    lblGames: 'Games',
    txtGamesAlt: 'Vaults race promo image',
    lblMyVaults: 'My Vaults',
    lblVaults: 'Vaults',
    lblRollDice: 'Roll dice',
    lblManageVaults: 'Manage Vaults',
    lblLeaderboard: 'Leaderboard',
    lblGlobalStatistics: 'Global Statistics',
    lblWeeklyChallenge: 'Weekly challenge',
    lblAccountNumber: 'Account number',
    lblCurrentScore: 'Current weekly score',
    lblOpenSeaCollection: 'OpenSea collection',
    lblWeeklyChallengeDescription:
      'A vault with the highest score at the end of the week, ' +
      'gets to win the prize. Roll dice daily to participate.',
    txtPageDescriptionPartOne:
      'You will roll 20-sided dice. It means that you can get ' +
      'a score from 1 to 20. Your result will be stored on ' +
      'chain during a weekly challenge. When the challenge ' +
      'ends everyone’s score is cleared, and the game restarts.',
    btn: {
      rollDice: 'Roll Dice',
      comeBackTomorrow: 'Come back tomorrow'
    },
    statistics: {
      lblGlobalLeaderboard: 'Global Leaderboard',
      txtGlobalStatisticsDescription:
        'Vaults challenge global leaderboard and statistic. ' +
        'Find out about current leaders and other ' +
        'interesting stats.',
      lblThisWeekChallengeDates: 'This week challenge dates',
      lblTotalParticipantingVaults: 'Total participanting vaults',
      lblThisWeekPrize: 'This week prize',
      lblDaysRemainingInTheWeek: 'Days remaining in the week',
      lblLeadingVault: 'Leading Vault',
      lblPositionInTheRace: 'Position in the race',
      lblTotalPointsScored: 'Total points scored'
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
    lblRedeemAnItem: 'Redeem an item',
    txtRedeemDescription:
      'Burn a digital token, and receive a ' +
      'physical item delivered to you anywhere in the world.',
    lblSell: 'Sell',
    lblYourName: 'Your name',
    lblYourEmail: 'Your email',
    lblCountry: 'Country',
    lblDeliveryAddress: 'Delivery address',
    lblTownOrCity: 'Town or city',
    lblPostalCode: 'Postal code',
    lblPlaceholders: {
      email: 'email@example.com',
      yourName: 'Antoshi Nakamoto',
      country: 'Cryptoland',
      deliveryAddress: 'Street, house or apartment number',
      postalCode: '######'
    },
    lblFullName: 'Full name',
    lblEmail: 'Email',
    lblFullAddress: 'Full address',
    txtLogoAlt: '@:nibbleShop.lblNibbleShop image',
    txtProductAlt: '{title} product image',
    lblTotalAvailable: 'Total available',
    lblPrice: 'Price',
    lblWhatElseCanDo: 'What else can you do',
    btn: {
      get: 'Purchase the {item}',
      redeem: 'Reedem'
    },
    lblNoNFT: "That's sour! You don't have Sweet & Sour NFT",
    txtNoNFT:
      "Looks like you don't have Sweet & Sour NFT. It means that you can't access Nibble Shop.",
    txtAssets: {
      $CEO1: {
        description:
          'Nothing really to add here. This cap is hand-made for all the CEOs of all the monies. ' +
          'CEOs are very busy, thus it is a limited addition with only 42 caps ever to be made. ' +
          'One size fits all CEOs. This item can be redeemed for a physical cap with free worldwide delivery.'
      },
      $SJ1: {
        description:
          'The face mask is stylish and cool, and it’s also hand-made. It’s how you can be different from ' +
          'all other folks on the street. It’s also how you can spot a fellow mover in the wild. ' +
          'This mask is also a limited edition with only 30 ever to be released.'
      },
      $OGSHIRT1: {
        description:
          'This is the second limited edition redeemable Mover drop. ' +
          'The T-shirt is hand-crafted from the finest fabric the CEO could find. ' +
          'On the inside, it contains a QR with a hash linked to this NFT to prove authenticity and exclusivity. ' +
          'On the outside, the art is so realistic, with the colors so vivid you can almost feel them. ' +
          'Hence, there are only 42 OG T-Shirts ever to be produced.'
      },
      $PWR01: {
        description:
          'What a power! So, if you have the Powercard NFT, you can get this T-Shirt. The club is small, and elite. ' +
          'There are only 21 Power T-Shirts, and there are only 21 Powercards. You do the math.'
      }
    },
    errors: {
      default: 'Oh no. Something went wrong',
      cantClaim: 'There are no avaialble NFT tokens to claim',
      cantRedeem: 'You have no NFT to redeem',
      email: {
        required: 'Email is required',
        invalid: 'Enter a valid email address'
      },
      name: {
        required: 'Name is required'
      },
      country: {
        required: 'Country is required'
      },
      address: {
        required: 'Address is required'
      },
      postCode: {
        required: 'Post code is required'
      }
    }
  },
  earnings: {
    icon: '🌻',
    lblEarnings: 'Earnings',
    lblMyEarnings: 'My Earnings',
    lblEarningsBalance: 'Earnings Balance',
    lblEarningsStatements: 'Earnings Statements',
    lblWhatDoWeDeposit: 'What do we deposit',
    lblAmountWeDepositIn: 'Amount we deposit in',
    lblWhatDoWeWithdraw: 'What do we withdraw',
    lblAmountWeWithdrawIn: 'Amount we withdraw in',
    lblAndTotalOf: 'And it will be a total of',
    lblReviewYourStake: 'Review your stake',
    lblInProgress: 'In progress',
    txtNotNativeAsset:
      'You chose a non {targetSymbol} asset. It means that it will be converted to {targetSymbol} at the time of the deposit at the current market rate.',
    btnStake: 'Stake {symbol}',
    btnWithdraw: 'Withdraw {symbol}',
    btnStart: 'Start earning',
    btnView: 'View',
    lblAndItWillBe: 'And it will be a total of',
    lblOverview: '{token} Overview',
    txtOverview:
      'Earnings is a non-custodial and permissionless product. ' +
      'Check the global statistics across the board.',
    txtYouCouldApproximately:
      'You could approximately earn in a year if you stake $10,000 now.',
    txtIfYouKeepAsset:
      'If you keep your staked assets, you could earn in a year.',
    txtIfYouStake: 'If you stake {token} now, you are getting',
    txtAPYOnAll: 'APY on all {token} staking',
    lblDepositedAssets: 'My total deposited assets value',
    lblCurrentVariableAPY: 'Current variable APY',
    lbl30DayAverageAPY: '30-day average APY',
    lblTotalAssetsUnderManagement: 'Total assets under management',
    lblEarningsStats: 'Earnings Stats',
    lblEarnedToday: 'Earned today',
    lblEarnedThisMonth: 'Earned this month',
    lblEarnedInTotal: 'Earned in total',
    lblEarningsEstimation: 'Earnings Estimation',
    lblEstimatedEarningsTomorrow: 'Estimated earnings tomorrow',
    lblEstimatedEarningsThisMonth: 'Estimated earnings this month',
    lblEstimatedEarningsAnnually: 'Estimated earnings annually',
    statement: {
      lblBalance: '{month} balance',
      lblTotalEarnedInMonth: 'Total earned in {month}',
      lblAverageDailyEarningsInMonth: 'Average daily earnings in {month}',
      lblDeposits: '{month} deposits',
      lblWithdrawals: '{month} withdrawals',
      lblSavedFees: 'Saved fees',
      lblPayoutsToEarnings: 'Payouts to Earnings'
    },
    lblEarnedRelativeMonthlyChange: 'Yield earned this month',
    lblEarnedRelativeMonthlyChangeExtendedMonthOnlyPrefix:
      'Yield earned in {date}',
    ethereum: {
      lblEthereum: 'Ethereum',
      lblManage: 'Manage Ethereum',
      lblStake: 'Stake Ethereum',
      txtStake: 'Get {apy} APY on staking ETH in Ethereum 2.0',
      txtStakePictureAlt: 'Stake Ethereum',
      lblWithdraw: 'Withdraw Ethereum',
      txtWithdraw: 'Remove your staked assets fully or partially',
      txtWithdrawPictureAlt: 'Withdraw Ethereum',
      lblGlobalAnalytics: 'Global analytics',
      txtGlobalAnalytics: 'All information about Ethereum',
      txtGlobalAnalyticsPictureAlt: 'Global analytics',
      txtNavIconAlt: 'Ethereum',
      lblEthTokenAlt: 'Ethereum token image',
      txtNativeAsset:
        'Ethereum is a native asset, and is used for staking in ' +
        'Ethereum 2.0. Your returns will also be in ETH.',
      txtStakeDescription:
        'Once you stake your assets in Ethereum 2.0, Mover is constantly ' +
        'searching for the highest paying option. Mover does automatic ' +
        'rebalancing, yield collection, and capital optimization.',
      txtPotentialEarnings: 'You could earn in a year. Considering all changes.'
    },
    olympus: {
      lblOlympus: 'Olympus',
      lblOlympusDAO: 'OlympusDAO',
      lblManage: 'Manage Olympus',
      lblStake: 'Stake Olympus',
      txtStake: 'Get {apy} APY by staking your OHM',
      txtStakePictureAlt: 'Stake Olympus',
      lblWithdraw: 'Withdraw OHM',
      txtWithdraw: 'Remove your assets from Olympus fully or partially',
      txtWithdrawPictureAlt: 'Withdraw Olympus',
      lblGlobalAnalytics: 'Global analytics',
      txtGlobalAnalytics: 'All information about Olympus',
      txtGlobalAnalyticsPictureAlt: 'Global analytics',
      txtOHMisNativeAsset:
        'OHM is a native asset of Olympus DAO. It is a rebase token, so your ' +
        'interest is automatically incremented into your principal amount.',
      txtWithdrawDescription:
        'You can withdraw the entire or partial balance. Available balance ' +
        'consists of principal amount you deposited together with the ' +
        'accumulated yield.',
      txtStakeDescription:
        'Once you stake your assets in Ethereum 2.0, Mover is constantly searching for the highest paying option. ' +
        'Mover does automatic rebalancing, yield collection, and capital optimization.',
      txtPotentialEarnings:
        'You could earn in a year. Considering all changes.',
      txtNativeAsset:
        '{symbol} is a native asset of Olympus DAO. It is a rebase token, ' +
        'so your interest is automatically incremented into your principal amount.',
      txtNavIconAlt: 'Olympus',
      lblOHMTokenAlt: 'Olympus token image'
    }
  },
  savingsPlus: {
    lblSavingsPlus: 'Savings Plus'
  },
  stakingUBT: {
    lblMain: 'My Staking',
    lblStaking: 'Staking',
    lblManage: 'Manage Staking',
    lblDeposit: 'Deposit in Staking',
    txtDeposit: 'Simple staking in friendly protocols',
    lblWithdraw: 'Withdraw from Staking',
    txtWithdraw: 'Remove your assets from staking fully or partially',
    lblBalance: 'Staking Balance',
    lblStakingStatements: 'Staking Statements',
    btnView: 'View',
    txtYieldEarnedIn: 'Yield earned in {month}',
    txtApproximateEarnEstimation:
      'You could approximately earn in a year if you deposit {amount} now.',
    txtIfYouDeposit: 'If you deposit in Staking now, you are getting',
    btnStartStaking: 'Start staking',
    txtEarnEstimation: 'You could earn in a year. Considering all changes.',
    txtDepositDescription:
      'Once you deposit your assets in staking, Mover is constantly searching for the highest staking option on UBT staking. Mover does automatic rebalancing, yield collection, and capital optimization.',
    txtWithdrawDescription:
      'You can withdraw the entire or partial balance. Available balance consists of principal amount you deposited together with the accumulated yield',
    txtKeepEstimation: 'If you keep your savings, you could earn in a year.'
  }
};

export default messages;
