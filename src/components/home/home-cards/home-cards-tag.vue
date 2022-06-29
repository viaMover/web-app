<template>
  <card
    :button-text="$t('tag.bannerReserveTagButton')"
    class="reserve-tag"
    :description="$t('tag.bannerReserveTagDescription')"
    :image="image"
    is-black-close-btn
    :opened="isVisible"
    :title="$t('tag.bannerReserveTagTitle')"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Card } from '@/components/controls';
import { PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'HomeCardsTag',
  components: {
    Card
  },
  data() {
    return {
      isLoading: false,
      image: {
        src: require('@/assets/images/tag-banner@1x.png'),
        sources: [
          {
            src: require('@/assets/images/tag-banner@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('tag', { isInfoVisible: 'isBannerVisible' })
  },
  async mounted() {
    this.isLoading = true;
    await this.loadInfo();
    this.isLoading = false;
  },
  methods: {
    ...mapActions('tag', {
      toggleInfo: 'toggleIsBannerVisible',
      loadInfo: 'loadInfo'
    }),
    handleButtonClick(): void {
      this.$router.push({ name: 'tag-manage' });
    }
  }
});
</script>
