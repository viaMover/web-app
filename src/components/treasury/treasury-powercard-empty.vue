<template>
  <secondary-page
    class="powercard empty"
    hide-info
    hide-title
    @back="handleBack"
  >
    <template v-if="txStep === undefined">
      <secondary-page-header
        class="max-width"
        :description="$t('treasury.powercard.txtThePowercardPageDescription')"
        :title="$t('treasury.powercard.lblThePowercard')"
      />

      <custom-picture
        :alt="powercard.alt"
        class="picture powercard"
        :sources="powercard.sources"
        :src="powercard.src"
        :webp-sources="powercard.webpSources"
      />

      <div class="action description">
        {{ $t('treasury.powercard.lblIfYouActivateCard') }}
      </div>

      <product-info-wrapper>
        <product-info-item
          :description="$t('treasury.powercard.lblAdditionalBoost')"
          :title="additionalBoost"
        />
        <product-info-item
          :description="$t('treasury.powercard.lblActive')"
          :title="activeTime"
        />
        <product-info-item
          :description="$t('treasury.powercard.lblCooldown')"
          :title="cooldownTime"
        />
      </product-info-wrapper>

      <div class="actions">
        <action-button
          class="button primary"
          :disabled="!stakeAvailable"
          :text="$t('treasury.powercard.btnActivateThePowercard')"
          @button-click="handleActivateCard"
        />
        <div v-if="actionError !== undefined" class="action-error-message">
          {{ actionError }}
        </div>
      </div>
    </template>
    <loader-form v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { greaterThan } from '@/utils/bigmath';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { stakePowercardCompound } from '@/wallet/actions/treasury/powercard/stake';
import { estimateStakePowercardCompound } from '@/wallet/actions/treasury/powercard/stakeEstimate';

import { ActionButton } from '@/components/buttons';
import { LoaderForm, LoaderStep } from '@/components/forms';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'TreasuryPowercardEmpty',
  components: {
    ProductInfoItem,
    ProductInfoWrapper,
    CustomPicture,
    ActionButton,
    SecondaryPageHeader,
    SecondaryPage,
    LoaderForm
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      txStep: undefined as LoaderStep | undefined,
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
      return greaterThan(this.powercardBalance, '0');
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
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
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
          async () => {
            this.txStep = 'Process';
          }
        );
        this.txStep = 'Success';
        this.updateWalletAfterTxn();
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
