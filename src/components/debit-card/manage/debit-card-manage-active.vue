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
          :description="
            cardInfo ? cardInfo.expiryDate : $t('debitCard.lblNotAvailable')
          "
          :title="$t('debitCard.lblExpiryDate')"
        />
        <statement-list-item
          :description="
            cardInfo ? cardInfo.iban : $t('debitCard.lblNotAvailable')
          "
          :title="$t('debitCard.lblIBAN')"
        />
        <statement-list-item
          :description="
            cardInfo ? cardInfo.bic : $t('debitCard.lblNotAvailable')
          "
          :title="$t('debitCard.lblBIC')"
        />
      </statement-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { CardInfo } from '@/store/modules/debit-card/types';

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
      currentSkin: 'currentSkin',
      rawInfo: 'cardInfo'
    }),
    cardInfo(): CardInfo | undefined {
      return this.rawInfo;
    },
    last4Digits(): string {
      if (this.cardInfo === undefined) {
        return this.$t('debitCard.lblNotAvailable') as string;
      }

      return '*' + this.cardInfo.number.slice(-4);
    }
  }
});
</script>
