<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description">{{ $t('debitCard.txtVisaDebitCard') }}</p>

    <div class="content">
      <div class="container card-image">
        <debit-card-image :skin="currentSkin" />
      </div>
      <statement-list class="container">
        <statement-list-item
          :description="last4Digits"
          :title="$t('debitCard.lblLast4Digits')"
        />
        <statement-list-item
          :description="expiryDate"
          :title="$t('debitCard.lblExpiryDate')"
        />
        <statement-list-item
          :description="iban"
          :title="$t('debitCard.lblIBAN')"
        />
        <statement-list-item
          :description="bic"
          :title="$t('debitCard.lblBIC')"
        />
      </statement-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'DebitCardManageActive',
  components: {
    StatementList,
    StatementListItem
  },
  computed: {
    ...mapState('debitCard', {
      cardNumber: 'cardNumber',
      expiryDate: 'expiryDate',
      iban: 'iban',
      bic: 'bic'
    }),
    last4Numbers(): string {
      return (this.cardNumber as string).slice(-4);
    }
  }
});
</script>
