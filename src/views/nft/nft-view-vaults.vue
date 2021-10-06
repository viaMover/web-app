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
            :value="formatToDecimals(totalAmount, 0)"
          />
          <shop-list-item
            :title="$t('NFTs.lblTotalClaimed')"
            :value="formatToDecimals(totalClaimed, 0)"
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

import { ChangePayload } from '@/store/modules/nft/actions/claim';
import { formatToDecimals } from '@/utils/format';

import ActionButton from '@/components/buttons/action-button.vue';
import { Step } from '@/components/controls/form-loader';
import { ShopList, ShopListItem, ShopWrapper } from '@/components/layout';
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
    formatToDecimals,
    ...mapActions('nft', ['claimVaults', 'refreshNftStats']),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(): Promise<void> {
      try {
        this.transactionStep = 'Confirm';
        await this.claimVaults({
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
          this.getNftError = this.$t('NFTs.txtOhNoSomething').toString();
        }
      }
    }
  }
});
</script>
