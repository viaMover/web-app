<template>
  <div ref="popper" class="popover" :class="{ active: isVisible }">
    <slot></slot>
    <div v-if="hasArrow" class="arrow" data-popper-arrow />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { createPopper, Instance as Popper, Placement } from '@popperjs/core';
import { subToggle, unsubToggle } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'Popover',
  props: {
    popoverId: {
      type: String,
      required: true
    },
    parentId: {
      type: String,
      required: true
    },
    hasArrow: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom'
    }
  },
  data() {
    return {
      popperInstance: undefined as Popper | undefined,
      isVisible: false
    };
  },
  mounted() {
    const parentEl = document.querySelector(
      `[data-popover-parent-id=${this.parentId}]`
    );
    if (!parentEl) {
      return;
    }

    const thisElem = this.$refs.popper as HTMLElement;

    this.popperInstance = createPopper(parentEl, thisElem, {
      placement: this.placement as Placement
    });

    subToggle(this.popoverId, this.toggle);
  },
  beforeDestroy() {
    this.popperInstance?.destroy();
    this.popperInstance = undefined;

    unsubToggle(this.popoverId, this.toggle);
  },
  methods: {
    toggle(): void {
      this.isVisible = !this.isVisible;
    }
  }
});
</script>

<style lang="less" scoped>
.popover {
  background: #333;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
  display: none;

  .arrow,
  .arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
  }

  .arrow {
    visibility: hidden;
  }

  .arrow::before {
    visibility: visible;
    content: '';
    transform: rotate(45deg);
  }

  &[data-popper-placement^='top'] > .arrow {
    bottom: -4px;
  }

  &[data-popper-placement^='bottom'] > .arrow {
    top: -4px;
  }

  &[data-popper-placement^='left'] > .arrow {
    right: -4px;
  }

  &[data-popper-placement^='right'] > .arrow {
    left: -4px;
  }

  &.active {
    display: block;
  }
}
</style>
