<template>
  <content-wrapper
    class="shop"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <navigation-section hide-header>
              <navigation-section-item-emoji
                emoji="📦"
                navigate-to="nibble-shop-redeem"
                :text="$t('nibbleShop.lblRedeem')"
              />
            </navigation-section>
          </div>
        </div>
      </nav>
    </template>

    <secondary-page class="redeem" has-back-button hide-info @back="handleBack">
      <template v-slot:title>
        <secondary-page-header
          :description="$t('nibbleShop.txtRedeemDescription')"
          :title="$t('nibbleShop.lblRedeemAnItem')"
        />
      </template>

      <div class="container">
        <form
          class="form order"
          :class="{ error: $v.$anyError || errorText !== '' }"
          @submit.prevent="handleRedeem"
        >
          <div class="input-group">
            <label class="bold-label">
              {{ $t('nibbleShop.lblRedeem') }}
              <input
                v-model.trim="productName"
                class="small-font disabled bold-label"
                disabled="disabled"
                name="productName"
                type="text"
              />
            </label>
          </div>

          <div class="input-group" :class="{ error: $v.email.$error }">
            <label>
              {{ $t('nibbleShop.lblYourEmail') }}
              <input
                v-model.trim="email"
                autocomplete="email"
                autofocus
                class="small-font"
                :disabled="isLoading"
                name="email"
                :placeholder="$t('nibbleShop.lblPlaceholders.email')"
                type="text"
              />
            </label>
            <span v-if="!$v.email.required" class="error-message small-font">
              {{ $t('nibbleShop.errors.email.required') }}
            </span>
            <span v-if="!$v.email.valid" class="error-message small-font">
              {{ $t('nibbleShop.errors.email.invalid') }}
            </span>
          </div>

          <div class="input-group" :class="{ error: $v.name.$error }">
            <label>
              {{ $t('nibbleShop.lblYourName') }}
              <input
                v-model.trim="name"
                autocomplete="name"
                class="small-font"
                :disabled="isLoading"
                name="name"
                :placeholder="$t('nibbleShop.lblPlaceholders.yourName')"
                type="text"
              />
            </label>
            <span v-if="!$v.name.required" class="error-message small-font">
              {{ $t('nibbleShop.errors.name.required') }}
            </span>
          </div>

          <div class="input-group input-dropdown">
            <label>
              {{ $t('nibbleShop.lblCountry') }}
              <select
                v-model="country"
                autocomplete="country-name"
                class="small-font"
                :class="{ placeholder: country === '' }"
              >
                <option disabled hidden value="">
                  {{ $t('nibbleShop.lblPlaceholders.country') }}
                </option>

                <option
                  v-for="country in countries"
                  :key="country.code"
                  :value="country.code"
                >
                  {{ country.name }}
                </option>
              </select>
            </label>
            <span v-if="!$v.country.required" class="error-message small-font">
              {{ $t('nibbleShop.errors.country.required') }}
            </span>
          </div>

          <div class="input-group" :class="{ error: $v.address.$error }">
            <label>
              {{ $t('nibbleShop.lblDeliveryAddress') }}
              <input
                v-model.trim="address"
                autocomplete="address-line1"
                class="small-font"
                :disabled="isLoading"
                name="address"
                :placeholder="$t('nibbleShop.lblPlaceholders.deliveryAddress')"
                type="text"
              />
            </label>
            <span v-if="!$v.address.required" class="error-message small-font">
              {{ $t('nibbleShop.errors.address.required') }}
            </span>
          </div>

          <div class="input-group" :class="{ error: $v.postCode.$error }">
            <label>
              {{ $t('nibbleShop.lblPostalCode') }}
              <input
                v-model.trim="postCode"
                autocomplete="postal-code"
                class="small-font"
                :disabled="isLoading"
                name="postCode"
                :placeholder="$t('nibbleShop.lblPlaceholders.postalCode')"
                type="text"
              />
            </label>
            <span v-if="!$v.postCode.required" class="error-message small-font">
              {{ $t('nibbleShop.errors.postCode.required') }}
            </span>
          </div>

          <action-button
            ref="button"
            class="primary"
            :disabled="isLoading"
            propagate-original-event
            type="submit"
          >
            <div v-if="isLoading" class="loader-icon">
              <img
                :alt="$t('icon.txtPendingIconAlt')"
                src="@/assets/images/ios-spinner-white.svg"
              />
            </div>
            <template v-else>
              {{ $t('nibbleShop.lblRedeem') }}
            </template>
          </action-button>

          <span v-if="errorText !== ''" class="error-message">
            {{ errorText }}
          </span>
        </form>
      </div>
    </secondary-page>
    <simple-loader-modal
      v-if="transactionStep !== undefined"
      :loader-step="transactionStep"
      @close="transactionStep = undefined"
    />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { email, required } from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { NibbleShopApiError } from '@/services/mover/nibble-shop/types';
