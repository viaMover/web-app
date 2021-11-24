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
          :value="expiryDate"
        />
        <statement-list-item
          :description="$t('debitCard.lblIBAN')"
          :value="iban"
        />
        <statement-list-item
          :description="$t('debitCard.lblBIC')"
          :value="bic"
        />
      </statement-list>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

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
      cardInfo: 'cardInfo'
    }),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    }),
    last4Digits(): string {
      if (this.cardInfo === undefined) {
        return this.$t('debitCard.lblNotAvailable') as string;
      }

      return this.cardInfo.last4Digits;
    },
    expiryDate(): string {
      if (this.cardInfo === undefined) {
        return this.$t('debitCard.lblNotAvailable') as string;
      }

      return this.cardInfo.expiryDate;
    },
    iban(): string {
      if (this.cardInfo === undefined) {
        return this.$t('debitCard.lblNotAvailable') as string;
      }

      return this.cardInfo.iban;
    },
    bic(): string {
      if (this.cardInfo === undefined) {
        return this.$t('debitCard.lblNotAvailable') as string;
      }

      return this.cardInfo.bic;
    }
  }
});
</script>
