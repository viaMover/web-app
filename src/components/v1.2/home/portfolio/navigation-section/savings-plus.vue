<template>
  <base-item-image
    :description="savingsPlusBalance"
    description-class="bold emphasize"
    navigate-to="savings-plus-about"
    :title="$t('savingsPlus.lblSavingsPlus')"
    title-class="medium muted"
  >
    <template v-slot:picture>
      <custom-picture
        :alt="$t('savingsPlus.lblSavingsPlus')"
        :sources="savingsPlusPicture.sources"
        :src="savingsPlusPicture.src"
        :webp-sources="savingsPlusPicture.webpSources"
      />
    </template>
  </base-item-image>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import savingsPlusPicture from '@/assets/images/sections/savings-plus';

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
      savingsPlusPicture
    };
  },
  computed: {
    ...mapGetters('savingsPlus', {
      balanceNative: 'balanceNative'
    }),
    savingsPlusBalance(): string {
      return this.formatAsNativeCurrency(this.balanceNative);
    }
  },
  mounted() {
    this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('savingsPlus', {
      loadMinimalInfo: 'loadInfo'
    })
  }
});
</script>
