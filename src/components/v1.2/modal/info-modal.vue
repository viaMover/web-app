<template>
  <base-info-modal
    :button-text="$t('learnMoreAbout', { term: variantParams.term })"
    :cta-href="ctaHref"
    :image="variantParams.image"
    :is-opened="isOpened"
    :title="$t('whatIs', { term: variantParams.term })"
    @button-click="handleButtonClick"
    @close="handleClose"
  >
    <i18n class="description" :path="descriptionLocalizationPath" tag="p">
      <template v-slot:br><br /></template>
    </i18n>
  </base-info-modal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import {
  variantRegistry,
  VariantRegistryItem,
  VariantRegistryKey
} from '@/components/v1.2/modal/info-modal-factory';

import BaseInfoModal from './base-info-modal.vue';

export default Vue.extend({
  components: { BaseInfoModal },
  props: {
    modalKey: {
      type: String as PropType<VariantRegistryKey>,
      required: true
    },
    isOpened: {
      type: Boolean,
      required: false
    },
    ctaHref: {
      type: String,
      default: undefined
    }
  },
  computed: {
    variantParams(): VariantRegistryItem {
      return variantRegistry[this.modalKey];
    },
    descriptionLocalizationPath(): string {
      return `whatIs${this.variantParams.descriptionTerm}Text`;
    }
  },
  methods: {
    handleClose(): void {
      this.$emit('close');
    },
    handleButtonClick(): void {
      this.$emit('button-click');
    }
  }
});
</script>
