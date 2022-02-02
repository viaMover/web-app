<template>
  <content-wrapper has-left-rail>
    <template v-slot:left-rail>
      <aside class="left-rail transactions">
        <div class="wrapper">
          <pu-skeleton class="form search" rounded tag="form" />

          <div class="list">
            <div v-for="idx in 3" :key="idx" class="group">
              <pu-skeleton class="header" tag="h2" />
              <div class="items">
                <div v-for="innerIdx in 2" :key="innerIdx" class="item">
                  <pu-skeleton circle class="icon token-icon" tag="div" />
                  <div class="description">
                    <pu-skeleton class="title" tag="h3" />
                    <pu-skeleton class="value" tag="div" />
                  </div>
                  <pu-skeleton class="outcome" tag="div" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
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
