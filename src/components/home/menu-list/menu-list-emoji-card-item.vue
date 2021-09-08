<template>
  <li :class="itemClass">
    <router-link class="button-active" :to="{ name: this.navigateToName }">
      <div class="image">
        <custom-picture
          alt=""
          :sources="pictureSources"
          :src="src"
          :webp-sources="pictureWebpSources"
        />
      </div>
      <div class="info">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'MenuListEmojiCardItem',
  components: { CustomPicture },
  props: {
    pic: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    navigateToName: {
      type: String,
      required: true
    }
  },
  computed: {
    itemClass(): string {
      if (this.disabled) {
        return 'disabled';
      }

      return '';
    },
    pictureSources(): Array<PictureSourceDescriptor> {
      return [
        { src: require(`@/assets/images/${this.pic}@2x.png`), variant: '2x' }
      ];
    },
    pictureWebpSources(): Array<PictureSourceDescriptor> {
      return [
        { src: require(`@/assets/images/${this.pic}@1x.webp`) },
        { src: require(`@/assets/images/${this.pic}@2x.webp`), variant: '2x' }
      ];
    },
    src(): string {
      return `@/assets/images/${this.pic}@1x.png`;
    }
  }
});
</script>
