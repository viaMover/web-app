<template>
  <card
    :button-text="$t('savingsDepositCard.btnSavingsDepositCard')"
    class="deposit-in-savings"
    :description="$t('savingsDepositCard.txtSavingsDepositCard')"
    :image="image"
    is-black-close-btn
    :opened="isInfoVisible"
    :title="$t('savingsDepositCard.lblSavingsDepositCardHeading')"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Card } from '@/components/controls';
import { PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'HomeCardsSavingsDeposit',
  components: {
    Card
  },
  data() {
    return {
      image: {
        alt: this.$t('savingsDepositCard.txtCardImageAlt'),
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/SavingsDepositCard.png',
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SavingsDepositCard.png'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SavingsDepositCard@2x.png'
          }
        ],
        webpSources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SavingsDepositCard.webp'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SavingsDepositCard@2x.webp'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('account', { isInfoVisible: 'isDepositCardSectionVisible' })
  },
  methods: {
    ...mapActions('account', {
      toggleInfo: 'toggleIsDepositCardSectionVisible'
    }),
    ...mapActions('modals', {
      setIsModalDisplayed: 'setIsDisplayed'
    }),
    async handleButtonClick(): Promise<void> {
      await this.$router.push({
        name: 'savings-deposit'
      });
    }
  }
});
</script>
