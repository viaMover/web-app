<template>
  <div class="navigation-wrapper">
    <nav class="sections">
      <navigation-section hide-header>
        <navigation-section-item-image
          v-if="isDebitCardTopUpEnabled"
          class="no-hover"
          :description="debitCardDescription"
          :description-class="debitCardDescriptionClass"
          navigate-to="debit-card-manage"
          :title="$t('menu.lblBeautifulCard')"
          title-class="medium muted"
        >
          <template v-slot:picture>
            <pu-skeleton v-if="isDebitCardInfoLoading" class="icon" tag="div" />
            <custom-picture
              v-else
              :alt="$t('menu.lblBeautifulCard')"
              :sources="debitCardSkin.sources"
              :src="debitCardSkin.src"
              :webp-sources="debitCardSkin.webpSources"
            />
          </template>
        </navigation-section-item-image>

        <navigation-section-item-image
          v-if="isSavingsEnabled"
          class="no-hover"
          :description="savingsBalance"
          description-class="bold emphasize"
          navigate-to="savings-manage"
          :title="$t('savings.lblSavings')"
          title-class="medium muted"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="$t('savings.lblSavings')"
              :sources="savingsPicture.sources"
              :src="savingsPicture.src"
              :webp-sources="savingsPicture.webpSources"
            />
          </template>
        </navigation-section-item-image>

        <navigation-section-item-image
          v-if="isTreasuryEnabled"
          class="no-hover"
          :description="treasuryBalance"
          description-class="bold emphasize"
          navigate-to="treasury-manage"
          :title="$t('treasury.lblSmartTreasury')"
          title-class="medium muted"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="$t('treasury.lblSmartTreasury')"
              :sources="treasuryPicture.sources"
              :src="treasuryPicture.src"
              :webp-sources="treasuryPicture.webpSources"
            />
          </template>
        </navigation-section-item-image>

        <navigation-section-item-image
          v-if="isEarningsEnabled"
          class="no-hover"
          :description="earningsBalance"
          description-class="bold emphasize"
          navigate-to="earnings-manage"
          :title="$t('earnings.lblEarnings')"
          title-class="medium muted"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="$t('earnings.lblEarnings')"
              :sources="earningsPicture.sources"
              :src="earningsPicture.src"
              :webp-sources="earningsPicture.webpSources"
            />
          </template>
        </navigation-section-item-image>

        <navigation-section-item-image
          v-if="isSavingsPlusEnabled"
          class="no-hover"
          :description="savingsPlusBalance"
          description-class="bold emphasize"
          navigate-to="savings-plus-manage"
          :title="$t('savingsPlus.lblSavingsPlus')"
          title-class="medium muted"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="$t('savingsPlus.lblSavingsPlus')"
              :sources="savingsPlusPicture.sources"
              :src="savingsPlusPicture.src"
              :webp-sources="savingsPlusPicture.webpSources"
            />
          </template>
        </navigation-section-item-image>

        <navigation-section-item-image
          v-if="isStakingUBTEnabled"
          class="no-hover"
          :description="stakingUBTBalance"
          description-class="bold emphasize"
          navigate-to="staking-ubt-manage"
          :title="$t('stakingUBT.lblStaking')"
          title-class="medium muted"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="$t('stakingUBT.lblStaking')"
              :sources="stakingUBTPicture.sources"
              :src="stakingUBTPicture.src"
              :webp-sources="stakingUBTPicture.webpSources"
            />
          </template>
        </navigation-section-item-image>
      </navigation-section>
    </nav>

    <nav class="actions">
      <navigation-section hide-header>
        <navigation-section-item-emoji
          v-if="isMoreSectionEnabled"
          class="no-hover"
          emoji="📦"
          navigate-to="more"
          :text="$t('lblMore')"
        />

        <navigation-section-item-emoji
          v-if="isHomeSwapModalEnabled && isSwapEnabled"
          class="no-hover"
          emoji="🔄"
          :navigate-to="undefined"
          :text="$t('menu.lblSwapToken')"
          @click="handleOpenSwapModal(undefined)"
        />

        <navigation-section-item-emoji
          v-if="isSavingsEnabled"
          class="no-hover"
          emoji="💰"
          navigate-to="savings-deposit"
          :text="$t('menu.lblDepositInSavings')"
        />

        <navigation-section-item-emoji
          v-if="isTreasuryEnabled"
          class="no-hover"
          emoji="📈"
          navigate-to="treasury-increase"
          :text="$t('menu.lblIncreaseBoost')"
        />

        <navigation-section-item-emoji
          v-if="isDebitCardTopUpEnabled"
          class="no-hover"
          emoji="💳"
          :navigate-to="debitCardTopUpLocation"
          :text="$t('debitCard.lblCardTopUp')"
        />

        <navigation-section-item-emoji
          v-if="isEarningsEnabled"
          class="no-hover"
          emoji="➕"
          navigate-to="savings-plus-deposit"
          :text="$t('menu.lblDepositInSavingsPlus')"
        />

        <navigation-section-item-emoji
          v-if="isStakingUBTEnabled"
          class="no-hover"
          emoji="🥩"
          navigate-to="staking-ubt-deposit"
          :text="$t('menu.lblStakeUBT')"
        />
      </navigation-section>
    </nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Location } from 'vue-router';
