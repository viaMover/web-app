<template>
  <picture :style="containerStyle">
    <source v-if="webpSrcset !== ''" :srcset="webpSrcset" type="image/webp" />
    <img :alt="alt" :src="src" :srcset="imageSrcSet" :style="pictureStyle" />
  </picture>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { formatPictureSources } from './utils';
import { PictureSourceDescriptor } from './types';
import { Properties } from 'csstype';

export default Vue.extend({
  name: 'CustomPicture',
  props: {
    alt: {
      type: String,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    sources: {
      type: Array as PropType<Array<PictureSourceDescriptor>>,
      default: () => []
    },
    webpSources: {
      type: Array as PropType<Array<PictureSourceDescriptor>>,
      default: () => []
    },
    containerStyle: {
      type: [String, Object] as PropType<string | Properties>,
      default: undefined
    },
    pictureStyle: {
      type: [String, Object] as PropType<string | Properties>,
      default: undefined
    }
  },
  computed: {
    imageSrcSet(): string | undefined {
      return this.formatPictureSources(this.sources);
    },
    webpSrcset(): string | undefined {
      return this.formatPictureSources(this.webpSources);
    }
  },
  methods: {
    formatPictureSources
  }
});
</script>
