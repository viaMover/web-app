<template>
  <heading-section
    has-expand-button
    :name="$t('swaps.lblSwaps')"
    navigate-to-name="swaps"
  >
    <template v-slot:heading>
      {{ $t('swaps.lblSwaps') }}
    </template>

    {{ $t('swaps.lblSwapsSubheading') }}
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'SwapsSection',
  components: {
    HeadingSection
  }
});
</script>
