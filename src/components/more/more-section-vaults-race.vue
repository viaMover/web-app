<template>
  <more-section-base
    container-class="vaults-race"
    has-expand-button
    :heading-text="$t('vaultsRace.lblGames')"
    :name="$t('vaultsRace.lblGames')"
    navigate-to-name="vaults-race-view-all"
  >
    <custom-picture
      :alt="image.alt"
      :sources="image.sources"
      :src="image.src"
      :webp-sources="image.webpSources"
    />
  </more-section-base>
</template>

<script lang="ts">
import Vue from 'vue';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';

import MoreSectionBase from './more-section-base.vue';

export default Vue.extend({
  name: 'MoreSectionVaultsRace',
  components: {
    MoreSectionBase,
    CustomPicture
  },
  data() {
    return {
      image: {
        alt: this.$t('vaultsRace.txtGamesAlt'),
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/VaultsRace.png',
        sources: [],
        webpSources: []
      } as PictureDescriptor
    };
  }
});
</script>
