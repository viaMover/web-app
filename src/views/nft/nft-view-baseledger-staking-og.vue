<template>
  <content-wrapper-two-sided
    class="shop nft-drops view baseledger-staking-og"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">👨🐝☕️</h1>
        <div class="description">
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartOne`) }}
          <br /><br />
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartTwo`) }}
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="totalSupply"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblMaximumSupply')"
        />
        <analytics-list-item
          :description="$t(`lblFree`)"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblPrice')"
        />
      </analytics-list>

      <form
        class="form"
        :class="{ error: !!error }"
        @submit.prevent="handleClaim"
      >
        <div class="actions">
          <div class="group default">
            <action-button
              class="primary"
              :disabled="isStoreLoading"
              propagate-original-event
              type="submit"
            >
              {{ $t(`NFTs.btn.${nft.id}.get`) }}👨🐝☕️
            </action-button>
          </div>

          <div v-if="error !== undefined" class="group error-message">
            {{ error }}
          </div>
        </div>
      </form>
    </template>

    <template v-slot:right>
      <video
        autoplay="autoplay"
        class="baseledger-staking-og"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
      >
        <source
          src="https://storage.googleapis.com/movermedia/UNIbaseFin.mp4"
          type="video/mp4"
        />
        <source
          src="https://ipfs.io/ipfs/QmQ3Qf11pDKHSUfE9TZkj7fzDvYHFyCwioU48uQDcF5pEB"
          type="video/mp4"
        />
      </video>
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

import { getBaseledgerStakingOGSignature } from '@/services/chain';
import { ClaimPayload } from '@/store/modules/nft/types';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NftViewBaseledgerStakingOg',
  components: {
    ContentWrapperTwoSided,
    ActionButton,
    AnalyticsList,
    AnalyticsListItem,
    SimpleLoaderModal
  },
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      error: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('nft', {
      nft: 'baseledgerStakingOG',
      isStoreLoading: 'isLoading'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress'
    }),
    totalSupply(): string {
      return formatToDecimals(this.nft.meta.totalSupply, 0);
    }
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.error = undefined;
  },
  methods: {
    ...mapActions('nft', {
      claimBaseledgerStakingOG: 'claimBaseledgerStakingOG',
      refreshNftStats: 'fetchBaseledgerStakingOGData'
    }),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      let sig = '';
      try {
        sig = await getBaseledgerStakingOGSignature(this.currentAddress);
      } catch {
        this.error = this.$t('NFTs.txtOhNo') as string;
        return;
      }
      try {
        this.transactionStep = 'Confirm';
        await this.claimBaseledgerStakingOG({
          signature: sig,
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as ClaimPayload);
        await this.refreshNftStats();
        this.transactionStep = 'Success';
      } catch (err) {
        this.transactionStep = 'Reverted';
      }
    }
  }
});
</script>
