<template>
  <transition appear name="fade">
    <div v-if="opened" class="banner">
      <div class="info">
        <div class="text">
          <h2 class="title">{{ title }}</h2>
          <p class="description">{{ description }}</p>
        </div>

        <div class="buttons">
          <slot name="cta">
            <action-button
              class="primary cta"
              @button-click="handleButtonClick"
            >
              {{ buttonText }}
            </action-button>
          </slot>

          <action-button
            v-if="!hideCloseButton"
            class="round close"
            @button-click="handleCloseButton"
          >
            <base-icon icon-class="icon-close" />
          </action-button>
        </div>
      </div>

      <custom-picture
        v-if="image"
        :alt="image.alt ? image.alt : title"
        class="image"
        :sources="image.sources"
        :src="image.src"
        :webp-sources="image.webpSources"
      />
      <!-- extra banner content-->
      <slot></slot>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { ActionButton } from '@/components/buttons';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import { BaseIcon } from '@/components/v1.2/index';

export default Vue.extend({
  name: 'Banner',
  components: {
    CustomPicture,
    ActionButton,
    BaseIcon
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
      default: undefined
    },
    buttonText: {
      type: String,
      default: ''
    },
    opened: {
      type: Boolean,
      default: true
    },
    hideCloseButton: {
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
