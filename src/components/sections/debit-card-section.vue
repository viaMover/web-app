<template>
  <card
    :button-text="$t('debitCard.btnOrderDebitCard')"
    class="order-debit-card"
    :description="$t('debitCard.txtDebitCard')"
    :image="image"
    is-black-close-btn
    :opened="isVisible"
    :title="$t('debitCard.lblDebitCardHeading')"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Card } from '@/components/controls';

import { PictureDescriptor } from '../html5';

export default Vue.extend({
  name: 'DebitCardSection',
  components: {
    Card
  },
  data() {
    return {
      isLoading: false,
      image: {
        src: require('@/assets/images/banner-card-main@1x.png'),
        alt: this.$t('debitCard.lblDebitCard'),
        sources: [
          {
            src: require('@/assets/images/banner-card-main@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('account', { isInfoVisible: 'isDebitCardSectionVisible' }),
    ...mapState('debitCard', {
      cardState: 'cardState',
      isCardStoreInitialized: 'isInitialized'
    }),
    isVisible(): boolean {
      return (
        this.isCardStoreInitialized &&
        this.cardState === 'order_now' &&
        this.isInfoVisible
      );
    }
  },
  async mounted() {
    this.isLoading = true;
    await this.loadCurrentSkin();
    this.isLoading = false;
  },
  methods: {
    ...mapActions('account', { toggleInfo: 'toggleIsDebitCardSectionVisible' }),
    ...mapActions('debitCard', {
      loadCurrentSkin: 'loadCurrentSkin'
    }),
    handleButtonClick(): void {
      this.$router.push({ name: 'debit-card-manage' });
    }
  }
});
</script>
