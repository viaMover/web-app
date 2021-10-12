<template>
  <treasury-powercard-manage v-if="hasPowercard" />
  <treasury-powercard-empty v-else />
</template>

<script lang="ts">
import Vue from 'vue';

import {
  TreasuryPowercardEmpty,
  TreasuryPowercardManage
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryManageWrapper',
  components: {
    TreasuryPowercardManage,
    TreasuryPowercardEmpty
  },
  computed: {
    hasPowercard(): boolean {
      return true;
    }
  }
});
</script>
