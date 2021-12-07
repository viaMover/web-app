<template>
  <div v-if="opened" class="card">
    <div class="info">
      <div class="text">
        <h2 class="title">{{ title }}</h2>
        <p class="description">{{ description }}</p>
      </div>
      <div class="buttons">
        <action-button
          class="button primary cta"
          @button-click="handleButtonClick"
        >
          {{ buttonText }}
        </action-button>
        <action-button
          button-class="button round"
          @button-click="handleCloseButton"
        >
          <img
            v-if="isBlackCloseBtn"
            :alt="$t('icon.txtCloseIconAlt')"
            src="@/assets/images/back_cross.svg"
          />
          <img
            v-else
            :alt="$t('icon.txtCloseIconAlt')"
            src="@/assets/images/cross.svg"
          />
        </action-button>
      </div>
    </div>

    <custom-picture
      :alt="image.alt"
      class="image"
      :sources="image.sources"
      :src="image.src"
      :webp-sources="image.webpSources"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { ActionButton } from '@/components/buttons';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';

export default Vue.extend({
  name: 'Card',
  components: {
    CustomPicture,
    ActionButton
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: Object as PropType<PictureDescriptor>,
      required: true
    },
    buttonText: {
      type: String,
      default: ''
    },
    opened: {
      type: Boolean,
      default: true
    },
    isBlackCloseBtn: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleCloseButton(): void {
      this.$emit('close');
    },
    handleButtonClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
