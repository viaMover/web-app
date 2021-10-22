<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <template v-if="txStep === undefined">
      <div>
        <secondary-page-simple-title
          class="page-title max-width"
          :description="$t('treasury.powercard.txtThePowercardPageDescription')"
          :title="$t('treasury.powercard.lblThePowercard')"
        />
        <custom-picture
          :alt="powercard.alt"
          class="margin-top-80"
          :sources="powercard.sources"
          :src="powercard.src"
          :webp-sources="powercard.webpSources"
        />
        <p class="margin-top-40 medium gray">
          {{ $t('treasury.powercard.lblIfYouActivateCard') }}
        </p>
      </div>
      <div class="treasury__menu-wrapper-body margin-top-20">
        <div class="line">
          <div>
            <span class="title">{{ additionalBoost }}</span>
            <p class="description black">
              {{ $t('treasury.powercard.lblAdditionalBoost') }}
            </p>
          </div>
          <div>
            <span class="title">{{ activeTime }}</span>
            <p class="description black">
              {{ $t('treasury.powercard.lblActive') }}
            </p>
          </div>
          <div>
            <span class="title">{{ cooldownTime }}</span>
            <p class="description black">
              {{ $t('treasury.powercard.lblCooldown') }}
            </p>
          </div>
        </div>
        <action-button
          button-class="button button-active black-link"
          :disabled="!stakeAvailable"
          :text="$t('treasury.powercard.btnActivateThePowercard')"
          @button-click="handleActivateCard"
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

import { greaterThan } from '@/utils/bigmath';
import { stakePowercardCompound } from '@/wallet/actions/treasury/powercard/stake';
import { estimateStakePowercardCompound } from '@/wallet/actions/treasury/powercard/stakeEstimate';

import { ActionButton } from '@/components/buttons';
import { FullPageFormLoader } from '@/components/controls/full-page-form-loader';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';

import { Step } from '../controls/form-loader';

export default Vue.extend({
  name: 'TreasuryPowercardEmpty',
  components: {
    CustomPicture,
    ActionButton,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    FullPageFormLoader
  },
  data() {
    return {
      txStep: undefined as Step | undefined,
      actionError: undefined as string | undefined,
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
      currentAddress: 'currentAddress'
    }),
    stakeAvailable(): boolean {
      return (
        greaterThan(this.powercardBalance, '0') &&
        this.powercardState === 'NotStaked'
      );
    },
    additionalBoost(): string {
      return `2x`;
    },
    cooldownTime(): string {
      return this.$t('treasury.lblRemainingDays', { days: 60 }) as string;
    },
    activeTime(): string {
      return this.$t('treasury.lblRemainingDays', { days: 30 }) as string;
    }
  },
  methods: {
    async handleActivateCard(): Promise<void> {
      const resp = await estimateStakePowercardCompound(
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
        await stakePowercardCompound(
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
    },
    handleBack(): void {
      this.$router.replace({
        name: 'treasury-manage'
      });
    }
  }
});
</script>
