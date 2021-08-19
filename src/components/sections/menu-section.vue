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
          :modal-id="ModalType.SavingsDeposit"
          :text="$t('menu.lblDepositInSavings')"
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
import { mapGetters } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { formatToNative } from '@/utils/format';
import { Modal as ModalType, SwapType } from '@/store/modules/modals/types';

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
      'treasuryBonusNative'
    ]),
    savingsBalance(): string {
      return `$${formatToNative(this.savingsInfoBalanceNative)}`;
    },
    treasuryBalance(): string {
      return `$${formatToNative(this.treasuryBonusNative)}`;
    }
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
