<template>
  <div v-if="useClickEvent" class="link-icon" @click.prevent="handleClick">
    <custom-picture
      :alt="$t('icon.txtNavigationLinkAlt')"
      :sources="picture.sources"
      :src="picture.src"
      :webp-sources="picture.webpSources"
    />
  </div>
  <router-link
    v-else
    class="link-icon button-active"
    :to="{ name: navigateToName }"
  >
    <picture>
      <custom-picture
        :alt="$t('icon.txtNavigationLinkAlt')"
        :sources="picture.sources"
        :src="picture.src"
        :webp-sources="picture.webpSources"
      />
    </picture>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureDescriptor } from '@/components/html5';

const picture: PictureDescriptor = {
  alt: '', // not used
  src: require('@/assets/images/open_icon.png'),
  sources: [
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
  name: 'SectionBaseLink',
  components: {
    CustomPicture
  },
  props: {
    navigateToName: {
      type: String,
      default: ''
    },
    useClickEvent: {
      type: Boolean,
      default: true
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
