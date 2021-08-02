<template>
  <div ref="swiper" class="swiper-container" :class="containerClass">
    <div class="swiper-wrapper">
      <slot></slot>
    </div>
    <template v-show="useNavigationButtons">
      <div ref="swiperPrevEl" class="swiper-button-prev"></div>
      <div ref="swiperNextEl" class="swiper-button-next"></div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Swiper from 'swiper';

import 'swiper/swiper.less';

export default Vue.extend({
  name: 'Swiper',
  props: {
    containerClass: {
      type: String,
      default: ''
    },
    grabCursor: {
      type: Boolean,
      default: false
    },
    spaceBetween: {
      type: Number,
      default: 40
    },
    allowTouchMove: {
      type: Boolean,
      default: false
    },
    slidesPerView: {
      type: Number,
      default: 4.43
    },
    useNavigationButtons: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    mousewheel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      swiperInstance: undefined as Swiper | undefined
    };
  },
  mounted() {
    this.initSwiper();
  },
  methods: {
    initSwiper(): void {
      if (this.swiperInstance !== undefined) {
        this.swiperInstance.destroy();
      }

      const swiperRef = this.$refs.swiper as HTMLElement;

      this.swiperInstance = new Swiper(swiperRef, {
        grabCursor: this.grabCursor,
        spaceBetween: this.spaceBetween,
        allowTouchMove: this.allowTouchMove,
        slidesPerView: this.slidesPerView,
        loop: this.loop,
        mousewheel: this.mousewheel,
        ...(this.useNavigationButtons && {
          navigation: {
            prevEl: this.$refs.swiperPrevEl as HTMLElement,
            nextEl: this.$refs.swiperNextEl as HTMLElement
          }
        })
      });
      this.swiperInstance.init();
    }
  }
});
</script>
