<template>
  <div>
    <shop-wrapper has-close-button @close="handleClose">
      <template v-slot:info>
        <h1 class="info__title">{{ productTitle }}</h1>
        <p class="info__description">
          {{ $t(`nibbleShop.txtAssets.${id}.description`) }}
        </p>
        <shop-list>
          <shop-list-item
            :title="$t('nibbleShop.lblTotalAvailable')"
            :value="totalAvailable"
          />
          <shop-list-item
            :title="$t('nibbleShop.lblPrice')"
            :value="productPrice"
          />
        </shop-list>
        <action-button
          button-class="button button-active"
          :text="$t('nibbleShop.btn.get.txt', { item: productShortName })"
          @button-click="handleClaim"
        />
        <div v-if="getTokenError !== undefined" class="error-message">
          {{ getTokenError }}
        </div>
        <div class="info__more">
          <p>{{ $t('nibbleShop.lblWhatElseCanDo') }}</p>
          <ul>
            <li>
              <emoji-text-button
                button-class="button-active"
                :emoji="$t('nibbleShop.btn.redeem.emoji')"
                :text="$t('nibbleShop.btn.redeem.txt')"
                @button-click="handleRedeem"
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
          data-keepplaying="data-keepplaying"
          loop="loop"
          muted="muted"
          playsinline="playsinline"
          :style="videoStyle"
        >
          <source :src="product.page.videoSrc" type="video/webm" />
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

import * as Sentry from '@sentry/vue';
import { Properties } from 'csstype';

import { ClaimPayload } from '@/store/modules/shop/actions/claim';
import { Asset } from '@/store/modules/shop/types';
import { fromWei } from '@/utils/bigmath';

import { ActionButton, EmojiTextButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ShopList, ShopListItem, ShopWrapper } from '@/components/layout';
import { SimpleLoaderModal } from '@/components/modals';

export default Vue.extend({
  name: 'NibbleShopView',
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
      getTokenError: undefined as string | undefined,
      actionError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
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
      return (
        this.product.initialQuantity -
        this.product.totalClaimed -
        this.product.redeemCount
      );
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
