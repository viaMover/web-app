<template>
  <base-item-image
    :description="debitCardDescription"
    :description-class="debitCardDescriptionClass"
    navigate-to="debit-card-manage"
    :title="$t('beautifulCard')"
    title-class="medium muted"
  >
    <template v-slot:picture>
      <custom-picture
        :alt="$t('beautifulCard')"
        :sources="debitCardImage.sources"
        :src="debitCardImage.src"
        :webp-sources="debitCardImage.webpSources"
      />
    </template>
  </base-item-image>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import debitCardImage from '@/assets/images/sections/debit-card';

import { CustomPicture } from '@/components/html5';

import BaseItemImage from './base-item-image.vue';

export default Vue.extend({
  name: 'Card',
  components: {
    BaseItemImage,
    CustomPicture
  },
  data() {
    return {
      debitCardImage
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapState('debitCard', {
      isDebitCardInfoLoading: 'isLoading',
      debitCardState: 'cardState'
    }),
    ...mapGetters('debitCard', {
      debitCardStateText: 'cardStateText'
    }),
    debitCardDescription(): string {
      if (this.isDebitCardInfoLoading) {
        return '';
      }

      return this.debitCardStateText;
    },
    debitCardDescriptionClass(): string {
      if (['frozen', 'expired'].includes(this.debitCardState)) {
        return 'error';
      }

      return 'bold emphasize';
    }
  },
  mounted() {
    this.loadInfo();
  },
  methods: {
    ...mapActions('debitCard', { loadInfo: 'loadInfo' })
  }
});
</script>
