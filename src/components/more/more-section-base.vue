<template>
  <div class="section">
    <div class="link">
      <slot name="heading">
        <h2 class="title">{{ headingText }}</h2>
      </slot>
      <div
        v-if="useClickEvent"
        class="navigation icon icon-only round button inherit-size"
        @click.prevent="handleClick"
      >
        <custom-picture
          :alt="$t('icon.txtNavigationLinkAlt')"
          :sources="picture.sources"
          :src="picture.src"
          :webp-sources="picture.webpSources"
        />
      </div>
      <router-link
        v-else
        class="navigation icon icon-only round button inherit-size"
        :to="{ name: navigateToName }"
      >
        <custom-picture
          :alt="$t('icon.txtNavigationLinkAlt')"
          :sources="picture.sources"
          :src="picture.src"
          :webp-sources="picture.webpSources"
        />
      </router-link>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureDescriptor } from '@/components/html5';

const picture: PictureDescriptor = {
  src: require('@/assets/images/open_icon.png'),
  sources: [
    { src: require('@/assets/images/open_icon.png') },
    {
      src: require('@/assets/images/open_icon@2x.png'),
      variant: '2x'
    }
  ],
  webpSources: [
    {
      src: require('@/assets/images/open_icon.webp')
    },
    {
      src: require('@/assets/images/open_icon@2x.webp'),
      variant: '2x'
    }
  ]
};

export default Vue.extend({
  name: 'SectionBase',
  components: {
    CustomPicture
  },
  props: {
    hasExpandButton: {
      type: Boolean,
      default: false
    },
    navigateToName: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    },
    useClickEvent: {
      type: Boolean,
      default: false
    },
    headingText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      picture
    };
  },
  methods: {
    handleClick(): void {
      this.$emit('navigation-click');
    }
  }
});
</script>
