<template>
  <secondary-page
    class="analytics"
    has-back-button
    hide-info
    @back="handleBack"
  >
    <template v-slot:title>
      <secondary-page-header
        :description="
          $t('vaultsRace.statistics.txtGlobalStatisticsDescription')
        "
        :title="$t('vaultsRace.statistics.lblGlobalLeaderboard')"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="challengeDates"
        :title="$t('vaultsRace.statistics.lblThisWeekChallengeDates')"
      />
      <analytics-list-item
        :description="totalVaults"
        :title="$t('vaultsRace.statistics.lblTotalParticipantingVaults')"
      />
      <analytics-list-item
        :description="weekPrize"
        :title="$t('vaultsRace.statistics.lblThisWeekPrize')"
      />
      <analytics-list-item
        :description="daysRemain"
        :title="$t('vaultsRace.statistics.lblDaysRemainingInTheWeek')"
      />
    </analytics-list>

    <analytics-list :title="$t('vaultsRace.statistics.lblLeadingVault')">
      <div>
        <div class="item__info">
          <div class="item__info-icon">
            <span>💼</span>
          </div>
          <progress-loader
            class="progress-loader"
            :is-animated="true"
            :value="100"
          />
          <div class="item__info-label">
            <p>{{ leaderAccountTitle }}</p>
            <span>{{ leaderAccountDescription }}</span>
          </div>
        </div>
      </div>
      <analytics-list-item
        :description="account ? account.position : ''"
        :title="$t('vaultsRace.statistics.lblPositionInTheRace')"
      />
      <analytics-list-item
        :description="account ? account.score : ''"
        :title="$t('vaultsRace.statistics.lblTotalPointsScored')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ProgressLoader } from '@/components/layout';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';

export default Vue.extend({
  name: 'VaultsRaceStatistics',
  components: {
    ProgressLoader,
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsListItem,
    AnalyticsList
  },
  computed: {
    ...mapGetters('games', { account: 'leaderVaultsRaceAccount' }),
    leaderAccountTitle(): string {
      return this.account ? `Account ${this.account.address}` : '';
    },
    leaderAccountDescription(): string {
      return this.account ? `${this.account.points} Points` : '';
    },
    challengeDates(): string {
      return '01 September - 08 September';
    },
    totalVaults(): string {
      return '4,859';
    },
    weekPrize(): string {
      return '$1,390.09';
    },
    daysRemain(): string {
      return '5';
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
