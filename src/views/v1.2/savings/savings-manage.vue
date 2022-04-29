<template>
  <module-manage>
    <template #navigation>
      <base-item-icon
        icon-class="icon-deposit"
        navigate-to="savings-deposit"
        :text="$t('deposit')"
      />

      <base-item-icon
        icon-class="icon-withdraw"
        navigate-to="savings-withdraw"
        :text="$t('withdraw')"
      />

      <base-item-icon
        icon-class="icon-analytics"
        navigate-to="savings-analytics"
        :text="$t('analytics')"
      />
    </template>
  </module-manage>
</template>

<script lang="ts">
import Vue from 'vue';

import BaseItemIcon from '@/components/v1.2/home/portfolio/navigation-section/base-item-icon.vue';
import { ModuleManage } from '@/components/v1.2/layout';

export default Vue.extend({
  components: { ModuleManage, BaseItemIcon }
});
</script>
