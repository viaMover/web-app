<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <template v-if="txStep === undefined">
      <div>
        <secondary-page-simple-title
          class="page-title max-width"
          :description="$t('treasury.powercard.txtThePowercardPageDescription')"
          :title="$t('treasury.powercard.lblThePowercard')"
        />
      </div>
      <div class="treasury__menu-wrapper-body margin-top-80">
        <div class="token__item">
          <div class="item__info">
            <progress-loader class="loading" :value="powercardProgress" />
            <div class="item__info-icon">
              <custom-picture
                :alt="powercard.alt"
                :sources="powercard.sources"
                :src="powercard.src"
                :webp-sources="powercard.webpSources"
              />
            </div>
            <div class="item__info-label">
              <p>{{ $t('treasury.powercard.lblThePowercard') }}</p>
              <span>{{ status }}</span>
            </div>
          </div>
        </div>
        <div class="treasury-powercard-list">
          <div class="item">
            <h2>{{ $t('treasury.powercard.lblPowercardStatus') }}</h2>
            <span>
              {{ status }}
            </span>
          </div>
          <div class="item">
            <h2>{{ $t('treasury.powercard.lblRemainingTime') }}</h2>
            <span>
              {{ remainingTime }}
            </span>
          </div>
        </div>
        <action-button
          button-class="button button-active"
          :disabled="!unstakeAvailable"
          :text="$t('treasury.powercard.btnRemoveThePowercard')"
          @button-click="handleRemoveCard"
        />
        <div v-if="actionError !== undefined" class="action-error-message">
          {{ actionError }}
        </div>
      </div>
    </template>
    <full-page-form-loader v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import dayjs from 'dayjs';

import {
  MAX_ACTIVE_TIME,
  MAX_COOLDOWN_TIME
} from '@/services/chain/treasury/powercard';
import { greaterThan } from '@/utils/bigmath';
import { unstakePowercardCompound } from '@/wallet/actions/treasury/powercard/unstake';
import { estimateUnstakePowercardCompound } from '@/wallet/actions/treasury/powercard/unstakeEstimate';

import ActionButton from '@/components/buttons/action-button.vue';
import { FullPageFormLoader } from '@/components/controls/full-page-form-loader';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import { ProgressLoader } from '@/components/layout';
import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';

import { Step } from '../controls/form-loader';

export default Vue.extend({
  name: 'TreasuryPowercardManage',
  components: {
    CustomPicture,
    ActionButton,
    ProgressLoader,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    FullPageFormLoader
  },
  data() {
    return {
      actionError: undefined as string | undefined,
      txStep: undefined as Step | undefined,
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
    ...mapState('account', {
      powercardBalance: 'powercardBalance',
      powercardState: 'powercardState',
      networkInfo: 'networkInfo',
      provider: 'provider',
      currentAddress: 'currentAddress',
      powercardActiveTime: 'powercardActiveTime',
      powercardCooldownTime: 'powercardCooldownTime'
    }),
    unstakeAvailable(): boolean {
      return (
        greaterThan(this.powercardBalance, '0') &&
        this.powercardState === 'NotStakedCooldown'
      );
    },
    status(): string {
      if (this.powercardState === 'Stacked') {
        return 'Active';
      } else {
        return 'Cooldown';
      }
    },
    powercardProgress(): number {
      if (this.powercardActiveTime > 0) {
        return Math.round((this.powercardActiveTime / MAX_ACTIVE_TIME) * 100);
      } else if (this.powercardCooldownTime > 0) {
        return Math.round(
          (MAX_COOLDOWN_TIME / this.powercardCooldownTime) * 100
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

      this.txStep = 'Confirm';
      try {
        await unstakePowercardCompound(
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          resp.actionGasLimit,
          resp.approveGasLimit,
          async (step: Step) => {
            this.txStep = step;
          }
        );
        this.txStep = 'Success';
      } catch (err) {
        this.txStep = 'Reverted';
        Sentry.captureException(err);
      }
    }
  }
});
</script>
