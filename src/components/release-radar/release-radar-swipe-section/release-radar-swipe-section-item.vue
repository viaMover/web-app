<template>
  <div class="swiper-slide">
    <a class="swiper-lists__item" href="#">
      <div
        class="swiper-lists__item-icon"
        :class="{
          'black-border': isBlackBorder,
          'transparent-border': !isBlackBorder
        }"
      >
        <img
          :alt="$t('asset.txtAlt', { name: text })"
          class="button-active"
          :src="image"
        />
      </div>
      <div class="swiper-lists__item-title">
        <p>{{ text }}</p>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ReleaseRadarSwipeSectionItem',
  props: {
    text: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    isBlackBorder: {
      type: Boolean,
      default: false
    }
  }
});
</script>
