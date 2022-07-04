<template>
  <content-wrapper
    class="product tag"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <navigation-section
              :is-loading="isLoading"
              :section-name="$t('tag.myTag')"
              skeleton-component="navigation-section-item-image-skeleton"
            >
              <navigation-section-item-image
                :description="descriptionText"
                description-class="bold emphasize"
                navigate-to="tag-manage"
                :title="$t('tag.tag')"
                title-class="medium muted"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="tagPicture.alt"
                    :sources="tagPicture.sources"
                    :src="tagPicture.src"
                  />
                </template>
              </navigation-section-item-image>
            </navigation-section>
          </div>
        </div>
      </nav>
    </template>

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import {
  NavigationSection,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'TagRoot',
  components: {
    ContentWrapper,
    NavigationSection,
    NavigationSectionItemImage,
    CustomPicture
  },
  data() {
    return {
      tagPicture: {
        src: require('@/assets/images/tag@1x.png'),
        sources: [
          {
            src: require('@/assets/images/tag@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('tag', ['isLoading', 'tag']),
    descriptionText(): string {
      if (this.tag === undefined) {
        return this.$t('tag.notReserved') as string;
      }

      return `$${this.tag}`;
    }
  },
  mounted() {
    this.loadInfo();
  },
  methods: {
    ...mapActions('tag', ['loadInfo']),
    isFeatureEnabled,
    handleClose() {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
