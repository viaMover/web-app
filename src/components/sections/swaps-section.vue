<template>
  <heading-section
    has-expand-button
    :name="$t('swaps.lblSwaps')"
    use-click-event
    @navigation-click="handleClick"
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
import { toggleModal } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'SwapsSection',
  components: {
    HeadingSection
  },
  methods: {
    handleClick(): void {
      toggleModal('swap-modal');
    }
  }
});
</script>
