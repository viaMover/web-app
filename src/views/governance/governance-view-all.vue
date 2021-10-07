<template>
  <content-wrapper
    base-class="info__wrapper"
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class="product-item__wrapper governance__menu"
    wrapper-class="governance"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <governance-nav-my-governance />
      <governance-nav-manage-governance />
    </template>

    <secondary-page :title="$t('governance.lblGetInvolved')">
      <p class="description">{{ $t('governance.txtGetInvolved') }}</p>

      <governance-proposals />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  GovernanceNavManageGovernance,
  GovernanceNavMyGovernance,
  GovernanceProposals
} from '@/components/governance';
import { ContentWrapper, SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceViewAll',
  components: {
    ContentWrapper,
    SecondaryPage,
    GovernanceNavMyGovernance,
    GovernanceNavManageGovernance,
    GovernanceProposals
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
