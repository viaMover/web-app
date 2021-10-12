<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
    @back="handleBack"
  >
    <treasury-decrease-form v-if="!isShowReview" @tx-review="handleTxReview" />
    <treasury-decrease-review
      v-else-if="txStep === undefined"
      :amount="amount"
      :estimated-gas-cost="estimatedGasCost"
      :native-amount="nativeAmount"
      :subsidized-enabled="subsidizedEnabled"
      :token="token"
      @tx-start="handleTxStart"
    />
    <full-page-form-loader v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { TransferData } from '@/services/0x/api';
import { sameAddress } from '@/utils/address';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import { Step } from '@/components/controls/full-page-form-loader';
import { FullPageFormLoader } from '@/components/controls/full-page-form-loader';
import { SecondaryPage } from '@/components/layout/secondary-page';
import {
  TreasuryDecreaseForm,
  TreasuryDecreaseReview
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryDecreaseWrapper',
  components: {
    TreasuryDecreaseReview,
    TreasuryDecreaseForm,
    FullPageFormLoader,
    SecondaryPage
  },
  data() {
    return {
      isShowReview: false as boolean,
      txStep: undefined as Step | undefined,

      token: undefined as TokenWithBalance | undefined,
      amount: undefined as string | undefined,
      nativeAmount: undefined as string | undefined,
      subsidizedEnabled: false as boolean,
      estimatedGasCost: undefined as string | undefined,
      transferData: undefined as TransferData | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', ['networkInfo', 'currentAddress', 'provider']),
    hasBackButton(): boolean {
      return this.txStep === undefined;
    },
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    isNeedTransfer(): boolean {
      if (this.token === undefined) {
        return true;
      }

      return !sameAddress(this.token.address, this.outputUSDCAsset.address);
    }
  },
  methods: {
    handleBack(): void {
      if (this.isShowReview) {
        this.isShowReview = !this.isShowReview;
      } else {
        this.$router.back();
      }
    },
    handleTxReview(args: {
      token: TokenWithBalance;
      amount: string;
      nativeAmount: string;
      subsidizedEnabled: boolean;
      estimatedGasCost: string;
      actionGasLimit: string;
      approveGasLimit: string;
      transferData?: TransferData;
    }): void {
      this.token = args.token;
      this.amount = args.amount;
      this.nativeAmount = args.nativeAmount;
      this.transferData = args.transferData;
      this.subsidizedEnabled = args.subsidizedEnabled;
      this.estimatedGasCost = args.estimatedGasCost;
      this.actionGasLimit = args.actionGasLimit;
      this.approveGasLimit = args.approveGasLimit;

      this.isShowReview = true;
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      //TODO
      this.txStep = 'Confirm';
    }
  }
});
</script>
