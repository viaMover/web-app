<template>
  <content-wrapper-two-sided
    class="shop nft-drops view order-of-liberty"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblOrderOfLiberty') }}</h1>
        <div class="description">
          <i18n :path="`NFTs.txtNFTs.${nft.id}.pageDescriptionPartOne`">
            <a
              class="link bold emphasize"
              href="https://www.instagram.com/graphicdddays/"
              rel="external nofollow"
            >
              {{ $t(`NFTs.txtNFTs.${nft.id}.txtUkrainian`) }}
            </a>
            <a
              class="link bold emphasize"
              href="https://www.xravers.com/"
              rel="external nofollow"
            >
              {{ $t(`NFTs.txtNFTs.${nft.id}.txtUkrainian`) }}
            </a>
          </i18n>
          <br /><br />
          <i18n :path="`NFTs.txtNFTs.${nft.id}.pageDescriptionPartTwo`">
            <a
              class="link bold emphasize"
              href="https://www.embracemefoundation.com/"
              rel="external nofollow help"
            >
              {{ $t(`NFTs.txtNFTs.${nft.id}.txtRegisteredCharity`) }}
            </a>
          </i18n>
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionPartTwo`) }}
          <br /><br />
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescriptionDisclaimer`) }}
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="totalMinted"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblTotalMinted')"
        />
        <analytics-list-item
          :description="formatPrice(defaultPrice)"
          :is-loading="isStoreLoading"
          :title="$t('NFTs.lblPrice')"
        />
      </analytics-list>

      <form
        class="form"
        :class="{ error: actionError !== undefined }"
        @submit.prevent="handleClaim(defaultPrice)"
      >
        <div class="actions">
          <div class="group default">
            <action-button
              class="primary"
              :disabled="isStoreLoading"
              propagate-original-event
              :text="$t(`NFTs.btn.${nft.id}.help`)"
              type="submit"
            />
          </div>

          <div
            v-if="availablePrices && availablePrices.length > 0"
            class="group"
          >
            <h2 class="title">
              {{ $t(`NFTs.txtNFTs.${nft.id}.lblOtherOptions`) }}
            </h2>
            <div class="items">
              <emoji-text-button
                v-for="price in availablePrices"
                :key="price"
                class="item"
                :disabled="isStoreLoading"
                emoji="🙏"
                :text="formatPrice(price)"
                @button-click="handleClaim(price)"
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
      <picture>
        <img
          v-cloak
          :alt="$t('NFTs.txtAssetAlt', { name: nft.name })"
          :src="imageSrc"
        />
      </picture>
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

import sample from 'lodash-es/sample';

import { OrderOfLibertyPayload } from '@/store/modules/nft/types';
import { fromWei } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton, EmojiTextButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NftViewOrderOfLiberty',
  components: {
    AnalyticsListItem,
    AnalyticsList,
    ContentWrapperTwoSided,
    EmojiTextButton,
    ActionButton,
    SimpleLoaderModal
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      actionError: undefined as string | undefined,
      imageSrc: '',
      images: [
        require('@/assets/images/order-of-liberty/picture1.png'),
        require('@/assets/images/order-of-liberty/picture2.png'),
        require('@/assets/images/order-of-liberty/picture3.png'),
        require('@/assets/images/order-of-liberty/picture4.png')
      ]
    };
  },
  computed: {
    ...mapState('nft', {
      nft: 'orderOfLiberty',
      isStoreLoading: 'isLoading'
    }),
    totalMinted(): string {
      return this.nft.meta.totalSupply;
    },
    defaultPrice(): string {
      return this.nft.meta.defaultPrice;
    },
    availablePrices(): Array<string> {
      return this.nft.meta.availablePrices;
    }
  },
  created(): void {
    this.imageSrc = sample(this.images);
  },
  mounted(): void {
    this.transactionStep = undefined;
    this.actionError = undefined;
  },
  methods: {
    ...mapActions('nft', {
      claimOrderOfLiberty: 'claimOrderOfLiberty',
      refreshNftStats: 'fetchOrderOfLibertyData'
    }),
    handleClose(): void {
      this.$router.back();
    },
    async handleClaim(price: string): Promise<void> {
      this.actionError = undefined;
      try {
        this.transactionStep = 'Confirm';
        await this.claimOrderOfLiberty({
          selectedPrice: price,
          changeStep: () => {
            this.transactionStep = 'Process';
          }
        } as OrderOfLibertyPayload);
        await this.refreshNftStats();
        this.transactionStep = 'Success';
      } catch (err) {
        this.transactionStep = 'Reverted';
        this.actionError = this.$t('NFTs.txtOhNoSomething') as string;
      }
    },
    formatPrice(price: string): string {
      return `${formatToNative(fromWei(price, 18))} ETH`; // fixme: Add base asset formatting
    }
  }
});
</script>
