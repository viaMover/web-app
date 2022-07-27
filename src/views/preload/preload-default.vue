<template>
  <content-wrapper class="home" page-content-class="centered">
    <!--    <template v-slot:left-rail>-->
    <!--      <aside class="left-rail wallet history">-->
    <!--        <div class="wrapper">-->
    <!--          <pu-skeleton class="button-group skeleton" height="32px" tag="div" />-->
    <!--          <div class="wallet">-->
    <!--            <div class="list">-->
    <!--              <preload-left-rail-wallet-tokens is-loading />-->
    <!--              <preload-left-rail-wallet-collectibles is-loading />-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </aside>-->
    <!--    </template>-->

    <div class="masthead">
      <pu-skeleton circle class="avatar" tag="div" />
      <div class="title">
        <pu-skeleton class="selector" tag="div" width="250px" />
        <pu-skeleton class="balance" tag="div" width="150px" />
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

// import PreloadLeftRailWalletCollectibles from '@/components/home/home-wallet/home-wallet-collectibles-wrapper.vue';
// import PreloadLeftRailWalletTokens from '@/components/home/home-wallet/home-wallet-tokens-wrapper.vue';
import { ContentWrapper } from '@/components/layout';
import { NavigationSection } from '@/components/navigation';

export default Vue.extend({
  name: 'PreloadDefault',
  components: {
    ContentWrapper,
    // PreloadLeftRailWalletTokens,
    // PreloadLeftRailWalletCollectibles,
    NavigationSection
  }
});
</script>
