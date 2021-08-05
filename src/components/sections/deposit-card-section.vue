<template>
  <card
    :btn-text="$t('depositCard.btnDepositCard')"
    :closed="!isInfoVisible"
    :description="$t('depositCard.txtDepositCard')"
    :icon="$t('depositCard.icon')"
    is-black-close-btn
    :title="$t('depositCard.lblDepositCardHeading')"
    wrapper-class="general-desktop__menu-wrapper-deposit"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import Card from '@/components/controls/card.vue';

export default Vue.extend({
  name: 'DepositCardSection',
  components: {
    Card
  },
  computed: {
    ...mapState('account', { isInfoVisible: 'isDebitCardSectionVisible' })
  },
  methods: {
    ...mapActions('account', { toggleInfo: 'toggleIsDebitCardSectionVisible' })
  }
});
</script>
