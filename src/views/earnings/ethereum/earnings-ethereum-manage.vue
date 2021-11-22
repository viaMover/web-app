<template>
  <earnings-ethereum-manage-empty v-if="!hasActiveEarnings" />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import EarningsEthereumManageEmpty from '@/components/earnings/ethereum/earnings-ethereum-manage-empty.vue';

export default Vue.extend({
  name: 'EarningsEthereumManage',
  components: { EarningsEthereumManageEmpty },
  computed: {
    ...mapGetters('earnings/ethereum', {
      hasActiveEarnings: 'hasActiveEarnings'
    })
  }
});
</script>
