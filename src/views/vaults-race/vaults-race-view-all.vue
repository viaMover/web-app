<template>
  <secondary-page hide-title>
    <secondary-page-simple-title
      :description="$t('vaultsRace.lblWeeklyChallengeDescription')"
      :title="$t('vaultsRace.lblWeeklyChallenge')"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { RawLocation } from 'vue-router';
import { mapState } from 'vuex';

import { PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';
import SecondaryPageSimpleTitle from '@/components/layout/secondary-page/secondary-page-simple-title.vue';

export default Vue.extend({
  name: 'VaultsRaceViewAll',
  components: {
    SecondaryPageSimpleTitle,
    SecondaryPage
  },
  data() {
    return {
      headerImage: {
        alt: this.$t('NFTs.txtLogoAlt'),
        src: require('@/assets/images/NFT-Drops.png'),
        sources: [
          { src: require('@/assets/images/NFT-Drops.png') },
          {
            variant: '2x',
            src: require('@/assets/images/NFT-Drops@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/NFT-Drops.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/NFT-Drops@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('nft', { nftList: 'nfts' })
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    },
    routeTo(name: string): RawLocation {
      return {
        name: name.toLowerCase().replaceAll(' ', '-')
      };
    }
  }
});
</script>
