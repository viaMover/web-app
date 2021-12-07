<template>
  <div class="general-desktop__menu-wrapper-navigation">
    <div class="general-desktop__menu-wrapper-navigation-left">
      <menu-list>
        <menu-list-emoji-card-item
          :description="debitCardDescription"
          :description-class="debitCardDescriptionClass"
          :disabled="!isFeatureEnabled('isDebitCardEnabled')"
          navigate-to-name="debit-card-manage"
          pic="BeautifulCard"
          :title="$t('menu.lblBeautifulCard')"
        >
          <template
            v-if="isFeatureEnabled('isDebitCardEnabled')"
            v-slot:picture
          >
            <pu-skeleton
              v-if="isDebitCardInfoLoading"
              class="image"
              tag="div"
            />
            <custom-picture
              v-else
              :alt="debitCardCurrentSkin.previewPicture.alt"
              :sources="debitCardCurrentSkin.previewPicture.sources"
              :src="debitCardCurrentSkin.previewPicture.src"
              :webp-sources="debitCardCurrentSkin.previewPicture.webpSources"
            />
          </template>
        </menu-list-emoji-card-item>
        <menu-list-emoji-card-item
          :description="savingsBalance"
          navigate-to-name="savings-manage"
          pic="Savings"
          :title="$t('savings.lblSavings')"
        />
        <menu-list-emoji-card-item
          corner-color="#ff57db"
          :description="treasuryBalance"
          navigate-to-name="treasury-manage"
          pic="SmartTreasury"
          :title="$t('treasury.lblSmartTreasury')"
        />
        <menu-list-emoji-card-item
          v-if="isFeatureEnabled('isBondsEnabled')"
          description="$942,184.11"
          navigate-to-name="bonds"
          pic="Bonds"
          :title="$t('menu.lblBonds')"
        />
      </menu-list>
    </div>
    <div class="general-desktop__menu-wrapper-navigation-right">
      <menu-list>
        <menu-list-icon-item
          :icon="$t('menu.lblSwapTokenEmoji')"
          :modal-id="ModalType.Swap"
          :text="$t('menu.lblSwapToken')"
        />
        <menu-list-icon-item
          :icon="$t('menu.lblGetMoveEmoji')"
          :modal-id="ModalType.Swap"
          :modal-payload="{ swapType: SwapType.getMove }"
          :text="$t('menu.lblGetMove')"
        />
        <menu-list-icon-item
          v-if="isFeatureEnabled('isBondsEnabled')"
          :icon="$t('menu.lblProvideLiquidityMoveEmoji')"
          :text="$t('menu.lblProvideLiquidityMove')"
        />
        <menu-list-icon-item
          :icon="$t('menu.lblDepositInSavingsEmoji')"
          :text="$t('menu.lblDepositInSavings')"
          @button-click="openDepositInSavings"
        />
        <menu-list-icon-item
          :icon="$t('menu.lblIncreaseBoostEmoji')"
          :text="$t('menu.lblIncreaseBoost')"
          @button-click="openDepositInTreasury"
        />
        <menu-list-icon-item
          v-if="isFeatureEnabled('isBondsEnabled')"
          :icon="$t('menu.lblPurchaseBondsEmoji')"
          :text="$t('menu.lblPurchaseBonds')"
        />
      </menu-list>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { Modal as ModalType, SwapType } from '@/store/modules/modals/types';
import { add } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';

import {
  MenuList,
  MenuListEmojiCardItem,
  MenuListIconItem
} from '@/components/home/menu-list';
import { CustomPicture } from '@/components/html5';

export default Vue.extend({
  name: 'MenuSection',
  components: {
    MenuList,
    MenuListEmojiCardItem,
    MenuListIconItem,
    CustomPicture
  },
  data() {
    return {
      ModalType: ModalType,
      SwapType: SwapType
    };
  },
  computed: {
    ...mapGetters('account', [
      'savingsInfoBalanceNative',
      'treasuryBonusNative',
      'treasuryStakedBalanceNative'
    ]),
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
    }
  },
  async mounted() {
    if (
      isFeatureEnabled('isDebitCardEnabled') &&
      this.loadDebitCardInfo !== undefined
    ) {
      await this.loadDebitCardInfo();
    }
  },
  methods: {
    isFeatureEnabled,
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
    }
  }
});
</script>
