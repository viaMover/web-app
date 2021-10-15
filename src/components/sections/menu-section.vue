<template>
  <div class="general-desktop__menu-wrapper-navigation">
    <div class="general-desktop__menu-wrapper-navigation-left">
      <menu-list>
        <menu-list-emoji-card-item
          :description="$t('menu.lblComingSoon')"
          disabled
          navigate-to-name="home"
          pic="BeautifulCard"
          :title="$t('menu.lblBeautifulCard')"
        />
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
        <!-- TODO: replace earnings section asset -->
        <menu-list-emoji-card-item
          v-if="isFeatureEnabled('isEarningsEnabled')"
          corner-color="#000000"
          :description="earningsBalance"
          navigate-to-name="earnings-manage"
          pic="SmartTreasury"
          :title="$t('earnings.lblEarnings')"
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
          :modal-id="ModalType.TreasuryIncreaseBoost"
          :text="$t('menu.lblIncreaseBoost')"
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
import { mapActions, mapGetters } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { Modal as ModalType, SwapType } from '@/store/modules/modals/types';
import { add } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';

import {
  MenuList,
  MenuListEmojiCardItem,
  MenuListIconItem
} from '@/components/home/menu-list';

export default Vue.extend({
  name: 'MenuSection',
  components: {
    MenuList,
    MenuListEmojiCardItem,
    MenuListIconItem
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
    ...(isFeatureEnabled('isEarningsEnabled') &&
      mapGetters('earnings', {
        earningsBalanceNative: 'earningsBalanceNative'
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
    }
  },
  async mounted() {
    await this.loadMinimalInfo?.();
  },
  methods: {
    ...(isFeatureEnabled('isEarningsEnabled') &&
      mapActions('earnings', {
        loadMinimalInfo: 'loadMinimalInfo'
      })),
    isFeatureEnabled,
    async openDepositInSavings(): Promise<void> {
      await this.$router.push({
        name: 'savings-deposit'
      });
    }
  }
});
</script>
