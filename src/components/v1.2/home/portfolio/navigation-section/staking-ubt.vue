<template>
  <base-item-image
    :description="stakingUBTBalance"
    description-class="bold emphasize"
    navigate-to="staking-ubt-about"
    :title="$t('staking')"
    title-class="medium muted"
  >
    <template v-slot:picture>
      <custom-picture
        :alt="$t('staking')"
        :sources="stakingUBTPicture.sources"
        :src="stakingUBTPicture.src"
        :webp-sources="stakingUBTPicture.webpSources"
      />
    </template>
  </base-item-image>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import stakingUBTPicture from '@/assets/images/sections/staking';

import { CustomPicture } from '@/components/html5';

import BaseItemImage from './base-item-image.vue';

export default Vue.extend({
  name: 'StakingUbt',
  components: {
    BaseItemImage,
    CustomPicture
  },
  data() {
    return {
      stakingUBTPicture
    };
  },
  computed: {
    ...mapGetters('stakingUBT', {
      stakingUBTBalanceNative: 'balanceNative'
    }),
    stakingUBTBalance(): string {
      return this.formatAsNativeCurrency(this.stakingUBTBalanceNative);
    }
  },
  mounted() {
    this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('stakingUBT', {
      loadMinimalInfo: 'getMinimalInfo'
    })
  }
});
</script>
