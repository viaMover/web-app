<template>
  <base-banner
    :button-text="$t('depositInSavingsPlus')"
    class="savings-plus"
    :description="$t('bannerSavingsPlusIsLiveDescription')"
    :opened="isBannerOpened"
    :title="$t('bannerSavingsPlusIsLiveTitle')"
    @button-click="handleBannerCtaClick"
    @close="handleBannerCloseClick"
  >
    <template v-slot:cta>
      <router-link
        class="primary cta button"
        :to="{ name: 'savings-plus-deposit' }"
      >
        {{ $t('depositInSavingsPlus') }}
      </router-link>
    </template>

    <custom-picture
      class="image badge-multichain"
      :sources="bannerImage.sources"
      :src="bannerImage.src"
    />
  </base-banner>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import bannerImage from '@/assets/images/banners/savings-plus';

import { CustomPicture } from '@/components/html5';

import BaseBanner from '../../../base-banner.vue';

export default Vue.extend({
  name: 'Banner',
  components: {
    BaseBanner,
    CustomPicture
  },
  data() {
    return {
      bannerImage
    };
  },
  computed: {
    isBannerOpened(): boolean {
      // fixme: use mapState
      return true;
    }
  },
  methods: {
    // fixme: use the right action
    ...mapActions('account', {
      toggleBanner: 'toggleIsBannerVisible'
    }),
    handleBannerCtaClick(): void {
      this.$router.push({ name: 'savings-plus-deposit' });
    },
    handleBannerCloseClick(): void {
      this.toggleBanner();
    }
  }
});
</script>
