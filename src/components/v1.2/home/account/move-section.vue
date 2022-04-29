<template>
  <base-section class="move" :heading-text="headingText" name="move">
    <base-banner
      :button-text="$t('moveSectionCta')"
      :description="$t('moveSectionDescription', { walletBalanceMove })"
      hide-close-button
      opened
      :title="$t('moveSectionTitle')"
      @button-click="toggleInfoModal"
    />
    <info-modal
      cta-href="https://faq.viamover.com/what-is-a-move-token"
      :is-opened="isModalOpened"
      modal-key="move"
      @close="toggleInfoModal"
    />
  </base-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { getMoveAssetData } from '@/wallet/references/data';
import { SmallTokenInfo } from '@/wallet/types';

import BaseBanner from '@/components/v1.2/base-banner.vue';
import InfoModal from '@/components/v1.2/modal/info-modal.vue';

import BaseSection from './base-section.vue';

export default Vue.extend({
  components: { InfoModal, BaseSection, BaseBanner },
  data() {
    return {
      isModalOpened: false
    };
  },
  computed: {
    ...mapGetters('account', {
      walletBalanceMove: 'walletBalanceMove'
    }),
    moveAssetInfo(): SmallTokenInfo {
      return getMoveAssetData(this.currentNetwork);
    },
    headingText(): string {
      return `${
        this.walletBalanceMove
      } ${this.moveAssetInfo.symbol.toLowerCase()}`;
    }
  },
  methods: {
    toggleInfoModal(): void {
      this.isModalOpened = !this.isModalOpened;
    }
  }
});
</script>
