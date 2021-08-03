<template>
  <div class="desktop-center-section">
    <card-list wrapper-class="desktop-center-section-list">
      <card-list-image-item
        disabled
        title="Beautiful card"
        wrapper-class="desktop-center-section-list-item"
      />
      <card-list-image-item
        title="Savings"
        wrapper-class="desktop-center-section-list-item"
      />
      <card-list-image-item
        title="Smart Treasury"
        wrapper-class="desktop-center-section-list-item"
      />
    </card-list>
    <card-list wrapper-class="desktop-center-section-list">
      <card-list-icon-item
        text="Swap tokens"
        wrapper-class="desktop-center-section-list-item"
      />
      <card-list-icon-item
        text="Get MOVE"
        wrapper-class="desktop-center-section-list-item"
      />
      <card-list-icon-item
        text="Provide liquidity for MOVE"
        wrapper-class="desktop-center-section-list-item"
      />
      <card-list-icon-item
        text="Deposit in Savings"
        wrapper-class="desktop-center-section-list-item"
      />
      <card-list-icon-item
        text="Increase boost"
        wrapper-class="desktop-center-section-list-item"
      />
    </card-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  CardList,
  CardListImageItem,
  CardListIconItem
} from '@/components/home/card-list';

export default Vue.extend({
  name: 'MenuSection',
  components: {
    CardList,
    CardListImageItem,
    CardListIconItem
  }
});
</script>
