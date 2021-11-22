<template>
  <earnings-olympus-manage-empty v-if="!hasActiveEarnings" />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import EarningsOlympusManageEmpty from '@/components/earnings/olympus/earnings-olympus-manage-empty.vue';

export default Vue.extend({
  name: 'EarningsOlympusManage',
  components: { EarningsOlympusManageEmpty },
  computed: {
    ...mapGetters('earnings/olympus', {
      hasActiveEarnings: 'hasActiveEarnings'
    })
  }
});
</script>
