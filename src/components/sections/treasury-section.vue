<template>
  <heading-section
    has-expand-button
    :name="$t('lblTreasury')"
    navigate-to-name="treasury-manage"
  >
    <template v-slot:heading>
      {{ $t('lblTreasuryHeader', { amount: '$864.17' }) }}
    </template>

    {{ $t('lblTreasuryEarnedToday', { amount: '+$24.89' }) }}
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
