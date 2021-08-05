<template>
  <div class="desktop-center-section">
    <menu-list wrapper-class="desktop-center-section-list">
      <menu-list-emoji-card-item
        :description="$t('menu.lblComingSoon')"
        disabled
        :title="$t('menu.lblBeautifulCard')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-emoji-card-item
        corner-color="#ff9b00"
        description="$10,842.11"
        :emoji="$t('savings.icon')"
        :title="$t('savings.lblSavings')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-emoji-card-item
        corner-color="#ff57db"
        description="$811.07"
        :emoji="$t('treasury.icon')"
        :title="$t('treasury.lblSmartTreasury')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-emoji-card-item
        v-if="isFeatureEnabled('isBoundsEnabled')"
        description="$942,184.11"
        :emoji="$t('bonds.icon')"
        :title="$t('menu.lblBonds')"
        wrapper-class="desktop-center-section-list-item"
      />
    </menu-list>
    <menu-list wrapper-class="desktop-center-section-list">
      <menu-list-icon-item
        :icon="$t('menu.lblSwapTokenEmoji')"
        :text="$t('menu.lblSwapToken')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblGetMoveEmoji')"
        :text="$t('menu.lblGetMove')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblProvideLiquidityMoveEmoji')"
        :text="$t('menu.lblProvideLiquidityMove')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblDepositInSavingsEmoji')"
        :text="$t('menu.lblDepositInSavings')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblIncreaseBoostEmoji')"
        :text="$t('menu.lblIncreaseBoost')"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        :icon="$t('menu.lblPurchaseBondsEmoji')"
        :text="$t('menu.lblPurchaseBonds')"
        wrapper-class="desktop-center-section-list-item"
      />
    </menu-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

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
  methods: {
    isFeatureEnabled
  }
});
</script>
