<template>
  <li :class="itemClass">
    <router-link class="button-active" :to="{ name: this.navigateToName }">
      <div class="image">
        <picture>
          <source
            :srcset="`
              ${require(`@/assets/images/${pic}@1x.webp`)},
              ${require(`@/assets/images/${pic}@2x.webp`)} 2x
            `"
            type="image/webp"
          />
          <img
            alt=""
            :src="`${require(`@/assets/images/${pic}@1x.png`)}`"
            :srcset="`
              ${require(`@/assets/images/${pic}@1x.png`)},
              ${require(`@/assets/images/${pic}@2x.png`)} 2x
            `"
          />
        </picture>
      </div>
      <div class="info">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MenuListEmojiCardItem',
  props: {
    pic: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    navigateToName: {
      type: String,
      required: true
    }
  },
  computed: {
    itemClass(): string {
      if (this.disabled) {
        return 'disabled';
      }

      return '';
    },
    srcsetWebp(): string {
      return `@/assets/images/${this.pic}@1x.webp,
              @/assets/images/${this.pic}@2x.webp 2x`;
    },
    src(): string {
      return `@/assets/images/${this.pic}@1x.png`;
    }
  }
});
</script>
