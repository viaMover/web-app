<template>
  <div class="container manage">
    <debit-card-manage-active-skeleton v-if="isLoading" />
    <debit-card-manage-pending v-else-if="cardState === 'pending'" />
    <template v-else-if="cardState === 'order_now'">
      <debit-card-manage-order-card v-if="orderState === 'order_form'" />
      <debit-card-manage-validate-phone
        v-else-if="orderState === 'validate_phone'"
      />
      <debit-card-manage-change-phone
        v-else-if="orderState === 'change_phone'"
      />
      <debit-card-manage-set-email v-else />
    </template>
    <debit-card-manage-active v-else />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import {
  DebitCardManageActive,
  DebitCardManageActiveSkeleton,
  DebitCardManageChangePhone,
  DebitCardManageOrderCard,
  DebitCardManagePending,
  DebitCardManageSetEmail,
  DebitCardManageValidatePhone
} from '@/components/debit-card';

export default Vue.extend({
  name: 'DebitCardManage',
  components: {
    DebitCardManageActive,
    DebitCardManageActiveSkeleton,
    DebitCardManagePending,
    DebitCardManageOrderCard,
    DebitCardManageValidatePhone,
    DebitCardManageChangePhone,
    DebitCardManageSetEmail
  },
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isLoading',
      cardState: 'cardState',
      orderState: 'orderState'
    })
  }
});
</script>
