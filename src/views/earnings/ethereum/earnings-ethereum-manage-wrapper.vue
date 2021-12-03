<template>
  <earnings-ethereum-manage-empty v-if="!hasActiveEarnings" />
  <earnings-ethereum-manage v-else />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import {
  EarningsEthereumManage,
  EarningsEthereumManageEmpty
} from '@/components/earnings/ethereum';

export default Vue.extend({
  name: 'EarningsEthereumManageWrapper',
  components: { EarningsEthereumManage, EarningsEthereumManageEmpty },
  computed: {
    ...mapGetters('earnings/ethereum', {
      hasActiveEarnings: 'hasActiveEarnings'
    })
  }
});
</script>
