<template>
  <card
    :button-text="$t('savingsDepositCard.btnSavingsDepositCard')"
    :description="$t('savingsDepositCard.txtSavingsDepositCard')"
    :icon="$t('savingsDepositCard.icon')"
    is-black-close-btn
    :opened="isInfoVisible"
    :title="$t('savingsDepositCard.lblSavingsDepositCardHeading')"
    wrapper-class="general-desktop__menu-wrapper-deposit"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Modal as ModalType } from '@/store/modules/modals/types';

import { Card } from '@/components/controls';

export default Vue.extend({
  name: 'SavingsDepositCardSection',
  components: {
    Card
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
    handleButtonClick(): void {
      this.setIsModalDisplayed({ id: ModalType.SavingsDeposit, value: true });
    }
  }
});
</script>
