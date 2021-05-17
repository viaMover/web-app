<template>
  <heading-section
    has-expand-button
    :name="$t('lblSavings')"
    navigate-to-name="savings"
  >
    <template v-slot:heading>
      {{ $t('lblSavingsHeader', { amount: totalAmountInSavings }) }}
    </template>

    {{ $t('lblSavingsEarnedToday', { amount: amountEarnedToday }) }}
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'SavingsSection',
  components: {
    HeadingSection
  },
  data() {
    return {
      totalAmountInSavings: '$22,984.49',
      amountEarnedToday: '+$24.89'
    };
  }
});
</script>
