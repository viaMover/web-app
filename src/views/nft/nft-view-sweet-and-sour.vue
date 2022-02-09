<template>
  <content-wrapper-two-sided
    class="shop nft-drops view sweet-and-sour"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblSweetAndSour') }}</h1>
        <p class="description">
          {{ $t('NFTs.txtNFTs.sweetAndSour.pageDescriptionPartOne') }}
          <br /><br />
          {{ $t('NFTs.txtNFTs.sweetAndSour.pageDescriptionPartTwo') }}
        </p>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="formatToDecimals(totalAmount, 0)"
          :title="$t('NFTs.lblTotalAmount')"
        />
        <analytics-list-item
          :description="formatToDecimals(totalClaimed, 0)"
          :title="$t('NFTs.lblTotalClaimed')"
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
              propagate-original-event
              :text="$t('NFTs.btn.sweetAndSour.get.txt')"
              type="submit"
            />
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
        class="sweet-and-sour"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
      >
        <source
          src="https://storage.googleapis.com/movermedia/SweetAndSour.webm"
          type="video/webm"
        />
        <source
          src="https://storage.googleapis.com/movermedia/SAS.mp4"
          type="video/mp4"
        />
        <source
          src="https://ipfs.io/ipfs/QmZE2K69rBaBze3Kb6UTPyr7wXr2spJ6V1mCxc6HvqEfbA/SAS.mp4"
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

import { getSweetAndSourClaimSignature } from '@/services/chain';
import { ClaimPayload } from '@/store/modules/nft/types';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NftViewSweetAndSour',
  components: {
    AnalyticsListItem,
    AnalyticsList,
    ContentWrapperTwoSided,
    ActionButton,
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
      totalAmount: 'SweetAndSourTotalAmount',
      totalClaimed: 'SweetAndSourTotalClaimed'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress'
    })
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.error = undefined;
  },
  methods: {
    formatToDecimals,
    ...mapActions('nft', ['claimSweetAndSour', 'refreshNftStats']),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      let sig = '';
      try {
        sig = await getSweetAndSourClaimSignature(this.currentAddress);
      } catch {
        this.error = this.$t('NFTs.txtOhNo').toString();
        return;
      }
      try {
        this.transactionStep = 'Confirm';
        await this.claimSweetAndSour({
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
