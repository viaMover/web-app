<template>
  <base-item-image
    :description="savingsBalance"
    description-class="bold emphasize"
    navigate-to="savings-about"
    :title="$t('savings')"
    title-class="medium muted"
  >
    <template v-slot:picture>
      <custom-picture
        :alt="$t('savings')"
        :sources="savingsPicture.sources"
        :src="savingsPicture.src"
        :webp-sources="savingsPicture.webpSources"
      />
    </template>
  </base-item-image>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import savingsPicture from '@/assets/images/sections/savings';

import { CustomPicture } from '@/components/html5';

import BaseItemImage from './base-item-image.vue';

export default Vue.extend({
  name: 'Savings',
  components: {
    BaseItemImage,
    CustomPicture
  },
  data() {
    return {
      savingsPicture
    };
  },
  computed: {
    ...mapGetters('savings', {
      savingsInfoBalanceNative: 'savingsInfoBalanceNative'
    }),
    savingsBalance(): string {
      return this.formatAsNativeCurrency(this.savingsInfoBalanceNative);
    }
  },
  mounted() {
    this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('savings', {
      loadMinimalInfo: 'loadMinimalInfo'
    })
  }
});
</script>
