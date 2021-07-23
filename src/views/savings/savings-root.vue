<template>
  <content-wrapper
    has-back-button
    has-left-rail
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="savings"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <savings-overview />
      <savings-stats />
      <savings-estimation />
    </template>

    <router-view />

    <centered-modal-window v-cloak :modal-id="SavingsDepositModalId">
      <savings-deposit-form />
    </centered-modal-window>
    <search-modal />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import {
  SavingsOverview,
  SavingsStats,
  SavingsEstimation
} from '@/components/savings';
import { SavingsDepositForm } from '@/components/forms';
import { CenteredModalWindow, Modal, SearchModal } from '@/components/modals';

import '@/styles/_savings.less';

export default Vue.extend({
  name: 'SavingsRoot',
  components: {
    ContentWrapper,
    SavingsOverview,
    SavingsStats,
    SavingsEstimation,
    SavingsDepositForm,
    CenteredModalWindow,
    SearchModal
  },
  data() {
    return {
      SavingsDepositModalId: Modal.SavingsDeposit
    };
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
