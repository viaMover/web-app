<template>
  <transition name="fade">
    <staking-ubt-manage v-if="hasActiveStaking" />
    <staking-ubt-empty v-else />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { StakingUbtEmpty, StakingUbtManage } from '@/components/staking-ubt';

export default Vue.extend({
  name: 'StakingUbtManageWrapper',
  components: {
    StakingUbtEmpty,
    StakingUbtManage
  },
  computed: {
    ...mapGetters('stakingUBT', {
      hasActiveStaking: 'hasActiveStaking'
    })
  }
});
</script>
