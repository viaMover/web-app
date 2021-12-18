<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="redeem"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <left-rail-section>
        <template>
          <left-rail-section-nav-item-emoji
            emoji="📦"
            navigate-to="nibble-shop-redeem"
            :text="$t('nibbleShop.lblRedeem')"
          />
        </template>
      </left-rail-section>
    </template>

    <secondary-page has-back-button @back="handleBack">
      <secondary-page-simple-title
        class="page-title"
        :description="$t('nibbleShop.txtRedeemDescription')"
        :title="$t('nibbleShop.lblRedeemAnItem')"
      />
      <div class="container">
        <form
          class="form order with-bottom-margin"
          :class="{ error: $v.$anyError || errorText !== '' }"
          @submit.prevent="handleRedeem"
        >
          <div class="input-group">
            <label class="bold-label">
              {{ $t('nibbleShop.lblRedeem') }}
              <input
                v-model.trim="productName"
                class="small-font disabled bold-label"
                :disabled="true"
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
            <span v-if="!$v.email.required" class="error-message">
              {{ $t('nibbleShop.errors.email.required') }}
            </span>
            <span v-if="!$v.email.valid" class="error-message">
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
            <span v-if="!$v.name.required" class="error-message">
              {{ $t('nibbleShop.errors.name.required') }}
            </span>
            <span v-if="!$v.name.valid" class="error-message">
              {{ $t('nibbleShop.errors.name.invalid') }}
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
            <span v-if="!$v.country.required" class="error-message">
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
            <span v-if="!$v.address.required" class="error-message">
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
            <span v-if="!$v.postCode.required" class="error-message">
              {{ $t('nibbleShop.errors.postCode.required') }}
            </span>
            <span v-if="!$v.postCode.valid" class="error-message">
              {{ $t('nibbleShop.errors.postCode.invalid') }}
            </span>
          </div>

          <action-button
            ref="button"
            button-class="black-link button-active button"
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
import { alpha, email, helpers, required } from 'vuelidate/lib/validators';
import { Validation } from 'vuelidate/vuelidate';
import { mapActions, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { NibbleShopApiError } from '@/services/mover/nibble-shop/types';
import { isProviderRpcError } from '@/store/modules/governance/utils';
import { RedeemPayload } from '@/store/modules/shop/actions/claim';
import { Asset, RedeemParams } from '@/store/modules/shop/types';

import { ActionButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import {
  ContentWrapper,
  LeftRailSection,
  LeftRailSectionNavItemEmoji
} from '@/components/layout';
import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import { SimpleLoaderModal } from '@/components/modals';

const vString = helpers.regex('vString', /^[a-zA-Z_ ]*$/i);
const vStringNum = helpers.regex('vStringNum', /^[a-zA-Z0-9_ ]*$/i);

export default Vue.extend({
  name: 'NibbleShopRedeem',
  components: {
    ActionButton,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    ContentWrapper,
    LeftRailSection,
    LeftRailSectionNavItemEmoji,
    SimpleLoaderModal
  },
  validations: {
    email: {
      valid: email,
      required
    },
    name: {
      valid: vString,
      required
    },
    country: {
      alpha,
      required
    },
    address: {
      valid: vStringNum,
      required
    },
    postCode: {
      valid: vStringNum,
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
    if (this.product === null) {
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

      try {
        this.isLoading = true;
        await this.requestToNibbleShopRedeemServer({
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
          tokenId: this.product.id
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
