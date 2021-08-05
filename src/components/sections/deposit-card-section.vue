<template>
  <card
    :btn-text="$t('depositCard.btnDepositCard')"
    :closed="!isInfoVisible"
    :description="$t('depositCard.txtDepositCard')"
    :icon="$t('depositCard.icon')"
    is-black-close-btn
    :title="$t('depositCard.lblDepositCardHeading')"
    wrapper-class="general-desktop__menu-wrapper-deposit"
    @button-click="handleBtnClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';

import { Card } from '@/components/controls';

export default Vue.extend({
  name: 'DepositCardSection',
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
    handleBtnClick(): void {
      toggleSingleItem(Modal.SavingsDeposit);
    }
  }
});
</script>
