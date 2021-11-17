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
          :value="
            cardInfo ? cardInfo.last4Digits : $t('debitCard.lblNotAvailable')
          "
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
    })
  }
});
</script>
