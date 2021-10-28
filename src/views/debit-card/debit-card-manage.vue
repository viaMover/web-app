<template>
  <debit-card-manage-active-skeleton v-if="isLoading" />
  <debit-card-manage-active v-else-if="cardState === 'active'" />
  <debit-card-manage-pending v-else-if="cardState === 'pending'" />
  <debit-card-manage-empty v-else />
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
