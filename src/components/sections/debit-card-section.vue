<template>
  <card
    :button-text="$t('debitCard.btnOrderDebitCard')"
    :description="$t('debitCard.txtDebitCard')"
    :icon="$t('debitCard.icon')"
    :opened="isInfoVisible"
    :title="$t('debitCard.lblDebitCardHeading')"
    wrapper-class="general-desktop__menu-wrapper-order"
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
