<template>
  <heading-section
    class="general-desktop__menu-wrapper-item"
    container-class="general-desktop__menu-wrapper-item-info"
    has-expand-button
    :name="$t('treasury.lblSmartTreasury')"
    navigate-to-name="treasury-manage"
  >
    <template v-slot:heading>
      {{ $t('treasury.lblTreasuryHeader', { amount: '$864.17' }) }}
    </template>

    <p>
      {{ $t('treasury.lblTreasuryEarnedToday', { amount: '+$24.89' }) }}
    </p>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'TreasurySection',
  components: {
    HeadingSection
  }
});
</script>
