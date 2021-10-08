<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <secondary-page-simple-title
      class="page-title"
      :description="$t('vaultsRace.statistics.txtGlobalStatisticsDescription')"
      :title="$t('vaultsRace.statistics.lblGlobalLeaderboard')"
    />
    <statement-list>
      <statement-list-item
        :description="$t('vaultsRace.statistics.lblThisWeekChallengeDates')"
        :value="challengeDates"
      />
      <statement-list-item
        :description="$t('vaultsRace.statistics.lblTotalParticipantingVaults')"
        :value="totalVaults"
      />
      <statement-list-item
        :description="$t('vaultsRace.statistics.lblThisWeekPrize')"
        :value="weekPrize"
      />
      <statement-list-item
        :description="$t('vaultsRace.statistics.lblDaysRemainingInTheWeek')"
        :value="daysRemain"
      />
    </statement-list>
    <statement-list :title="$t('vaultsRace.statistics.lblLeadingVault')">
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
      <statement-list-item
        :description="$t('vaultsRace.statistics.lblPositionInTheRace')"
        :value="account ? account.position : ''"
      />
      <statement-list-item
        :description="$t('vaultsRace.statistics.lblTotalPointsScored')"
        :value="account ? account.score : ''"
      />
    </statement-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import ProgressLoader from '@/components/statements/progress-loader.vue';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'VaultsRaceStatistics',
  components: {
    ProgressLoader,
    SecondaryPage,
    SecondaryPageSimpleTitle,
    StatementListItem,
    StatementList
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
