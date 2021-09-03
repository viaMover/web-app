<template>
  <div>
    <shop-wrapper has-close-button @close="handleClose">
      <template v-slot:info>
        <h1 class="info__title">{{ $t('NFTs.lblMovingWithOlympus') }}</h1>
        <p class="info__description">
          {{ $t('NFTs.txtNFTs.movingWithOlympus.pageDescriptionPartOne') }}
          <br /><br />
          {{ $t('NFTs.txtNFTs.movingWithOlympus.pageDescriptionPartTwo') }}
        </p>
        <shop-list>
          <shop-list-item
            :title="$t('NFTs.lblAvailableFrom')"
            :value="availableFromString"
          />
          <shop-list-item
            :title="$t('NFTs.lblAvailableTo')"
            :value="availableToString"
          />
          <shop-list-item
            :title="$t('NFTs.lblTotalClaimed')"
            :value="totalClaimed"
          />
        </shop-list>
        <action-button
          button-class="button button-active"
          :text="$t('NFTs.btn.movingWithOlympus.get.txt')"
          @button-click="handleClaim"
        />
        <div v-if="error !== undefined" class="error-message">
          {{ error }}
        </div>
      </template>
      <template v-slot:illustration>
        <video
          autoplay="autoplay"
          class="moving-with-olympus"
          data-keepplaying="data-keepplaying"
          loop="loop"
          muted="muted"
          playsinline="playsinline"
          src="https://ipfs.io/ipfs/QmWVTix2PvDSx9yh4ybviaCHqnFyz77vK87YvrVV4vyjNv"
        />
      </template>
    </shop-wrapper>
    <simple-loader-modal
      v-if="transactionStep !== undefined"
      :loader-step="transactionStep"
      @close="transactionStep = undefined"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { ShopList, ShopListItem, ShopWrapper } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';
import dayjs from 'dayjs';
import SimpleLoaderModal from '@/components/modals/simple-loader-modal.vue';
import { Step } from '@/components/controls/form-loader';
import { ChangePayload } from '@/store/modules/nft/actions/claim';

export default Vue.extend({
  name: 'NftViewMovingWithOlympus',
  components: {
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper,
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
    ...mapActions('nft', [
      'claimOlympus',
      'checkOlympusClaimable',
      'refreshNftStats'
    ]),
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
        this.transactionStep = 'Success';
      } catch (err) {
        if (this.transactionStep === 'Process') {
          this.transactionStep = 'Reverted';
        } else {
          this.transactionStep = undefined;
          this.error = this.$t('NFTs.txtOhNoSomething').toString();
        }
      }
    }
  }
});
</script>
