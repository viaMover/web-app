<template>
  <div v-if="opened" :class="wrapperClass">
    <div class="card__info">
      <div class="card__info-description">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="card__info-icon">
        <custom-picture
          :alt="image.alt"
          :sources="image.sources"
          :src="image.src"
          :webp-sources="image.webpSources"
        />
      </div>
    </div>
    <div class="card__buttons">
      <action-button
        class="black-link button-active"
        @button-click="handleButtonClick"
      >
        {{ buttonText }}
      </action-button>
      <action-button
        button-class="close-button button-active"
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
    },
    wrapperClass: {
      type: String,
      default: ''
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
