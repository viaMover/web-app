<template>
  <component :is="component" />
</template>

<script lang="ts">
import Vue, { Component } from 'vue';
import { mapState } from 'vuex';

import { CardState, OrderState } from '@/store/modules/debit-card/types';

import {
  DebitCardManageActive,
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
    }),
    component(): Component {
      if (this.isLoading) {
        return DebitCardManageActive;
      }

      const cardState: CardState = this.cardState;

      if (cardState === 'pending') {
        return DebitCardManagePending;
      }

      if (cardState === 'order_now') {
        const orderState: OrderState | undefined = this.orderState;

        switch (orderState) {
          case 'order_form':
            return DebitCardManageOrderCard;
          case 'validate_phone':
            return DebitCardManageValidatePhone;
          case 'change_phone':
            return DebitCardManageChangePhone;
          default:
            return DebitCardManageSetEmail;
        }
      }

      return DebitCardManageActive;
    }
  }
});
</script>
