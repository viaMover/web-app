<template>
  <content-wrapper-two-sided
    class="shop nft-drops view moving-with-olympus"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblMovingWithOlympus') }}</h1>
        <div class="description">
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartOne`) }}
          <br /><br />
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartTwo`) }}
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="availableFrom"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblAvailableFrom')"
        />
        <analytics-list-item
          :description="availableTo"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblAvailableTo')"
        />
        <analytics-list-item
          :description="totalClaimed"
          :is-loading="isStoreLoading"
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
              :disabled="isStoreLoading"
              propagate-original-event
              :text="$t(`NFTs.btn.${nft.id}.get`)"
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
        class="moving-with-olympus"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
      >
        <source
          src="https://storage.googleapis.com/movermedia/OL_MOV_FIN.mp4"
          type="video/mp4"
        />
        <source
          src="https://ipfs.io/ipfs/QmWVTix2PvDSx9yh4ybviaCHqnFyz77vK87YvrVV4vyjNv"
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

import dayjs from 'dayjs';

import { ChangePayload } from '@/store/modules/nft/types';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NftViewMovingWithOlympus',
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
      nft: 'movingWithOlympus',
      isStoreLoading: 'isLoading'
    }),
    availableTo(): string {
      return dayjs.unix(this.nft.meta.endTs).utc().format('MMMM DD, HH:mm UTC');
    },
    availableFrom(): string {
      return dayjs
        .unix(this.nft.meta.startTs)
        .utc()
        .format('MMMM DD, HH:mm UTC');
    },
    totalClaimed(): string {
      return formatToDecimals(this.nft.meta.totalClaimed, 0);
    }
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.error = undefined;
  },
  methods: {
    ...mapActions('nft', [
      'claimOlympus',
      'checkOlympusClaimable',
      'refreshNftStats'
    ]),
    ...mapActions('account', {
      loadAvatar: 'loadAvatar'
    }),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      if (!(await this.checkOlympusClaimable())) {
        this.error = this.$t('NFTs.txtOhNo') as string;
        return;
      }

      try {
        this.transactionStep = 'Confirm';
        await this.claimOlympus({
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as ChangePayload);
        await this.refreshNftStats();
        await this.loadAvatar();
        this.transactionStep = 'Success';
      } catch (err) {
        this.transactionStep = 'Reverted';
      }
    }
  }
});
</script>
