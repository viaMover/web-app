<template>
  <div class="container manage">
    <debit-card-manage-active-skeleton v-if="isLoading" />
    <debit-card-manage-pending v-else-if="cardState === 'pending'" />
    <debit-card-manage-empty
      v-else-if="cardState === 'order_now' || cardState === 'request_email'"
    />
    <debit-card-manage-active v-else />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import {
  DebitCardManageActive,
  DebitCardManageActiveSkeleton,
  DebitCardManageEmpty,
  DebitCardManagePending
} from '@/components/debit-card';

export default Vue.extend({
  name: 'DebitCardManage',
  components: {
    DebitCardManageActive,
    DebitCardManageActiveSkeleton,
    DebitCardManagePending,
    DebitCardManageEmpty
  },
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isLoading',
      cardState: 'cardState'
    })
  }
});
</script>
