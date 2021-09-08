<template>
  <div>
    <shop-wrapper has-close-button @close="handleClose">
      <template v-slot:info>
        <h1 class="info__title">{{ $t('NFTs.lblVaults') }}</h1>
        <p class="info__description">
          {{ $t('NFTs.txtNFTs.vaults.pageDescriptionPartOne') }}
          <br /><br />
          <i18n path="NFTs.txtNFTs.vaults.pageDescriptionPartTwo">
            <a href="https://viamover.com/faq/vaults" target="_blank">
              <b>{{ $t('NFTs.txtNFTs.vaults.faq') }}</b>
            </a>
          </i18n>
        </p>
        <shop-list>
          <shop-list-item
            :title="$t('NFTs.lblTotalAmount')"
            :value="totalAmount"
          />
          <shop-list-item
            :title="$t('NFTs.lblTotalClaimed')"
            :value="totalClaimed"
          />
        </shop-list>
        <action-button
          button-class="button button-active"
          :text="$t('NFTs.btn.vaults.get.txt')"
          @button-click="handleClaim"
        />
        <div v-if="getNftError !== undefined" class="error-message">
          {{ getNftError }}
        </div>
      </template>
      <template v-slot:illustration>
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

import { Step } from '@/components/controls/form-loader';
import { getVaultsSignature } from '@/services/chain';
import { ClaimPayload } from '@/store/modules/nft/actions/claim';

import { ShopWrapper, ShopList, ShopListItem } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';
import SimpleLoaderModal from '@/components/modals/simple-loader-modal.vue';

export default Vue.extend({
  name: 'NftViewVaults',
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
      getNftError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('nft', {
      totalAmount: 'VaultsTotalAmount',
      totalClaimed: 'VaultsTotalClaimed'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress'
    })
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.getNftError = undefined;
  },
  methods: {
    ...mapActions('nft', ['claimVaults', 'refreshNftStats']),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      let sig = '';
      try {
        sig = await getVaultsSignature(this.currentAddress);
      } catch {
        this.getNftError = this.$t('NFTs.txtOhNo').toString();
        return;
      }
      try {
        this.transactionStep = 'Confirm';
        await this.claimVaults({
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
          this.getNftError = this.$t('NFTs.txtOhNoSomething').toString();
        }
      }
    }
  }
});
</script>
