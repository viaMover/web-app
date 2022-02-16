<template>
  <secondary-page class="manage active" hide-info>
    <template v-slot:title>
      <secondary-page-header
        :description="$t('debitCard.txtVisaDebitCard')"
        :title="$t('debitCard.lblBeautifulCard')"
      />
    </template>

    <debit-card-image :is-loading="isLoading" :skin="currentSkin" />

    <analytics-list>
      <analytics-list-item
        :description="last4Digits"
        :is-loading="isLoading"
        :title="$t('debitCard.lblLast4Digits')"
      />
      <analytics-list-item
        :description="expiryDate"
        :is-loading="isLoading"
        :title="$t('debitCard.lblExpiryDate')"
      />
      <analytics-list-item
        :description="iban"
        :is-loading="isLoading"
        :title="$t('debitCard.lblIBAN')"
      />
      <analytics-list-item
        :description="bic"
        :is-loading="isLoading"
        :title="$t('debitCard.lblBIC')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

import DebitCardImage from '../debit-card-image.vue';

export default Vue.extend({
  name: 'DebitCardManageActive',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsList,
    AnalyticsListItem,
    DebitCardImage
  },
  computed: {
    ...mapState('debitCard', {
      cardInfo: 'cardInfo',
      isLoading: 'isLoading'
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
