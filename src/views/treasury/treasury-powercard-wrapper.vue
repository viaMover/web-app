<template>
  <treasury-powercard-manage v-if="hasActivePowercard" />
  <treasury-powercard-empty v-else />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

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
    ...mapState('account', {
      powercardBalance: 'powercardBalance',
      powercardState: 'powercardState'
    }),
    hasActivePowercard(): boolean {
      return (
        this.powercardState === 'Staked' ||
        this.powercardState === 'NotStakedCooldown'
      );
    }
  }
});
</script>
