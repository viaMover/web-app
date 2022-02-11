<template>
  <content-wrapper-two-sided
    class="shop nft-drops view unexpected-move"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblUnexpectedMove') }}</h1>
        <div class="description">
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartOne`) }}
          <br /><br />
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartTwo`) }}
        </div>
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
        <analytics-list-item
          :description="totalExchanged"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblTotalExchanged')"
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

          <div class="group">
            <h3 class="title">{{ $t('NFTs.lblWhatElseCanDo') }}</h3>
            <div class="items">
              <emoji-text-button
                class="item"
                :disabled="isStoreLoading"
                emoji="🦍"
                :text="$t(`NFTs.btn.${nft.id}.claimAndExchange`)"
                @button-click="handleClaimAndExchange"
              />
              <emoji-text-button
                class="item"
                :disabled="isStoreLoading"
                emoji="🔄"
                :text="$t(`NFTs.btn.${nft.id}.exchange`)"
                @button-click="handleExchange"
              />
            </div>
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
        poster="@/assets/images/ios-spinner-white.svg"
      >
        <source
          src="https://storage.googleapis.com/movermedia/UnexpectedMove.webm"
          type="video/webm"
        />
        <source
          src="https://storage.googleapis.com/movermedia/UnexpectedMove.mp4"
          type="video/mp4"
        />
        <source
          src="https://ipfs.io/ipfs/QmS7nM63XtExqL8okruaLs1GifveNfhfcwdXvruiLM5qdJ"
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

import { getUnexpectedMoveClaimSignature } from '@/services/chain';
import { ChangePayload, ClaimPayload } from '@/store/modules/nft/types';
import { formatToDecimals } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton, EmojiTextButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NftViewUnexpectedMove',
  components: {
    ContentWrapperTwoSided,
    EmojiTextButton,
    ActionButton,
    AnalyticsList,
    AnalyticsListItem,
    SimpleLoaderModal
  },
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      getNftError: undefined as string | undefined,
      actionError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('nft', {
      nft: 'unexpectedMove',
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
    },
    totalExchanged(): string {
      return formatToDecimals(this.nft.meta.totalExchanged, 0);
    }
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.getNftError = undefined;
    this.actionError = undefined;
  },
  methods: {
    ...mapActions('nft', [
      'claimUnexpectedMove',
      'refreshNftStats',
      'claimAndExchangeUnexpectedMove',
      'exchangeUnexpectedMove'
    ]),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      let sig = '';
      try {
        sig = await getUnexpectedMoveClaimSignature(this.currentAddress);
      } catch {
        this.getNftError = this.$t('NFTs.txtOhNo').toString();
        return;
      }
      try {
        this.transactionStep = 'Confirm';
        await this.claimUnexpectedMove({
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
    },
    async handleClaimAndExchange(): Promise<void> {
      let sig = '';
      try {
        sig = await getUnexpectedMoveClaimSignature(this.currentAddress);
      } catch {
        this.getNftError = this.$t('NFTs.txtOhNo').toString();
        return;
      }
      try {
        this.transactionStep = 'Confirm';
        await this.claimAndExchangeUnexpectedMove({
          signature: sig,
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as ClaimPayload);
        await this.refreshNftStats();
        this.transactionStep = 'Success';
      } catch (err) {
        if (this.transactionStep === 'Process') {
          this.transactionStep = 'Reverted';
        } else {
          this.transactionStep = undefined;
          this.actionError = this.$t('NFTs.txtOhNoSomething').toString();
        }
      }
    },
    async handleExchange(): Promise<void> {
      try {
        this.transactionStep = 'Confirm';
        await this.exchangeUnexpectedMove({
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
          this.actionError = this.$t('NFTs.txtOhNoSomething').toString();
        }
      }
    }
  }
});
</script>
