<template>
  <section-base
    container-class="more__wrapper__menu-item"
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
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';

import SectionBase from './section-base/section-base.vue';

export default Vue.extend({
  name: 'VaultsRaceSection',
  components: {
    CustomPicture,
    SectionBase
  },
  data() {
    return {
      image: {
        alt: this.$t('vaultsRace.txtGamesAlt'),
        src: require('@/assets/images/VaultsRace.png'),
        sources: [],
        webpSources: []
      } as PictureDescriptor
    };
  }
});
</script>
