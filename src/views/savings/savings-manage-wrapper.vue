<template>
  <div>
    <savings-manage v-if="hasActiveSavings" />
    <savings-empty v-else />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { SavingsManage, SavingsEmpty } from '@/components/savings';

export default Vue.extend({
  name: 'SavingsManageWrapper',
  components: {
    SavingsEmpty,
    SavingsManage
  },
  computed: {
    ...mapGetters('account', {
      hasActiveSavings: 'hasActiveSavings'
    })
  }
});
</script>
