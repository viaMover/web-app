<template>
  <div>
    <shop-wrapper has-close-button @close="handleClose">
      <template v-slot:info>
        <h1 class="info__title">{{ $t('NFTs.lblSweetAndSour') }}</h1>
        <p class="info__description">
          {{ $t('NFTs.txtNFTs.sweetAndSour.pageDescriptionPartOne') }}
          <br /><br />
          {{ $t('NFTs.txtNFTs.sweetAndSour.pageDescriptionPartTwo') }}
        </p>
        <shop-list>
          <shop-list-item
            :title="$t('NFTs.lblTotalAmount')"
            :value="formatToDecimals(totalAmount, 0)"
          />
          <shop-list-item
            :title="$t('NFTs.lblTotalClaimed')"
            :value="formatToDecimals(totalClaimed, 0)"
          />
        </shop-list>
        <action-button
          button-class="button button-active"
          :text="$t('NFTs.btn.sweetAndSour.get.txt')"
          @button-click="handleClaim"
        />
        <div v-if="error !== undefined" class="error-message">
          {{ error }}
        </div>
      </template>
      <template v-slot:illustration>
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
import { Step } from '@/components/controls/form-loader';
import { getSweetAndSourClaimSignature } from '@/services/chain';
import { ClaimPayload } from '@/store/modules/nft/actions/claim';
import SimpleLoaderModal from '@/components/modals/simple-loader-modal.vue';
import { formatToDecimals } from '@/utils/format';

export default Vue.extend({
  name: 'NftViewSweetAndSour',
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
