<template>
  <div class="desktop-center-section">
    <menu-list wrapper-class="desktop-center-section-list">
      <menu-list-image-item
        description="Coming soon"
        disabled
        title="Beautiful card"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-image-item
        description="$10,842.11"
        title="Savings"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-image-item
        description="$811.07"
        title="Smart Treasury"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-image-item
        v-if="isFeatureEnabled('isBoundsEnabled')"
        description="$942,184.11"
        title="Bonds"
        wrapper-class="desktop-center-section-list-item"
      />
    </menu-list>
    <menu-list wrapper-class="desktop-center-section-list">
      <menu-list-icon-item
        icon="🔄"
        text="Swap tokens"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        icon="💸"
        text="Get MOVE"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        icon="💧"
        text="Provide liquidity for MOVE"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        icon="💰"
        text="Deposit in Savings"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        icon="📈"
        text="Increase boost"
        wrapper-class="desktop-center-section-list-item"
      />
      <menu-list-icon-item
        icon="🏦"
        text="Purchase Bonds"
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
  MenuListImageItem,
  MenuListIconItem
} from '@/components/home/menu-list';

export default Vue.extend({
  name: 'MenuSection',
  components: {
    MenuList,
    MenuListImageItem,
    MenuListIconItem
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
