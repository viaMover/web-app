<template>
  <div class="desktop-center-section">
    <menu-list wrapper-class="desktop-center-section-list">
      <menu-list-emoji-card-item
        :description="$t('menu.lblComingSoon')"
        disabled
        navigate-to-name="home"
        :title="$t('menu.lblBeautifulCard')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-emoji-card-item
        corner-color="#ff9b00"
        :description="savingsBalance"
        :emoji="$t('savings.icon')"
        navigate-to-name="savings-manage"
        :title="$t('savings.lblSavings')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-emoji-card-item
        corner-color="#ff57db"
        :description="treasuryBalance"
        :emoji="$t('treasury.icon')"
        navigate-to-name="treasury-manage"
        :title="$t('treasury.lblSmartTreasury')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-emoji-card-item
        v-if="isFeatureEnabled('isBondsEnabled')"
        description="$942,184.11"
        :emoji="$t('bonds.icon')"
        navigate-to-name="bonds"
        :title="$t('menu.lblBonds')"
        wrapper-class="desktop-center-section-list-item"
      />
    </menu-list>
    <menu-list wrapper-class="desktop-center-section-list">
      <menu-list-icon-item
        :icon="$t('menu.lblSwapTokenEmoji')"
        :modal-id="ModalType.Swap"
        :text="$t('menu.lblSwapToken')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblGetMoveEmoji')"
        :modal-id="ModalType.Swap"
        :modal-payload="{ swapType: SwapType.getMove }"
        :text="$t('menu.lblGetMove')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        v-if="isFeatureEnabled('isBondsEnabled')"
        :icon="$t('menu.lblProvideLiquidityMoveEmoji')"
        :text="$t('menu.lblProvideLiquidityMove')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblDepositInSavingsEmoji')"
        :modal-id="ModalType.SavingsDeposit"
        :text="$t('menu.lblDepositInSavings')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblIncreaseBoostEmoji')"
        :modal-id="ModalType.TreasuryIncreaseBoost"
        :text="$t('menu.lblIncreaseBoost')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        v-if="isFeatureEnabled('isBondsEnabled')"
        :icon="$t('menu.lblPurchaseBondsEmoji')"
        :text="$t('menu.lblPurchaseBonds')"
        wrapper-class="desktop-center-section-list-item"
      />
    </menu-list>
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
