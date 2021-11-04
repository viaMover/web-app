<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description">{{ $t('debitCard.txtVisaDebitCard') }}</p>

    <div class="content">
      <div class="container">
        <debit-card-image :skin="currentSkin" />
      </div>
      <statement-list class="container">
        <statement-list-item
          :description="$t('debitCard.lblLast4Digits')"
          :value="last4Digits"
        />
        <statement-list-item
          :description="$t('debitCard.lblExpiryDate')"
          :value="
            cardInfo ? cardInfo.expiryDate : $t('debitCard.lblNotAvailable')
          "
        />
        <statement-list-item
          :description="$t('debitCard.lblIBAN')"
          :value="cardInfo ? cardInfo.iban : $t('debitCard.lblNotAvailable')"
        />
        <statement-list-item
          :description="$t('debitCard.lblBIC')"
          :value="cardInfo ? cardInfo.bic : $t('debitCard.lblNotAvailable')"
        />
      </statement-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { CardInfo } from '@/store/modules/debit-card/types';

import { SecondaryPage } from '@/components/layout';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageActive',
  components: {
    StatementList,
    StatementListItem,
    SecondaryPage,
    DebitCardImage
  },
  computed: {
    ...mapState('debitCard', {
      rawInfo: 'cardInfo'
    }),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
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