import { isProviderRpcError } from '@/store/modules/governance/utils';
import { RedeemPayload } from '@/store/modules/shop/actions/redeem';
import { Asset, RedeemParams } from '@/store/modules/shop/types';

import { ActionButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ContentWrapper } from '@/components/layout';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';
import { SimpleLoaderModal } from '@/components/modals';
import {
  NavigationSection,
  NavigationSectionItemEmoji
} from '@/components/navigation';

export default Vue.extend({
  name: 'NibbleShopRedeem',
  components: {
    ActionButton,
    SecondaryPageHeader,
    SecondaryPage,
    ContentWrapper,
    NavigationSection,
    NavigationSectionItemEmoji,
    SimpleLoaderModal
  },
  validations: {
    email: {
      valid: email,
      required
    },
    name: {
      required
    },
    country: {
      required
    },
    address: {
      required
    },
    postCode: {
      required
    }
  },
  data() {
    return {
      product: undefined as undefined | Asset,
      email: '',
      name: '',
      country: '',
      address: '',
      postCode: '',

      isLoading: false,
      errorText: '',
      transactionStep: undefined as Step | undefined
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets', countries: 'countries' }),
    id(): string {
      return this.$route.params.id;
    },
    productName(): string {
      return this.product ? this.product.title : '';
    }
  },
  mounted() {
    const id = this.$route.params.id;
    this.product = (this.products as Array<Asset>).find(
      (asset: Asset) => asset.id === id
    );
    if (this.product === undefined) {
      this.$router.push({ name: 'not-found-route' });
      return;
    }
    this.transactionStep = undefined;
    this.errorText = '';
    this.isLoading = false;
  },
  methods: {
    ...mapActions('shop', {
      requestToNibbleShopRedeemServer: 'requestToNibbleShopRedeemServer',
      refreshAssetsInfoList: 'refreshAssetsInfoList',
      redeemNibbleNFT: 'redeemNibbleNFT'
    }),
    handleBack(): void {
      this.$router.back();
    },
    handleClose(): void {
      this.$router.push({ name: 'home' });
    },
    async handleRedeem(): Promise<void> {
      this.errorText = '';
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      if (this.product === undefined) {
        this.errorText = this.$t('nibbleShop.errors.default') as string;
        return;
      }

      let sig = '';

      try {
        this.isLoading = true;
        sig = await this.requestToNibbleShopRedeemServer({
          email: this.email,
          tokenIntId: this.product.intId,
          name: this.name,
          country: this.country,
          address: this.address,
          postalCode: this.postCode,
          tokenUrl: this.product.urlId
        } as RedeemParams);
      } catch (error) {
        if (isProviderRpcError(error)) {
          if (this.$te(`provider.errors.${error.code}`)) {
            this.errorText = this.$t(
              `provider.errors.${error.code}`
            ).toString();
            return;
          }
        }

        if (error instanceof NibbleShopApiError) {
          if (
            error.shortMessage !== undefined &&
            this.$te(`nibbleShop.errors.${error.shortMessage}`)
          ) {
            this.errorText = this.$t(
              `nibbleShop.errors.${error.message}`
            ) as string;
            return;
          }

          if (this.$te(`nibbleShop.errors.${error.message}`)) {
            this.errorText = this.$t(
              `nibbleShop.errors.${error.message}`
            ) as string;
            return;
          }
        }

        this.errorText = this.$t('nibbleShop.errors.default') as string;
        return;
      } finally {
        this.isLoading = false;
      }

      try {
        this.transactionStep = 'Confirm';
        await this.redeemNibbleNFT({
          changeStep: () => {
            this.transactionStep = 'Process';
          },
          tokenId: this.product.id,
          signature: sig
        } as RedeemPayload);
        await this.refreshAssetsInfoList();
        this.transactionStep = 'Success';
      } catch (err) {
        console.log(err);
        Sentry.captureException(err);
        this.transactionStep = 'Reverted';
      }
    }
  }
});
</script>
