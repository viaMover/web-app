<template>
  <secondary-page
    class="powercard manage"
    has-back-button
    hide-info
    hide-title
    @back="handleBack"
  >
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
      <div v-if="actionError !== undefined" class="action-error-message">
        {{ actionError }}
      </div>
    </template>
    <loader-form v-else :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';

import {
  MAX_ACTIVE_TIME,
  MAX_COOLDOWN_TIME
} from '@/services/chain/treasury/powercard';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { unstakePowercardCompound } from '@/wallet/actions/treasury/powercard/unstake';
import { estimateUnstakePowercardCompound } from '@/wallet/actions/treasury/powercard/unstakeEstimate';

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
      actionError: undefined as string | undefined,
      transactionStep: undefined as LoaderStep | undefined,
      powercard: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: require('@/assets/images/Powercard@1x.png'),
        sources: [
          { src: require('@/assets/images/Powercard@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Powercard@2x.png')
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
      powercardCooldownTime: 'powercardCooldownTime'
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
          ((MAX_ACTIVE_TIME - this.powercardActiveTime) / MAX_ACTIVE_TIME) * 100
        );
      } else if (this.powercardCooldownTime > 0) {
        return Math.round(
          ((MAX_COOLDOWN_TIME - this.powercardCooldownTime) /
            MAX_COOLDOWN_TIME) *
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
      const resp = await estimateUnstakePowercardCompound(
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );

      if (resp.error) {
        Sentry.captureException("Can't estimate swap");
        this.actionError = this.$t('estimationError') as string;
        return;
      }

      this.transactionStep = 'Confirm';
      try {
        await unstakePowercardCompound(
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          resp.actionGasLimit,
          resp.approveGasLimit,
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
