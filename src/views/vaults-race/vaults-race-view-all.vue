<template>
  <secondary-page hide-title>
    <secondary-page-simple-title
      class="vaults-race_secondary_page-title"
      :description="$t('vaultsRace.lblWeeklyChallengeDescription')"
      :title="$t('vaultsRace.lblWeeklyChallenge')"
    />
    <account-list
      icon="💼"
      :items="vaultsRaceAccounts"
      @button-click="handleButton"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { VaultRaceAccount } from '@/store/modules/games/types';

import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import { AccountList } from '@/components/vaults-race/account-list';

export default Vue.extend({
  name: 'VaultsRaceViewAll',
  components: {
    AccountList,
    SecondaryPageSimpleTitle,
    SecondaryPage
  },
  data() {
    return {
      selectedRace: undefined as VaultRaceAccount | undefined
    };
  },
  computed: {
    ...mapState('games', ['vaultsRaceAccounts'])
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    },
    handleButton(item: VaultRaceAccount): void {
      this.$router.push({
        name: 'vaults-race-view',
        params: { address: item.address }
      });
    }
  }
});
</script>
