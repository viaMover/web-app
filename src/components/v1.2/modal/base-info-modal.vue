<template>
  <base-modal :is-opened="isOpened" :lock-body="lockBody" @close="handleClose">
    <template v-slot:heading>
      <custom-picture
        class="image"
        :sources="image.sources"
        :src="image.src"
        :webp-sources="image.webpSources"
      />
      <slot name="title">
        <h2 class="title">{{ title }}</h2>
      </slot>
    </template>

    <slot>
      <p class="description">
        {{ description }}
      </p>
    </slot>
    <slot name="button">
      <a
        v-if="ctaHref"
        class="button cta"
        :href="ctaHref"
        rel="external help"
        target="_blank"
      >
        <slot name="button-text">{{ buttonText }}</slot>
      </a>
      <action-button v-else class="cta" @button-click="handleButtonClick">
        <slot name="button-text">{{ buttonText }}</slot>
      </action-button>
    </slot>
  </base-modal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import ActionButton from '@/components/buttons/action-button.vue';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import BaseModal from '@/components/v1.2/modal/base-modal.vue';

export default Vue.extend({
  name: 'BaseInfoModal',
  components: { ActionButton, CustomPicture, BaseModal },
  props: {
    image: {
      type: Object as PropType<PictureDescriptor>,
      required: true
    },
    title: {
      type: String,
      default: undefined
    },
    description: {
      type: String,
      default: undefined
    },
    buttonText: {
      type: String,
      default: undefined
    },
    isOpened: {
      type: Boolean,
      default: false
    },
    lockBody: {
      type: Boolean,
      default: true
    },
    ctaHref: {
      type: String,
      default: undefined
    }
  },
  methods: {
    handleButtonClick(): void {
      this.$emit('button-click');
    },
    handleClose(): void {
      this.$emit('close');
    }
  }
});
</script>
