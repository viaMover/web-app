<template>
  <content-wrapper-two-sided
    class="shop nft-drops view vaults"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblVaults') }}</h1>
        <p class="description">
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartOne`) }}
          <br /><br />
          <i18n path="NFTs.txtNFTs.vaults.pageDescriptionPartTwo">
            <a
              class="link"
              href="https://viamover.com/faq/vaults"
              rel="external help"
              target="_blank"
            >
              {{ $t(`NFTs.txtNFTs.${nft.id}.faq`) }}
            </a>
          </i18n>
        </p>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="totalAmount"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblTotalAmount')"
        />
        <analytics-list-item
          :description="totalClaimed"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblTotalClaimed')"
        />
      </analytics-list>

      <form
        class="form"
        :class="{ error: !!getNftError }"
        @submit.prevent="handleClaim"
      >
        <div class="actions">
          <div class="group default">
            <action-button
              class="primary"
              :disabled="isStoreLoading"
              :text="$t(`NFTs.btn.${nft.id}.get`)"
              @button-click="handleClaim"
            />
          </div>

          <div v-if="getNftError !== undefined" class="group error-message">
            {{ getNftError }}
          </div>
        </div>
      </form>
    </template>

    <template v-slot:right>
      <video
        autoplay="autoplay"
        class="vaults"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        src="@/assets/videos/vaults.webm"
      />
    </template>

    <template v-slot:modals>
      <simple-loader-modal
        v-if="transactionStep !== undefined"
        :loader-step="transactionStep"
        @close="transactionStep = undefined"
      />
    </template>
  </content-wrapper-two-sided>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { ChangePayload } from '@/store/modules/nft/types';
import { formatToDecimals } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NftViewVaults',
  components: {
    ContentWrapperTwoSided,
    AnalyticsList,
    AnalyticsListItem,
    ActionButton,
    SimpleLoaderModal
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      getNftError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('nft', {
      nft: 'vaults',
      isStoreLoading: 'isLoading'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress'
    }),
    totalAmount(): string {
      return formatToDecimals(this.nft.meta.totalAmount, 0);
    },
    totalClaimed(): string {
      return formatToDecimals(this.nft.meta.totalClaimed, 0);
    }
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.getNftError = undefined;
  },
  methods: {
    formatToDecimals,
    ...mapActions('nft', {
      claimVaults: 'claimVaults',
      refreshNftStats: 'fetchVaultsData'
    }),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      try {
        this.transactionStep = 'Confirm';
        await this.claimVaults({
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as ChangePayload);
        await this.refreshNftStats();
        this.transactionStep = 'Success';
      } catch (err) {
        if (this.transactionStep === 'Process') {
          this.transactionStep = 'Reverted';
        } else {
          this.transactionStep = undefined;
          this.getNftError = this.$t('NFTs.txtOhNoSomething').toString();
        }
      }
    }
  }
});
</script>
