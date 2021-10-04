<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="savings"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <keep-alive>
        <component :is="'savings-left-rail'" />
      </keep-alive>
    </template>

    <router-view />

    <template v-slot:modals>
      <savings-deposit-modal />
      <savings-withdraw-modal />
      <search-modal />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import {
  SavingsDepositModal,
  SavingsWithdrawModal,
  SearchModal
} from '@/components/modals';
import { SavingsLeftRail } from '@/components/savings';

import '@/styles/_savings.less';

export default Vue.extend({
  name: 'SavingsRoot',
  components: {
    SavingsLeftRail,
    ContentWrapper,
    SavingsDepositModal,
    SavingsWithdrawModal,
    SearchModal
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
