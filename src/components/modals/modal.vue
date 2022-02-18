<template>
  <div v-if="isDisplayed" v-show="isVisible" class="modal">
    <div
      v-show="isDimmerVisible"
      class="dimmer"
      :class="dimmerHtmlClass"
      :style="dimmerStyles"
      @click="handleDimmerClick"
    />
    <close-button
      v-if="showCloseButton"
      class="close-button"
      is-black
      :style="buttonStyles"
      @close="handleClose"
    />
    <section
      class="body"
      :class="{ 'no-bottom-padding': disableBodyBottomPadding }"
      :name="modalId"
      role="dialog"
      :style="bodyStyles"
    >
      <div v-if="isHeaderDisplayed" class="header" :class="headerClass">
        <slot name="header">
          <h3>{{ headerText }}</h3>
        </slot>
      </div>
      <div class="content" :class="contentHtmlClass">
        <slot></slot>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapState } from 'vuex';

import { Properties as CssProperties } from 'csstype';

import { TModalKey } from '@/store/modules/modals/types';

import { CloseButton } from '@/components/buttons';

export default Vue.extend({
  name: 'Modal',
  components: {
    CloseButton
  },
  props: {
    modalId: {
      type: String as PropType<TModalKey>
    },
    showCloseButton: {
      type: Boolean,
      default: false
    },
    disableDimmer: {
      type: Boolean,
      default: false
    },
    hasHeader: {
      type: Boolean,
      default: false
    },
    headerText: {
      type: String,
      default: ''
    },
    hasFooter: {
      type: Boolean,
      default: false
    },
    footerText: {
      type: String,
      default: ''
    },
    dimmerHtmlClass: {
      type: String,
      default: ''
    },
    headerHtmlClass: {
      type: String,
      default: ''
    },
    contentHtmlClass: {
      type: String,
      default: ''
    },
    footerHtmlClass: {
      type: String,
      default: ''
    },
    customBodyStyles: {
      type: Object as PropType<CssProperties>,
      default: undefined
    },
    customCloseButtonStyles: {
      type: Object as PropType<CssProperties>,
      default: undefined
    },
    customDimmerStyles: {
      type: Object as PropType<CssProperties>,
      default: undefined
    },
    closeOnDimmerClick: {
      type: Boolean,
      default: false
    },
    disableHeaderBottomMargin: {
      type: Boolean,
      default: false
    },
    disableBodyBottomPadding: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('modals', ['state']),
    isHeaderDisplayed(): boolean {
      return this.hasHeader || this.headerText !== '';
    },
    isVisible(): boolean {
      return this.state[this.modalId].isVisible;
    },
    isDisplayed(): boolean {
      return this.state[this.modalId].isDisplayed;
    },
    zIndexBase(): number {
      return this.state[this.modalId].stackDepth * 10 + 10;
    },
    isDimmerVisible(): boolean {
      return !this.disableDimmer;
    },
    bodyStyles(): CssProperties {
      return {
        zIndex: this.zIndexBase,
        ...this.customBodyStyles
      };
    },
    buttonStyles(): CssProperties {
      return {
        zIndex: this.zIndexBase + 1,
        ...this.customCloseButtonStyles
      };
    },
    dimmerStyles(): CssProperties {
      return {
        zIndex: this.zIndexBase - 1,
        ...this.customDimmerStyles
      };
    },
    headerClass(): string {
      const classes = new Array<string>();

      if (this.disableHeaderBottomMargin) {
        classes.push('no-bottom-margin');
      }

      if (this.headerHtmlClass !== '') {
        classes.push(this.headerHtmlClass);
      }

      return classes.join(' ');
    }
  },
  async beforeDestroy() {
    // gracefully handle the case when modal parent is destroyed
    // before it's child modal component
    await this.handleClose();
  },
  methods: {
    ...mapActions('modals', ['setIsDisplayed']),
    async handleClose(): Promise<void> {
      this.$emit('close');
      await this.setIsDisplayed({
        id: this.modalId,
        value: false
      });
    },
    async handleDimmerClick(): Promise<void> {
      if (!this.closeOnDimmerClick) {
        return;
      }

      await this.handleClose();
    }
  }
});
</script>
