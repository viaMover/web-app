<template>
  <content-wrapper class="product" has-left-rail>
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <navigation-section is-loading :skeleton-components-count="2" />
            <navigation-section is-loading :skeleton-components-count="3" />
          </div>
        </div>
      </nav>
    </template>

    <preload-product-secondary-page />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import { NavigationSection } from '@/components/navigation';

import PreloadProductSecondaryPage from './preload-product-secondary-page.vue';

export default Vue.extend({
  name: 'PreloadProduct',
  components: {
    ContentWrapper,
    NavigationSection,
    PreloadProductSecondaryPage
  }
});
</script>
