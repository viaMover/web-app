<template>
  <heading-section
    :class="ownClass"
    :container-class="innerContainerClass"
    has-expand-button
    :name="$t('swaps.lblSwaps')"
    use-click-event
    @navigation-click="handleClick"
  >
    <template v-slot:heading>
      {{ $t('swaps.lblSwaps') }}
    </template>
    <p>
      {{ $t('swaps.lblSwapsSubheading') }}
    </p>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { toggleSingleItem } from '@/components/toggle/toggle-root';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'SwapsSection',
  components: {
    HeadingSection
  },
  props: {
    ownClass: {
      type: String,
      default: 'links__item'
    },
    innerContainerClass: {
      type: String,
      default: 'link__item-info'
    }
  },
  methods: {
    handleClick(): void {
      toggleSingleItem('swap-modal');
    }
  }
});
</script>
