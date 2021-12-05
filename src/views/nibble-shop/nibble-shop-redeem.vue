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
      <div class="progressive-left-rail">
        <left-rail-section>
          <template>
            <left-rail-section-nav-item-emoji
              emoji="📦"
              navigate-to="nibble-shop-redeem"
              :text="$t('nibbleShop.lblRedeem')"
            />
          </template>
        </left-rail-section>
      </div>
    </template>

    <secondary-page has-back-button @back="handleBack">
      <secondary-page-simple-title
        class="page-title"
        :description="$t('nibbleShop.txtRedeemDescription')"
        :title="$t('nibbleShop.lblRedeemAnItem')"
      />

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

import ActionButton from '@/components/buttons/action-button.vue';
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
      email: '' as string,
      name: '' as string,
      country: '' as string,
      address: '' as string,
      postCode: '' as string
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    id(): string {
      return this.$route.params.id;
    },
    product(): Asset | null {
      return (
        (this.products as Array<Asset>).find(
          (asset: Asset) => asset.id === this.id
        ) || null
      );
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    },
    handleClose(): void {
      this.$router.push({ name: 'home' });
    },
    status(validation: Validation) {
      return {
        error: validation.$error || validation.$invalid
      };
    }
  }
});
</script>
