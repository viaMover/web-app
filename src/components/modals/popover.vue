<template>
  <div>
    <div class="burger-bg" :class="{ active: isVisible }" @click="toggle" />
    <div ref="popper" class="burger-content" :class="{ active: isVisible }">
      <div class="burger-content-wrapper">
        <ul>
          <slot></slot>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Placement } from '@popperjs/core/lib/enums';
import offset from '@popperjs/core/lib/modifiers/offset';
import {
  createPopper,
  Instance as Popper
} from '@popperjs/core/lib/popper-lite';

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
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom-end'
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
      `[data-popover-parent-id="${this.parentId}"]`
    );
    if (!parentEl) {
      return;
    }

    const thisEl = this.$refs.popper as HTMLElement;

    this.popperInstance = createPopper(parentEl, thisEl, {
      strategy: 'absolute',
      placement: this.placement as Placement,
      modifiers: [
        offset,
        {
          name: 'offset',
          options: {
            offset: [0, 24]
          }
        }
      ]
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
