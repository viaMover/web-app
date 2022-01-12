<template>
  <div class="navigation-wrapper">
    <nav class="sections">
      <left-rail-section hide-header>
        <left-rail-section-nav-item-image
          :description="debitCardDescription"
          :description-class="debitCardDescriptionClass"
          navigate-to="debit-card-manage"
          :title="$t('menu.lblBeautifulCard')"
          :title-class="
            !isFeatureEnabled('isDebitCardEnabled') ? 'muted' : undefined
          "
        >
          <template v-slot:picture>
            <pu-skeleton v-if="isDebitCardInfoLoading" class="icon" tag="div" />
            <custom-picture
              v-else
              :alt="debitCardSkin.alt"
              :sources="debitCardSkin.sources"
              :src="debitCardSkin.src"
              :webp-sources="debitCardSkin.webpSources"
            />
          </template>
        </left-rail-section-nav-item-image>

        <left-rail-section-nav-item-image
          :description="savingsBalance"
          navigate-to="savings-manage"
          :title="$t('savings.lblSavings')"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="savingsPicture.alt"
              :sources="savingsPicture.sources"
              :src="savingsPicture.src"
              :webp-sources="savingsPicture.webpSources"
            />
          </template>
        </left-rail-section-nav-item-image>

        <left-rail-section-nav-item-image
          :description="treasuryBalance"
          navigate-to="treasury-manage"
          :title="$t('treasury.lblSmartTreasury')"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="treasuryPicture.alt"
              :sources="treasuryPicture.sources"
              :src="treasuryPicture.src"
              :webp-sources="treasuryPicture.webpSources"
            />
          </template>
        </left-rail-section-nav-item-image>

        <left-rail-section-nav-item-image
          v-if="isFeatureEnabled('isEarningsEnabled')"
          :description="earningsBalance"
          navigate-to="earnings-manage"
          :title="$t('earnings.lblEarnings')"
        >
          <template v-slot:picture>
            <custom-picture
              :alt="earningsPicture.alt"
              :sources="earningsPicture.sources"
              :src="earningsPicture.src"
              :webp-sources="earningsPicture.webpSources"
            />
          </template>
        </left-rail-section-nav-item-image>
      </left-rail-section>
    </nav>

    <nav class="actions">
      <left-rail-section hide-header>
        <left-rail-section-nav-item-emoji
          :emoji="$t('menu.lblSwapTokenEmoji')"
          :navigate-to="undefined"
          :text="$t('menu.lblSwapToken')"
          @click="handleOpenSwapModal(undefined)"
        />

        <left-rail-section-nav-item-emoji
          :emoji="$t('menu.lblGetMoveEmoji')"
          :navigate-to="undefined"
          :text="$t('menu.lblGetMove')"
          @click="handleOpenSwapModal({ swapType: SwapType.getMove })"
        />

        <left-rail-section-nav-item-emoji
          :emoji="$t('menu.lblDepositInSavingsEmoji')"
          navigate-to="savings-deposit"
          :text="$t('menu.lblDepositInSavings')"
        />

        <left-rail-section-nav-item-emoji
          :emoji="$t('menu.lblIncreaseBoostEmoji')"
          navigate-to="treasury-increase"
          :text="$t('menu.lblIncreaseBoost')"
        />
      </left-rail-section>
    </nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { defaultSkin } from '@/store/modules/debit-card/consts';
import { mapSkin } from '@/store/modules/debit-card/getters';
import { Modal as ModalType, SwapType } from '@/store/modules/modals/types';
import { add } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  LeftRailSection,
  LeftRailSectionNavItemEmoji,
  LeftRailSectionNavItemImage
} from '@/components/layout';

export default Vue.extend({
  name: 'MenuSection',
  components: {
    LeftRailSection,
    CustomPicture,
    LeftRailSectionNavItemImage,
    LeftRailSectionNavItemEmoji
  },
  data() {
    return {
      ModalType: ModalType,
      SwapType: SwapType,
      savingsPicture: {
        src: require('@/assets/images/Savings@1x.png'),
        alt: this.$t('savings.lblSavings'),
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
        alt: this.$t('treasury.lblSmartTreasury'),
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
        alt: isFeatureEnabled('isEarningsEnabled')
          ? this.$t('earnings.lblEarnings')
          : '',
        sources: [
          {
            src: require('@/assets/images/earnings-ethereum-and-olympus@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapGetters('account', [
      'savingsInfoBalanceNative',
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
    savingsBalance(): string {
      return `$${formatToNative(this.savingsInfoBalanceNative)}`;
    },
    earningsBalance(): string {
      if (this.earningsBalanceNative === undefined) {
        return '';
      }

      return `$${formatToNative(this.earningsBalanceNative)}`;
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
        return '';
      }

      if (['frozen', 'expired'].includes(this.debitCardState)) {
        return 'error';
      }

      return '';
    },
    debitCardSkin(): PictureDescriptor {
      if (!isFeatureEnabled('isDebitCardEnabled')) {
        return mapSkin(this.$store.state)(defaultSkin).previewPicture;
      }

      return this.debitCardCurrentSkin.previewPicture;
    }
  },
  async mounted() {
    if (
      isFeatureEnabled('isDebitCardEnabled') &&
      this.loadDebitCardInfo !== undefined
    ) {
      await this.loadDebitCardInfo();
    }
    if (
      isFeatureEnabled('isEarningsEnabled') &&
      this.loadEarningsMinimalInfo !== undefined
    ) {
      await this.loadEarningsMinimalInfo();
    }
  },
  methods: {
    isFeatureEnabled,
    ...mapActions('modals', {
      setIsModalDisplayed: 'setIsDisplayed'
    }),
    ...(isFeatureEnabled('isEarningsEnabled') &&
      mapActions('earnings', {
        loadEarningsMinimalInfo: 'loadMinimalInfo'
      })),
    ...(isFeatureEnabled('isDebitCardEnabled') &&
      mapActions('debitCard', { loadDebitCardInfo: 'loadInfo' })),
    async openDepositInSavings(): Promise<void> {
      await this.$router.push({
        name: 'savings-deposit'
      });
    },
    async openDepositInTreasury(): Promise<void> {
      await this.$router.push({
        name: 'treasury-increase'
      });
    },
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
