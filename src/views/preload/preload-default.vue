<template>
  <content-wrapper class="home" has-left-rail>
    <template v-slot:left-rail>
      <aside class="left-rail history">
        <div class="wrapper">
          <preload-left-rail-transactions />
        </div>
      </aside>
    </template>

    <div class="masthead">
      <pu-skeleton circle class="avatar" tag="div" />
      <div class="title">
        <pu-skeleton class="selector" tag="div" width="250px" />
        <pu-skeleton class="balance" tag="div" width="150px"></pu-skeleton>
      </div>

      <div class="nav-bar">
        <ul class="items">
          <pu-skeleton
            v-for="idx in 4"
            :key="idx"
            class="item"
            tag="li"
            :width="`${((idx % 3) + 1) * 30}px`"
          />
        </ul>
      </div>
    </div>

    <div class="navigation-wrapper">
      <div class="sections">
        <navigation-section
          hide-header
          is-loading
          skeleton-component="navigation-section-item-image-skeleton"
          skeleton-component-width="200px"
          :skeleton-components-count="3"
        />
      </div>
      <div class="actions">
        <navigation-section
          hide-header
          is-loading
          skeleton-component="navigation-section-item-emoji-skeleton"
          skeleton-component-width="200px"
          :skeleton-components-count="4"
        />
      </div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import PreloadLeftRailTransactions from '@/components/home/home-transactions-list/home-transactions-list-skeleton.vue';
import { ContentWrapper } from '@/components/layout';
import { NavigationSection } from '@/components/navigation';

export default Vue.extend({
  name: 'PreloadDefault',
  components: {
    ContentWrapper,
    PreloadLeftRailTransactions,
    NavigationSection
  }
});
</script>
