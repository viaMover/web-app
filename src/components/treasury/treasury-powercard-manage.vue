<template>
  <secondary-page class="powercard manage" has-back-button @back="handleBack">
    <template v-if="transactionStep === undefined">
      <secondary-page-header
        class="max-width"
        :description="$t('treasury.powercard.txtThePowercardPageDescription')"
        :title="$t('treasury.powercard.lblThePowercard')"
      />

      <analytics-list>
        <analytics-list-progress-item
          :description="status"
          :image="powercard"
          :progress="powercardProgress"
          :title="$t('treasury.powercard.lblThePowercard')"
        />
        <analytics-list-item
          :description="status"
          :title="$t('treasury.powercard.lblPowercardStatus')"
        />
        <analytics-list-item
          :description="remainingTime"
          :title="$t('treasury.powercard.lblRemainingTime')"
        />
      </analytics-list>

      <action-button
        class="primary"
        :disabled="!unstakeAvailable"
        :text="$t('treasury.powercard.btnRemoveThePowercard')"
        @button-click="handleRemoveCard"
      />
    </template>
    <loader-form v-else :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { SmartTreasuryOnChainService } from '@/services/v2/on-chain/mover/smart-treasury';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';

import {
  AnalyticsList,
  AnalyticsListItem,
  AnalyticsListProgressItem
} from '@/components/analytics-list';
import ActionButton from '@/components/buttons/action-button.vue';
import { LoaderForm, LoaderStep } from '@/components/forms';
import { PictureDescriptor } from '@/components/html5';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';

export default Vue.extend({
  name: 'TreasuryPowercardManage',
  components: {
    AnalyticsListProgressItem,
    AnalyticsListItem,
    AnalyticsList,
    ActionButton,
    SecondaryPageHeader,
    SecondaryPage,
    LoaderForm
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      transactionStep: undefined as LoaderStep | undefined,
      powercard: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/Powercard@1x.png',
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/Powercard@1x.png'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/Powercard@2x.png'
          }
        ],
        webpSources: []
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('treasury', {
      powercardBalance: 'powercardBalance',
      powercardState: 'powercardState',
      powercardActiveTime: 'powercardActiveTime',
      powercardCooldownTime: 'powercardCooldownTime',
      smartTreasuryOnChainService: 'onChainService'
    }),
    ...mapState('account', {
      networkInfo: 'networkInfo',
      provider: 'provider',
      currentAddress: 'currentAddress'
    }),
    unstakeAvailable(): boolean {
      return this.powercardState === 'NotStakedCooldown';
    },
    status(): string {
      if (this.powercardState === 'Staked') {
        return 'Active';
      } else {
        return 'Cooldown';
      }
    },
    powercardProgress(): number {
      if (this.powercardActiveTime > 0) {
        return Math.round(
          ((SmartTreasuryOnChainService.PowercardMaxActiveTimeSeconds -
            this.powercardActiveTime) /
            SmartTreasuryOnChainService.PowercardMaxActiveTimeSeconds) *
            100
        );
      } else if (this.powercardCooldownTime > 0) {
        return Math.round(
          ((SmartTreasuryOnChainService.PowercardMaxCooldownTimeSeconds -
            this.powercardCooldownTime) /
            SmartTreasuryOnChainService.PowercardMaxCooldownTimeSeconds) *
            100
        );
      } else {
        return 0;
      }
    },
    remainingTime(): string {
      let days = 0;
      if (this.powercardActiveTime > 0) {
        days = dayjs.duration(this.powercardActiveTime, 'seconds').asDays();
      } else {
        days = dayjs.duration(this.powercardCooldownTime, 'seconds').asDays();
      }
      days = Math.round(days);
      return this.$t('treasury.lblRemainingDays', { days }) as string;
    }
  },
  methods: {
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
    handleBack(): void {
      this.$router.replace({
        name: 'treasury-manage'
      });
    },
    async handleRemoveCard(): Promise<void> {
      let estimation;
      try {
        estimation = await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).estimateUnstakePowercardCompound();
      } catch (error) {
        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        console.error('Failed to estimate powercard unstake', error);
        Sentry.captureException(error);
        return;
      }

      this.transactionStep = 'Confirm';
      try {
        await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).unstakePowercardCompound(
          estimation.actionGasLimit,
          estimation.approveGasLimit,
          async () => {
            this.transactionStep = 'Process';
          }
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (err) {
        this.transactionStep = 'Reverted';
        Sentry.captureException(err);
      }
    }
  }
});
</script>
