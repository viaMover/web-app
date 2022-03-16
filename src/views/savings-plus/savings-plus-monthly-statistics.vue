<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header :description="pageSubtitle" :title="pageTitle" />
    </template>

    <savings-plus-monthly-statistics :page-date="pageDate" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import dayjs from 'dayjs';

import { dateFromExplicitPair } from '@/utils/time';

import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'SavingsPlusMonthlyStatistics',
  components: {
    SecondaryPageHeader,
    SecondaryPage
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    pageDate(): dayjs.Dayjs {
      try {
        return dateFromExplicitPair(
          Number(this.$route.params.year),
          Number(this.$route.params.month)
        );
      } catch {
        return dayjs().startOf('month');
      }
    },
    pageTitle(): string {
      return this.pageDate.format('MMMM YYYY');
    },
    pageSubtitle(): string {
      const left = this.pageDate.format('MMM DD');
      const right = this.pageDate.endOf('month').format('MMM DD, YYYY');

      return `${left} - ${right}`;
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
