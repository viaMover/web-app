<template>
  <PuSkeletonTheme color="#dcdcdc">
    <content-wrapper
      base-class="preload-wrapper"
      has-left-rail
      page-container-class="preload-wrapper__menu"
      wrapper-class="preload-wrapper"
    >
      <template v-slot:left-rail>
        <div class="preload-wrapper__sidebar-search">
          <PuSkeleton class="search" tag="div" />
        </div>
        <div class="preload-wrapper__sidebar-items">
          <div class="preload-wrapper__sidebar-items-item">
            <PuSkeleton class="title" tag="div" />
            <PuSkeleton class="description" tag="div" />
            <PuSkeleton class="subtitle" tag="div" />
            <PuSkeleton class="description" tag="div" />
            <PuSkeleton class="subtitle" tag="div" />
          </div>
          <div class="preload-wrapper__sidebar-items-item">
            <PuSkeleton class="title" tag="div" />
            <PuSkeleton class="description" tag="div" />
            <PuSkeleton class="subtitle" tag="div" />
            <PuSkeleton class="description" tag="div" />
            <PuSkeleton class="subtitle" tag="div" />
          </div>
          <div class="preload-wrapper__sidebar-items-item">
            <PuSkeleton class="title" tag="div" />
            <PuSkeleton class="description" tag="div" />
            <PuSkeleton class="subtitle" tag="div" />
            <PuSkeleton class="description" tag="div" />
            <PuSkeleton class="subtitle" tag="div" />
          </div>
        </div>
      </template>

      <div class="preload-wrapper__menu-user">
        <PuSkeleton circle class="user" tag="div" />
        <div class="info">
          <PuSkeleton class="description" tag="div" />
          <PuSkeleton class="description" tag="div" />
        </div>
      </div>
      <div class="preload-wrapper__menu-navigation">
        <div class="preload-wrapper__menu-navigation-left">
          <div class="item">
            <PuSkeleton class="icon" tag="div" />
            <div class="info">
              <PuSkeleton class="description" tag="div" />
              <PuSkeleton class="description" tag="div" />
            </div>
          </div>
          <div class="item">
            <PuSkeleton class="icon" tag="div" />
            <div class="info">
              <PuSkeleton class="description" tag="div" />
              <PuSkeleton class="description" tag="div" />
            </div>
          </div>
          <div class="item">
            <PuSkeleton class="icon" tag="div" />
            <div class="info">
              <PuSkeleton class="description" tag="div" />
              <PuSkeleton class="description" tag="div" />
            </div>
          </div>
          <div class="item">
            <PuSkeleton class="icon" tag="div" />
            <div class="info">
              <PuSkeleton class="description" tag="div" />
              <PuSkeleton class="description" tag="div" />
            </div>
          </div>
        </div>
        <div class="preload-wrapper__menu-navigation-right">
          <PuSkeleton class="item" tag="div" />
          <PuSkeleton class="item" tag="div" />
          <PuSkeleton class="item" tag="div" />
          <PuSkeleton class="item" tag="div" />
          <PuSkeleton class="item" tag="div" />
          <PuSkeleton class="item" tag="div" />
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
