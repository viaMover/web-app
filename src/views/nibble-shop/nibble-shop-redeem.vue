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
          class="form order"
          :class="{ error: $v.$anyError || errorText !== '' }"
          @submit.prevent="handleRedeem"
        >
          <div class="input-group">
            <label>
              {{ $t('nibbleShop.lblRedeem') }}
              <input
                v-model.trim="productName"
                class="disabled"
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
                :disabled="isLoading"
                name="email"
                :placeholder="$t('nibbleShop.lblPlaceholders.email')"
                type="text"
              />
            </label>
            <span v-if="!$v.email.required" class="error-message">
              {{ $t('nibbleShop.errors.email.required') }}
            </span>
            <span v-if="!$v.email.isValidEmail" class="error-message">
              {{ $t('nibbleShop.errors.email.invalid') }}
            </span>
          </div>

          <div class="input-group" :class="{ error: $v.name.$error }">
            <label>
              {{ $t('nibbleShop.lblYourName') }}
              <input
                v-model.trim="name"
                autocomplete="name"
                :disabled="isLoading"
                name="name"
                :placeholder="$t('nibbleShop.lblPlaceholders.yourName')"
                type="text"
              />
            </label>
            <span v-if="!$v.name.required" class="error-message">
              {{ $t('debitCard.errors.name.required') }}
            </span>
            <span v-if="!$v.name.valid" class="error-message">
              {{ $t('debitCard.errors.name.invalid') }}
            </span>
          </div>

          <div class="input-group input-dropdown">
            <label>
              {{ $t('nibbleShop.lblCountry') }}
              <select
                v-model="country"
                autocomplete="country-name"
                :class="{ placeholder: country === '' }"
              >
                <option disabled hidden value="">
                  {{ $t('nibbleShop.lblPlaceholders.country') }}
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
                :disabled="isLoading"
                name="address"
                :placeholder="$t('nibbleShop.lblPlaceholders.deliveryAddress')"
                type="text"
              />
            </label>
            <span v-if="!$v.address.required" class="error-message">
              {{ $t('debitCard.errors.address.required') }}
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

      <statement-list>
        <statement-list-item
          :description="$t('nibbleShop.lblRedeem')"
          :value="product ? product.title : ''"
        />
        <statement-list-item
          :description="$t('nibbleShop.lblYourEmail')"
          thin-description
        >
          <input
            v-model.trim="email"
            :class="status($v.email)"
            :placeholder="$t('nibbleShop.lblPlaceholders.email')"
          />
        </statement-list-item>
        <statement-list-item
          :description="$t('nibbleShop.lblYourName')"
          thin-description
        >
          <input
            v-model.trim="name"
            :class="status($v.name)"
            :placeholder="$t('nibbleShop.lblPlaceholders.yourName')"
          />
        </statement-list-item>
        <statement-list-item
          :description="$t('nibbleShop.lblCountry')"
          thin-description
        >
          <input
            v-model.trim="country"
            :class="status($v.country)"
            :placeholder="$t('nibbleShop.lblPlaceholders.country')"
          />
        </statement-list-item>
        <statement-list-item
          :description="$t('nibbleShop.lblDeliveryAddress')"
          thin-description
        >
          <input
            v-model.trim="address"
            :class="status($v.address)"
            :placeholder="$t('nibbleShop.lblPlaceholders.deliveryAddress')"
          />
        </statement-list-item>
        <statement-list-item
          :description="$t('nibbleShop.lblPostalCode')"
          thin-description
        >
          <input
            v-model.trim="postCode"
            :class="status($v.postCode)"
            :placeholder="$t('nibbleShop.lblPlaceholders.postalCode')"
          />
        </statement-list-item>
      </statement-list>
      <action-button
        button-class="black-link button-active button"
        :text="$t('nibbleShop.lblRedeem')"
      />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { alpha, email, helpers, required } from 'vuelidate/lib/validators';
import { Validation } from 'vuelidate/vuelidate';
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

import { ActionButton } from '@/components/buttons';
import {
  ContentWrapper,
  LeftRailSection,
  LeftRailSectionNavItemEmoji
} from '@/components/layout';
import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

const vString = helpers.regex('vString', /^[a-zA-Z_ ]*$/i);
const vStringNum = helpers.regex('vStringNum', /^[a-zA-Z0-9_ ]*$/i);

export default Vue.extend({
  name: 'NibbleShopRedeem',
  components: {
    ActionButton,
    StatementListItem,
    StatementList,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    ContentWrapper,
    LeftRailSection,
    LeftRailSectionNavItemEmoji
  },
  validations: {
    email: {
      email,
      required
    },
    name: {
      vString,
      required
    },
    country: {
      alpha,
      required
    },
    address: {
      vStringNum,
      required
    },
    postCode: {
      vStringNum,
      required
    }
  },
  data() {
    return {
      product: null as null | Asset,
      email: '',
      name: '',
      country: '',
      address: '',
      postCode: '',

      isLoading: false,
      errorText: ''
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    id(): string {
      return this.$route.params.id;
    },
    productName(): string {
      return this.product ? this.product.title : '';
    }
  },
  mounted() {
    const id = this.$route.params.id;
    this.product =
      (this.products as Array<Asset>).find((asset: Asset) => asset.id === id) ||
      null;
    if (this.product === null) {
      this.$router.push({ name: 'not-found-route' });
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    },
    handleClose(): void {
      this.$router.push({ name: 'home' });
    },
    handleRedeem(): void {
      console.log('Redeem');
    },
    status(validation: Validation) {
      return {
        error: validation.$error || validation.$invalid
      };
    }
  }
});
</script>
