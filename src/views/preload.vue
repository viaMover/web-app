<template>
  <PuSkeletonTheme color="#dcdcdc">
    <content-wrapper
      base-class="preload-wrapper"
      has-left-rail
      page-container-class="preload-wrapper__menu"
      wrapper-class="preload-wrapper"
    >
      <template v-slot:left-rail>
        <a class="logo" href="https://viamover.com">
          <img alt="logo" src="@/assets/images/logo.svg" />
        </a>
        <div class="preload-wrapper__sidebar-wrapper-user">
          <PuSkeleton circle class="user-icon" tag="div" />
          <PuSkeleton class="user-button" tag="div" />
          <PuSkeleton class="user-status" tag="div" />
        </div>
        <div class="preload-wrapper__sidebar-wrapper-items">
          <div class="items-item">
            <PuSkeleton class="items-item__title" tag="div" />
            <PuSkeleton class="items-item__text" tag="div" />
            <PuSkeleton class="items-item__description" tag="div" />
            <PuSkeleton class="items-item__text" tag="div" />
            <PuSkeleton class="items-item__description" tag="div" />
          </div>
          <div class="items-item">
            <PuSkeleton class="items-item__title" tag="div" />
            <PuSkeleton class="items-item__text" tag="div" />
            <PuSkeleton class="items-item__description" tag="div" />
            <PuSkeleton class="items-item__text" tag="div" />
            <PuSkeleton class="items-item__description" tag="div" />
          </div>
        </div>
      </template>

      <div class="preload-wrapper__menu-wrapper-item">
        <div class="preload-wrapper__menu-wrapper-item-top">
          <PuSkeleton class="title" tag="div" />
          <PuSkeleton class="description" tag="div" />
        </div>
      </div>
      <div class="preload-wrapper__menu-wrapper-item">
        <div class="preload-wrapper__menu-wrapper-item-center">
          <div class="item">
            <PuSkeleton class="item__title" tag="div" />
            <PuSkeleton class="item__description" tag="div" />
          </div>
          <div class="item">
            <PuSkeleton class="item__title" tag="div" />
            <PuSkeleton class="item__description" tag="div" />
          </div>
        </div>
      </div>
      <div class="preload-wrapper__menu-wrapper-item">
        <div class="preload-wrapper__menu-wrapper-item-bottom">
          <PuSkeleton class="title" tag="div" />
          <PuSkeleton class="description" tag="div" />
        </div>
      </div>
    </content-wrapper>
  </PuSkeletonTheme>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';

export default Vue.extend({
  name: 'Preload',
  components: {
    ContentWrapper
  }
});
</script>
