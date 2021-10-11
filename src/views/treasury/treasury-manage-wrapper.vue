<template>
  <treasury-manage v-if="hasActiveTreasury" />
  <treasury-empty v-else />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import TreasuryEmpty from '@/components/treasury/treasury-empty.vue';
import TreasuryManage from '@/components/treasury/treasury-manage.vue';

export default Vue.extend({
  name: 'TreasuryManageWrapper',
  components: {
    TreasuryEmpty,
    TreasuryManage
  },
  computed: {
    ...mapGetters('account', { hasActiveTreasury: 'hasActiveTreasury' })
  }
});
</script>