import { mapActions, mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { defaultSkin } from '@/store/modules/debit-card/consts';
import { mapSkin } from '@/store/modules/debit-card/getters';
import { Modal as ModalType, SwapType } from '@/store/modules/modals/types';
import { add } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  NavigationSection,
  NavigationSectionItemEmoji,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'MenuSection',
  components: {
    NavigationSection,
    NavigationSectionItemImage,
    NavigationSectionItemEmoji,
    CustomPicture
  },
  data() {
    return {
      ModalType: ModalType,
      SwapType: SwapType,
      savingsPicture: {
        src: require('@/assets/images/Savings@1x.png'),
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          { src: require('@/assets/images/Savings@2x.webp'), variant: '2x' }
        ],
        sources: [
          { src: require('@/assets/images/Savings@2x.png'), variant: '2x' }
        ]
      } as PictureDescriptor,
      treasuryPicture: {
        src: require('@/assets/images/SmartTreasury@1x.png'),
        webpSources: [
          { src: require('@/assets/images/SmartTreasury@1x.webp') },
          {
            src: require('@/assets/images/SmartTreasury@2x.webp'),
            variant: '2x'
          }
        ],
        sources: [
          {
            src: require('@/assets/images/SmartTreasury@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      earningsPicture: {
        src: require('@/assets/images/earnings-ethereum-and-olympus@1x.png'),
        sources: [
          {
            src: require('@/assets/images/earnings-ethereum-and-olympus@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      savingsPlusPicture: {
        src: require('@/assets/images/savings-plus@1x.png'),
        sources: [
          { src: require('@/assets/images/savings-plus@2x.png'), variant: '2x' }
        ]
      } as PictureDescriptor,
      stakingUBTPicture: {
        src: require('@/assets/images/StakingUBT@1x.png'),
        sources: [
          { src: require('@/assets/images/StakingUBT@2x.png'), variant: '2x' }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapGetters('savings', {
      savingsInfoBalanceNative: 'savingsInfoBalanceNative'
    }),
    ...mapGetters('treasury', [
      'treasuryBonusNative',
      'treasuryStakedBalanceNative'
    ]),
    ...(isFeatureEnabled('isEarningsEnabled') &&
      mapGetters('earnings', {
        earningsBalanceNative: 'earningsBalanceNative'
      })),
    ...(isFeatureEnabled('isDebitCardEnabled') &&
      mapGetters('debitCard', {
        debitCardCurrentSkin: 'currentSkin',
        debitCardStateText: 'cardStateText'
      })),
    ...(isFeatureEnabled('isDebitCardEnabled') &&
      mapState('debitCard', {
        isDebitCardInfoLoading: 'isLoading',
        debitCardState: 'cardState'
      })),
    ...mapState('account', { networkInfo: 'networkInfo' }),
    ...mapGetters('stakingUBT', {
      stakingUBTBalanceNative: 'balanceNative'
    }),
    savingsBalance(): string {
      return `$${formatToNative(this.savingsInfoBalanceNative)}`;
    },
    earningsBalance(): string {
      return `$${formatToNative(this.earningsBalanceNative ?? 0)}`;
    },
    treasuryBalance(): string {
      const treasuryAllBalance = add(
        this.treasuryBonusNative,
        this.treasuryStakedBalanceNative
      );
      return `$${formatToNative(treasuryAllBalance)}`;
    },
    debitCardDescription(): string {
      if (!isFeatureEnabled('isDebitCardEnabled')) {
        return this.$t('menu.lblComingSoon') as string;
      }

      if (this.isDebitCardInfoLoading) {
        return '';
      }

      return this.debitCardStateText;
    },
    debitCardDescriptionClass(): string {
      if (!isFeatureEnabled('isDebitCardEnabled')) {
        return 'bold emphasize';
      }

      if (['frozen', 'expired'].includes(this.debitCardState)) {
        return 'error';
      }

      return 'bold emphasize';
    },
    debitCardSkin(): PictureDescriptor {
      if (!isFeatureEnabled('isDebitCardEnabled')) {
        return mapSkin(this.$store.state)(defaultSkin).previewPicture;
      }

      return this.debitCardCurrentSkin.previewPicture;
    },
    isDebitCardTopUpEnabled(): boolean {
      return (
        isFeatureEnabled(
          'isDebitCardTopUpEnabled',
          this.networkInfo?.network
        ) && isFeatureEnabled('isDebitCardEnabled', this.networkInfo?.network)
      );
    },
    isEarningsEnabled(): boolean {
      return isFeatureEnabled('isEarningsEnabled', this.networkInfo?.network);
    },
    isSavingsEnabled(): boolean {
      return isFeatureEnabled('isSavingsEnabled', this.networkInfo?.network);
    },
    isTreasuryEnabled(): boolean {
      return isFeatureEnabled('isTreasuryEnabled', this.networkInfo?.network);
    },
    isSwapEnabled(): boolean {
      return isFeatureEnabled('isSwapEnabled', this.networkInfo?.network);
    },
    isHomeSwapModalEnabled(): boolean {
      return isFeatureEnabled(
        'isHomeSwapModalEnabled',
        this.networkInfo?.network
      );
    },
    isSavingsPlusEnabled(): boolean {
      return isFeatureEnabled(
        'isSavingsPlusEnabled',
        this.networkInfo?.network
      );
    },
    isStakingUBTEnabled(): boolean {
      return isFeatureEnabled('isStakingUbtEnabled', this.networkInfo?.network);
    },
    stakingUBTBalance(): string {
      return `$${formatToNative(this.stakingUBTBalanceNative)}`;
    },
    isMoreSectionEnabled(): boolean {
      return (
        isFeatureEnabled('isNibbleShopEnabled', this.networkInfo?.network) ||
        isFeatureEnabled('isGovernanceEnabled', this.networkInfo?.network) ||
        isFeatureEnabled('isNftDropsEnabled', this.networkInfo?.network) ||
        isFeatureEnabled(
          'isOrderOfLibertyNFTEnabled',
          this.networkInfo?.network
        )
      );
    },
    debitCardTopUpLocation(): Location {
      if (!this.isDebitCardTopUpEnabled) {
        return { name: 'not-found-route' };
      }

      if (this.debitCardState !== 'active') {
        return { name: 'debit-card-manage' };
      }

      return {
        name: 'debit-card-top-up',
        params: {
          step: 'prepare'
        }
      };
    },
    savingsPlusBalance(): string {
      return `$${formatToNative(0)}`;
    }
  },
  async mounted() {
    if (
      isFeatureEnabled('isDebitCardEnabled', this.networkInfo?.network) &&
      this.loadDebitCardInfo !== undefined
    ) {
      await this.loadDebitCardInfo();
    }
    if (
      isFeatureEnabled('isEarningsEnabled', this.networkInfo?.network) &&
      this.loadEarningsMinimalInfo !== undefined
    ) {
      await this.loadEarningsMinimalInfo();
    }
  },
  methods: {
    ...mapActions('modals', {
      setIsModalDisplayed: 'setIsDisplayed'
    }),
    ...(isFeatureEnabled('isEarningsEnabled') &&
      mapActions('earnings', {
        loadEarningsMinimalInfo: 'loadMinimalInfo'
      })),
    ...(isFeatureEnabled('isDebitCardEnabled') &&
      mapActions('debitCard', { loadDebitCardInfo: 'loadInfo' })),
    handleOpenSwapModal(payload: unknown): void {
      this.setIsModalDisplayed({
        id: ModalType.Swap,
        value: true,
        payload: payload ?? {}
      });
    }
  }
});
</script>
