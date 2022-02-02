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
          {{ $t('NFTs.txtNFTs.movingWithOlympus.pageDescriptionPartOne') }}
          <br /><br />
          {{ $t('NFTs.txtNFTs.movingWithOlympus.pageDescriptionPartTwo') }}
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="availableFromString"
          :title="$t('NFTs.lblAvailableFrom')"
        />
        <analytics-list-item
          :description="availableToString"
          :title="$t('NFTs.lblAvailableTo')"
        />
        <analytics-list-item
          :description="formatToDecimals(totalClaimed, 0)"
          :title="$t('NFTs.lblTotalClaimed')"
        />
      </analytics-list>

      <div class="actions">
        <div class="group default">
          <action-button
            class="primary"
            :text="$t('NFTs.btn.movingWithOlympus.get.txt')"
            @button-click="handleClaim"
          />
        </div>

        <div v-if="error !== undefined" class="group error-message">
          {{ error }}
        </div>
      </div>
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

import { ChangePayload } from '@/store/modules/nft/actions/claim';
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
      availableTo: 'OlympusEndTs',
      totalClaimed: 'OlympusTotalClaimed',
      availableFrom: 'OlympusStartTs'
    }),
    availableToString(): string {
      return dayjs.unix(this.availableTo).utc().format('MMMM DD, HH:mm UTC');
    },
    availableFromString(): string {
      return dayjs.unix(this.availableFrom).utc().format('MMMM DD, HH:mm UTC');
    }
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.error = undefined;
  },
  methods: {
    formatToDecimals,
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
        this.error = this.$t('NFTs.txtOhNo').toString();
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
