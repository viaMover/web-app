<template>
  <transition name="fade">
    <treasury-powercard-manage v-if="hasActivePowercard" />
    <treasury-powercard-empty v-else />
  </transition>
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
    ...mapState('treasury', {
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
