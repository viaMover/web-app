<template>
  <earnings-olympus-manage-empty v-if="!hasActiveEarnings" />
  <earnings-olympus-manage v-else />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import {
  EarningsOlympusManage,
  EarningsOlympusManageEmpty
} from '@/components/earnings/olympus';

export default Vue.extend({
  name: 'EarningsOlympusManageWrapper',
  components: { EarningsOlympusManage, EarningsOlympusManageEmpty },
  computed: {
    ...mapGetters('earnings/olympus', {
      hasActiveEarnings: 'hasActiveEarnings'
    })
  }
});
</script>
