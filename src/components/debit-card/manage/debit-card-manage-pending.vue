<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description black">{{ $t('debitCard.txtBeautifulCard') }}</p>

    <div class="content">
      <div class="container history">
        <debit-card-history-group
          v-for="group in actionHistory"
          :key="group.timestamp"
          :date="formatDate(group.timestamp)"
          :items="group.events"
        />
      </div>

      <div
        v-if="showKycLinkContainer"
        ref="linkContainer"
        class="container margin-top-40 kyc-link"
      >
        <i18n class="description" path="debitCard.kycLink.description" tag="p">
          <a
            class="link"
            :href="kycLink"
            target="_blank"
            v-text="$t('debitCard.kycLink.link')"
          />
        </i18n>
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { EventHistoryItemMinimal } from '@/store/modules/debit-card/types';

import { SecondaryPage } from '@/components/layout';

import DebitCardHistoryGroup from '../debit-card-history/debit-card-history-group.vue';

export default Vue.extend({
  name: 'DebitCardManagePending',
  components: {
    SecondaryPage,
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
      if (lastEvent.type === 'kyc_process_started') {
        return true;
      }

      return false;
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
