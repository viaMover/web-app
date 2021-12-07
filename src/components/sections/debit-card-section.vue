<template>
  <card
    :button-text="$t('debitCard.btnOrderDebitCard')"
    class="order-debit-card"
    :description="$t('debitCard.txtDebitCard')"
    :icon="$t('debitCard.icon')"
    :opened="isInfoVisible"
    :title="$t('debitCard.lblDebitCardHeading')"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Card } from '@/components/controls';

export default Vue.extend({
  name: 'DebitCardSection',
  components: {
    Card
  },
  computed: {
    ...mapState('account', { isInfoVisible: 'isDebitCardSectionVisible' })
  },
  methods: {
    ...mapActions('account', { toggleInfo: 'toggleIsDebitCardSectionVisible' }),
    handleButtonClick(): void {
      //
    }
  }
});
</script>
