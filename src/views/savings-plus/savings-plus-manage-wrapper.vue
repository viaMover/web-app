<template>
  <transition name="fade">
    <savings-plus-manage v-if="hasActiveSavings" />
    <savings-plus-empty v-else />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { SavingsPlusEmpty, SavingsPlusManage } from '@/components/savings-plus';

export default Vue.extend({
  name: 'SavingsPlusManageWrapper',
  components: {
    SavingsPlusEmpty,
    SavingsPlusManage
  },
  computed: {
    ...mapGetters('savingsPlus', {
      hasActiveSavings: 'hasActiveSavingsPlus'
    })
  }
});
</script>
