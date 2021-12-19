<template>
  <li class="progress-item">
    <progress-loader class="loading" :value="progress" />
    <div class="item-icon">
      <custom-picture
        :alt="image ? image.alt : ''"
        :sources="image ? image.sources : []"
        :src="image ? image.src : ''"
        :webp-sources="image ? image.webpSources : []"
      />
    </div>
    <div class="item-label">
      <h3 class="description">
        <slot name="description">{{ description }}</slot>
      </h3>
      <span class="value">
        <slot>{{ value }}</slot>
      </span>
    </div>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import ProgressLoader from '@/components/layout/progress-loader.vue';

export default Vue.extend({
  name: 'StatementListProgressItem',
  components: { CustomPicture, ProgressLoader },
  props: {
    description: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
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
