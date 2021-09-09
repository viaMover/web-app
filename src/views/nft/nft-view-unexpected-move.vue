<template>
  <div>
    <shop-wrapper has-close-button @close="handleClose">
      <template v-slot:info>
        <h1 class="info__title">{{ $t('NFTs.lblUnexpectedMove') }}</h1>
        <p class="info__description">
          {{ $t('NFTs.txtNFTs.unexpectedMove.pageDescriptionPartOne') }}
          <br /><br />
          {{ $t('NFTs.txtNFTs.unexpectedMove.pageDescriptionPartTwo') }}
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
          <shop-list-item
            :title="$t('NFTs.lblTotalExchanged')"
            :value="formatToDecimals(totalExchanged, 0)"
          />
        </shop-list>
        <action-button
          button-class="button button-active"
          :text="$t('NFTs.btn.unexpectedMove.get.txt')"
          @button-click="handleClaim"
        />
        <div v-if="getNftError !== undefined" class="error-message">
          {{ getNftError }}
        </div>
        <div class="info__more">
          <p>{{ $t('NFTs.lblWhatElseCanDo') }}</p>
          <ul>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.unexpectedMove.claimAndExchange.emoji')"
                :text="$t('NFTs.btn.unexpectedMove.claimAndExchange.txt')"
                @button-click="handleClaimAndExchange"
              />
            </li>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('NFTs.btn.unexpectedMove.exchange.emoji')"
                :text="$t('NFTs.btn.unexpectedMove.exchange.txt')"
                @button-click="handleExchange"
              />
            </li>
            <li>
              <div v-if="actionError !== undefined" class="error-message">
                {{ actionError }}
              </div>
            </li>
          </ul>
        </div>
      </template>
      <template v-slot:illustration>
        <video
          autoplay="autoplay"
          class="unexpected-move"
          data-keepplaying="data-keepplaying"
          loop="loop"
          muted="muted"
          playsinline="playsinline"
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

import { ShopWrapper, ShopList, ShopListItem } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';
import EmojiTextButton from '@/components/buttons/emoji-text-button.vue';
import SimpleLoaderModal from '@/components/modals/simple-loader-modal.vue';
import { Step } from '@/components/controls/form-loader';
import { getUnexpectedMoveClaimSignature } from '@/services/chain';
import { ChangePayload, ClaimPayload } from '@/store/modules/nft/actions/claim';
import { formatToDecimals } from '@/utils/format';

export default Vue.extend({
  name: 'NftViewUnexpectedMove',
  components: {
    EmojiTextButton,
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper,
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
      totalAmount: 'UnexpectedMoveTotalAmount',
      totalClaimed: 'UnexpectedMoveTotalClaimed',
      totalExchanged: 'UnexpectedMoveTotalExchanged'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress'
    })
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.getNftError = undefined;
    this.actionError = undefined;
  },
  methods: {
    formatToDecimals,
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
