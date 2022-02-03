<template>
  <secondary-page class="manage pending">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('debitCard.txtBeautifulCard')"
        :title="$t('debitCard.lblBeautifulCard')"
      />
    </template>

    <debit-card-history-group
      v-for="group in actionHistory"
      :key="group.timestamp"
      :date="formatDate(group.timestamp)"
      :items="group.events"
    />

    <i18n
      v-if="showKycLinkContainer"
      class="kyc-link"
      path="debitCard.kycLink.description"
      tag="div"
    >
      <a
        class="link underline medium"
        :href="kycLink"
        rel="external nofollow"
        target="_blank"
        v-text="$t('debitCard.kycLink.link')"
      />
    </i18n>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { EventHistoryItemMinimal } from '@/store/modules/debit-card/types';

import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

import DebitCardHistoryGroup from '../debit-card-history/debit-card-history-group.vue';

export default Vue.extend({
  name: 'DebitCardManagePending',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    DebitCardHistoryGroup
  },
  computed: {
    ...mapState('debitCard', {
      kycLink: 'kycLink',
      eventHistory: 'eventHistory'
    }),
    ...mapGetters('debitCard', {
      actionHistory: 'actionHistoryGroupedByDay'
    }),
    showKycLinkContainer(): boolean {
      if (this.eventHistory.length === 0) {
        return false;
      }

      const lastEvent = (this.eventHistory as Array<EventHistoryItemMinimal>)
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[
        this.eventHistory.length - 1
      ];
      return lastEvent.type === 'kyc_process_started';
    }
  },
  methods: {
    formatDate(timestamp: number): string {
      const date = dayjs.unix(timestamp);

      if (dayjs().diff(date, 'days') <= 1) {
        return date.calendar(undefined, {
          sameDay: this.$t('dates.sameDay'),
          lastDay: this.$t('dates.lastDay')
        });
      }
      return date.format('MMMM DD');
    }
  }
});
</script>
