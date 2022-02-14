<template>
  <li class="item progress">
    <progress-loader class="progress-loader" :value="progress" />
    <div class="icon">
      <custom-picture
        :alt="image ? image.alt : ''"
        :sources="image ? image.sources : []"
        :src="image ? image.src : ''"
        :webp-sources="image ? image.webpSources : []"
      />
    </div>
    <div class="info">
      <h3 class="title">
        <slot name="description">{{ title }}</slot>
      </h3>
      <div class="description">
        <slot>{{ description }}</slot>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import ProgressLoader from '@/components/layout/progress-loader.vue';

export default Vue.extend({
  name: 'AnalyticsListProgressItem',
  components: { CustomPicture, ProgressLoader },
  props: {
    title: {
      type: String,
      default: undefined
    },
    description: {
      type: [String, Number],
      default: undefined
    },
    image: {
      type: Object as PropType<PictureDescriptor>,
      default: undefined
    },
    progress: {
      type: Number,
      default: 0
    }
  }
});
</script>
