<template>
  <form class="sell form">
    <asset-field
      :amount="input.amount"
      :assets="assets"
      field-role="input"
      :label="$t('nibbleShop.lblRedeem')"
      :native-amount="input.nativeAmount"
      @update-amount="handleUpdateInputAmount"
      @update-asset="handleUpdateInputAsset"
      @update-native-amount="handleUpdateInputNativeAmount"
    />
    <text-input-field
      v-model="fullName"
      field-id="full-name"
      :field-label="$t('nibbleShop.lblFullName')"
      :placeholder="$t('nibbleShop.lblPlaceholders.fullName')"
      :validation-object="$v.fullName"
    />
    <text-input-field
      v-model="email"
      field-id="email"
      :field-label="$t('nibbleShop.lblEmail')"
      :placeholder="$t('nibbleShop.lblPlaceholders.email')"
      :validation-object="$v.email"
    />
    <text-input-field
      v-model="country"
      field-id="country"
      :field-label="$t('nibbleShop.lblCountry')"
      :placeholder="$t('nibbleShop.lblPlaceholders.country')"
      :validation-object="$v.country"
    />
    <text-input-field
      v-model="fullAddress"
      field-id="fullAddress"
      :field-label="$t('nibbleShop.lblFullAddress')"
      :placeholder="$t('nibbleShop.lblPlaceholders.fullAddress')"
      :validation-object="$v.fullAddress"
    />
    <text-input-field
      v-model="townOrCity"
      field-id="townOrCity"
      :field-label="$t('nibbleShop.lblTownOrCity')"
      :placeholder="$t('nibbleShop.lblPlaceholders.townOrCity')"
      :validation-object="$v.townOrCity"
    />
    <text-input-field
      v-model="postalCode"
      field-id="postalCode"
      :field-label="$t('nibbleShop.lblPostalCode')"
      :placeholder="$t('nibbleShop.lblPlaceholders.postalCode')"
      :validation-object="$v.postalCode"
    />
    <action-button
      :button-class="buttonClass"
      @button-click="handleExecuteRedeem"
    >
      {{ $t('nibbleShop.btnRedeem.simple') }}
    </action-button>
  </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { required, minValue, email } from 'vuelidate/lib/validators';

import { AssetField, TextInputField } from '@/components/controls';
import { ActionButton } from '@/components/buttons';

export default Vue.extend({
  name: 'NibbleShopRedeemForm',
  components: {
    AssetField,
    TextInputField,
    ActionButton
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      assets: [],
      initialAsset: null,
      input: {
        asset: null,
        amount: 0,
        nativeAmount: 0
      },
      fullName: '',
      email: '',
      country: '',
      fullAddress: '',
      townOrCity: '',
      postalCode: ''
    };
  },
  computed: {
    ...mapState('account', ['tokens']),
    buttonClass(): string {
      return 'primary';
    }
  },
  methods: {
    handleExecuteRedeem(): void {
      //
    },
    handleUpdateInputAmount(amount: number): void {
      this.input.amount = amount;
    },
    handleUpdateInputNativeAmount(amount: number): void {
      this.input.nativeAmount = amount;
    },
    handleUpdateInputAsset(asset: never) {
      this.input.asset = asset;
    }
  },
  validations: {
    input: {
      asset: { required },
      amount: { minValue: minValue(1) },
      required
    },
    fullName: { required },
    email: { required, email },
    country: { required },
    fullAddress: { required },
    townOrCity: { required },
    postalCode: { required }
  }
});
</script>
