<template>
  <secondary-page class="view view-all">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('governance.txtGetInvolved')"
        :title="$t('governance.lblGetInvolved')"
      />
    </template>

    <governance-proposals />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { GovernanceProposals } from '@/components/governance';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceViewAll',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    GovernanceProposals
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
