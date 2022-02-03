<template>
  <content-wrapper-two-sided
    class="shop vaults-race"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('vaultsRace.lblRollDice') }}</h1>
        <p class="description">
          {{ $t('vaultsRace.txtPageDescriptionPartOne') }}
        </p>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="item ? item.address : ''"
          :title="$t('vaultsRace.lblAccountNumber')"
        />
        <analytics-list-item
          :description="item ? item.score : ''"
          :title="$t('vaultsRace.lblCurrentScore')"
        />
        <analytics-list-item
          description="view"
          :title="$t('vaultsRace.lblOpenSeaCollection')"
        />
      </analytics-list>

      <div class="actions">
        <div class="group default">
          <action-button
            class="primary"
            :text="$t('vaultsRace.btn.rollDice')"
            @button-click="handleRoll"
          />
        </div>

        <div v-if="error !== undefined" class="group error-message">
          {{ error }}
        </div>
      </div>
    </template>
    <template v-slot:right>
      <video
        autoplay="autoplay"
        class="moving-with-olympus"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
      >
        <source
          src="https://storage.googleapis.com/movermedia/OL_MOV_FIN.mp4"
          type="video/mp4"
        />
      </video>
    </template>
  </content-wrapper-two-sided>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { VaultRaceAccount } from '@/store/modules/games/types';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import ActionButton from '@/components/buttons/action-button.vue';
import ContentWrapperTwoSided from '@/components/layout/content-wrapper-two-sided.vue';

export default Vue.extend({
  name: 'VaultsRaceView',
  components: {
    ContentWrapperTwoSided,
    ActionButton,
    AnalyticsList,
    AnalyticsListItem
  },
  data() {
    return {
      error: undefined as string | undefined
    };
  },
  computed: {
    ...mapGetters('games', ['vaultsRaceAccount']),
    item(): VaultRaceAccount {
      return this.vaultsRaceAccount(this.$route.params.address);
    }
  },
  methods: {
    handleRoll(): void {
      //TODO
    },
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
