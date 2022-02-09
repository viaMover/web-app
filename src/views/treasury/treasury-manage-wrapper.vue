<template>
  <transition name="fade">
    <treasury-manage v-if="hasActiveTreasury" />
    <treasury-empty v-else />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { TreasuryEmpty, TreasuryManage } from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryManageWrapper',
  components: {
    TreasuryEmpty,
    TreasuryManage
  },
  computed: {
    ...mapGetters('treasury', { hasActiveTreasury: 'hasActiveTreasury' })
  }
});
</script>
