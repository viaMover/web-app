<template>
  <content-wrapper class="home" has-left-rail>
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
        <div class="group">
          <div class="items">
            <pu-skeleton
              v-for="idx in 3"
              :key="idx"
              class="item picture skeleton"
              height="48px"
              width="200px"
            />
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="group">
          <div class="items">
            <pu-skeleton
              v-for="idx in 4"
              :key="idx"
              class="item emoji skeleton"
              height="24px"
              width="200px"
            />
          </div>
        </div>
      </div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';

export default Vue.extend({
  name: 'PreloadDefault',
  components: {
    ContentWrapper
  }
});
</script>
