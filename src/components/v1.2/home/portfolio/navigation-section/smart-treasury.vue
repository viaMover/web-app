<template>
  <base-item-image
    class="no-hover"
    :description="treasuryBalance"
    description-class="bold emphasize"
    navigate-to="treasury-manage"
    :title="$t('smartTreasury')"
    title-class="medium muted"
  >
    <template v-slot:picture>
      <custom-picture
        :alt="$t('smartTreasury')"
        :sources="treasuryPicture.sources"
        :src="treasuryPicture.src"
        :webp-sources="treasuryPicture.webpSources"
      />
    </template>
  </base-item-image>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import treasuryPicture from '@/assets/images/sections/smart-treasury';
import { add } from '@/utils/bigmath';

import { CustomPicture } from '@/components/html5';

import BaseItemImage from './base-item-image.vue';

export default Vue.extend({
  name: 'SmartTreasury',
  components: {
    BaseItemImage,
    CustomPicture
  },
  data() {
    return {
      treasuryPicture
    };
  },
  computed: {
    ...mapGetters('treasury', [
      'treasuryBonusNative',
      'treasuryStakedBalanceNative'
    ]),
    treasuryBalance(): string {
      const treasuryAllBalance = add(
        this.treasuryBonusNative,
        this.treasuryStakedBalanceNative
      );

      return this.formatAsNativeCurrency(treasuryAllBalance);
    }
  },
  mounted() {
    this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('treasury', {
      loadMinimalInfo: 'loadMinimalInfo'
    })
  }
});
</script>
