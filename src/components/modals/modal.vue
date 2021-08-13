<template>
  <!--  <transition appear name="fade">-->
  <div
    v-if="isDisplayed"
    v-show="isVisible"
    class="modal"
    :name="modalId"
    role="dialog"
  >
    <div
      v-show="isDimmerVisible"
      class="modal__dimmer"
      :class="dimmerHtmlClass"
      :style="dimmerStyles"
      @click="handleDimmerClick"
    />
    <close-button
      v-if="showCloseButton"
      class="modal__close-button"
      is-black
      :style="buttonStyles"
      @close="handleClose"
    />
    <div
      class="modal__body"
      :class="{ 'no-bottom-padding': disableBodyBottomPadding }"
      :style="bodyStyles"
    >
      <div
        v-if="isHeaderDisplayed"
        class="modal__body-header"
        :class="headerClass"
      >
        <slot name="header">
          <h3 class="modal__body-header--default">{{ headerText }}</h3>
        </slot>
      </div>
      <div class="modal__body-content" :class="contentHtmlClass">
        <slot></slot>
      </div>
      <div
        v-if="isFooterDisplayed"
        class="modal__body-footer"
        :class="footerHtmlClass"
      >
        <slot name="footer">{{ footerText }}</slot>
      </div>
    </div>
  </div>
  <!--  </transition>-->
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
    isFooterDisplayed(): boolean {
      return this.hasFooter || this.footerText !== '';
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

<style scoped lang="less">
.modal {
  &__dimmer {
    background: rgba(0, 0, 0, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  &__close-button {
    cursor: pointer;
    width: 40px;
    height: 40px;
    background: #fcfcfc;
    -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-radius: 20px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    position: fixed;
    top: 24px;
    right: 24px;
  }

  &__body {
    position: fixed;
    top: 104px;
    left: calc(50% - 264px);
    width: 528px;
    min-height: 30vh;
    height: auto;
    max-height: 80vh;
    padding: 24px;
    background-color: #fafafc;
    -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-radius: 16px;

    &.no-bottom-padding {
      padding-bottom: 0;
    }

    &-header {
      margin-bottom: 24px;

      &.no-bottom-margin {
        margin-bottom: 0;
      }

      &--default {
        font-family: Regular, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;
        text-align: center;
      }
    }

    &-footer {
      margin-top: 24px;
    }
  }
}
</style>
