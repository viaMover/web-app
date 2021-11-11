<template>
  <secondary-page
    :has-back-button="showBackButton"
    hide-title
    @back="handleBack"
  >
    <prepare-form
      v-if="currentStep === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="$t('earnings.olympus.txtStakeDescription')"
      :header-title="$t('earnings.olympus.lblStake')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('earnings.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('earnings.olympus.txtPotentialEarnings')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="$t('earnings.lblAmountWeDepositIn')"
      :selected-token-description="inputAssetDescription"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleReviewTx"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="currentStep === 'review'"
      :amount="inputAmount"
      :button-text="reviewActionButtonText"
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('earnings.lblReviewYourStake')"
      :image="olympus"
      :input-amount-native-title="$t('earnings.lblAndTotalOf')"
      :input-amount-title="$t('earnings.lblAmountWeDepositIn')"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="inputAmountNative"
      :token="inputAsset"
      @tx-start="handleCreateTx"
    />
    <loader-form v-else-if="currentStep === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import LoaderForm from '@/components/forms/loader-form/loader-form.vue';
import PrepareForm from '@/components/forms/prepare-form/prepare-form.vue';
import ReviewForm from '@/components/forms/review-form.vue';
import SecondaryPage from '@/components/layout/secondary-page/secondary-page.vue';

type processStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'EarningsEthereumStake',
  components: { PrepareForm, ReviewForm, SecondaryPage, LoaderForm },
  props: {
    currentStep: {
      type: String as PropType<processStep>,
      default: 'prepare'
    }
  }
});
</script>
