<template>
  <content-wrapper-two-sided
    class="shop nft-drops view baseledger-staking-og"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblBaseledgerStakingOG') }}</h1>
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
          :description="'Free'"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblPrice')"
        />
      </analytics-list>

      <form
        class="form"
        :class="{ error: !!actionError || !!getNftError }"
        @submit.prevent="handleClaim"
      >
        <div class="actions">
          <div class="group default">
            <action-button
              class="primary"
              :disabled="isStoreLoading"
              propagate-original-event
              :text="$t(`NFTs.btn.${nft.id}.get`)"
              type="submit"
            />
          </div>

          <div v-if="getNftError !== undefined" class="group error-message">
            {{ getNftError }}
          </div>

          <div v-if="actionError !== undefined" class="group error-message">
            {{ actionError }}
          </div>
        </div>
      </form>
    </template>

    <template v-slot:right>
      <video
        autoplay="autoplay"
        class="unexpected-move"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
      >
        <source
          src="https://storage.googleapis.com/movermedia/UNIbaseFin.mp4"
          type="video/mp4"
        />
        <source src="https://ipfs.io/ipfs/TODO:" type="video/mp4" />
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

import { ChangePayload } from '@/store/modules/nft/types';
import { formatToDecimals } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';

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
  mixins: [GasListenerMixin],
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      getNftError: undefined as string | undefined,
      actionError: undefined as string | undefined
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
    this.getNftError = undefined;
    this.actionError = undefined;
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
      try {
        this.transactionStep = 'Confirm';
        await this.claimBaseledgerStakingOG({
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as ChangePayload);
        await this.refreshNftStats();
        this.transactionStep = 'Success';
      } catch (err) {
        this.transactionStep = 'Reverted';
      }
    }
  }
});
</script>
