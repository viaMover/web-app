<template>
  <content-wrapper-two-sided
    class="shop nibble-shop"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ productTitle }}</h1>
        <div class="description">
          {{ $t(`nibbleShop.txtAssets.${id}.description`) }}
        </div>
      </div>

      <analytics-list>
        <analytics-list-item
          :description="totalAvailable"
          :is-loading="isStoreLoading"
          :title="$t('nibbleShop.lblTotalAvailable')"
        />
        <analytics-list-item
          :description="productPrice"
          :title="$t('nibbleShop.lblPrice')"
        />
      </analytics-list>

      <form
        class="form"
        :class="{ error: !!actionError || !!getTokenError }"
        @submit.prevent="handleClaim"
      >
        <div class="actions">
          <div class="group default">
            <action-button
              class="primary"
              :disabled="isStoreLoading"
              :text="$t('nibbleShop.btn.get', { item: productShortName })"
              @button-click="handleClaim"
            />
          </div>

          <div v-if="getTokenError !== undefined" class="group error-message">
            {{ getTokenError }}
          </div>

          <div class="group">
            <h3 class="title">{{ $t('nibbleShop.lblWhatElseCanDo') }}</h3>
            <div class="items">
              <emoji-text-button
                class="item"
                :disabled="isStoreLoading"
                emoji="📦"
                :text="$t('nibbleShop.btn.redeem')"
                @button-click="handleRedeem"
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
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        poster="@/assets/images/ios-spinner.svg"
        :style="videoStyle"
      >
        <source :src="product.page.videoSrc" type="video/webm" />
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

import * as Sentry from '@sentry/vue';
import { Properties } from 'csstype';

import { ClaimPayload } from '@/store/modules/shop/types';
import { Asset } from '@/store/modules/shop/types';
import { fromWei } from '@/utils/bigmath';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import { ActionButton, EmojiTextButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapperTwoSided } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NibbleShopView',
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
      getTokenError: undefined as string | undefined,
      actionError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets', isStoreLoading: 'isLoading' }),
    id(): string {
      return this.$route.params.id;
    },
    videoStyle(): Properties {
      return {
        backgroundColor: this.product?.page.background
      };
    },
    product(): Asset | undefined {
      return (this.products as Array<Asset>).find(
        (asset: Asset) => asset.id === this.id
      );
    },
    productTitle(): string {
      return this.product ? this.product.title : '';
    },
    productPrice(): string {
      return this.product ? `Ξ${fromWei(this.product.feeAmount, 18)}` : '';
    },
    productShortName(): string {
      return this.product ? this.product.shortName : '';
    },
    productBalance(): number {
      return this.product ? this.product.balance : 0;
    },
    totalAvailable(): number {
      if (this.product === undefined) {
        return 0;
      }
      return this.product.initialQuantity - this.product.totalClaimed;
    }
  },
  mounted() {
    if (this.product === undefined) {
      this.$router.push({ name: 'not-found-route' });
      return;
    }
    this.transactionStep = undefined;
    this.actionError = '';
  },
  methods: {
    ...mapActions('shop', ['claimNibbleNFT', 'refreshAssetsInfoList']),
    async handleClaim(): Promise<void> {
      try {
        this.getTokenError = '';
        if (this.product === undefined) {
          this.getTokenError = this.$t('nibbleShop.errors.default') as string;
          return;
        }
        if (this.totalAvailable <= 0) {
          this.getTokenError = this.$t('nibbleShop.errors.cantClaim') as string;
          return;
        }

        this.transactionStep = 'Confirm';
        await this.claimNibbleNFT({
          changeStep: () => {
            this.transactionStep = 'Process';
          },
          tokenId: this.product.id
        } as ClaimPayload);
        await this.refreshAssetsInfoList();
        this.transactionStep = 'Success';
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
        this.transactionStep = 'Reverted';
      }
    },
    handleClose(): void {
      this.$router.back();
    },
    handleRedeem(): void {
      if (this.product === undefined) {
        this.actionError = this.$t('nibbleShop.errors.default') as string;
        return;
      }
      if (this.productBalance <= 0) {
        this.actionError = this.$t('nibbleShop.errors.cantRedeem') as string;
        return;
      }
      this.$router.push({
        name: 'nibble-shop-redeem',
        params: { id: this.id }
      });
    }
  }
});
</script>
