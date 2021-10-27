<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description">{{ $t('debitCard.txtBeautifulCard') }}</p>

    <debit-card-manage-active-skeleton v-if="isLoading" />
    <debit-card-manage-active v-else-if="cardState === 'active'" />
    <debit-card-manage-pending v-else-if="cardState === 'pending'" />
    <debit-card-manage-empty v-else />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import {
  DebitCardManageActive,
  DebitCardManageActiveSkeleton,
  DebitCardManageEmpty
} from '@/components/debit-card';
import { SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'DebitCardChangeSkin',
  components: {
    SecondaryPage,
    DebitCardManageActive,
    DebitCardManageActiveSkeleton,
    DebitCardManageEmpty
  },
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isLoading',
      currentSkin: 'cardSkin',
      cardState: 'cardState'
    })
  }
});
</script>
