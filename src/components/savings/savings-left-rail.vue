<template>
  <left-rail-section>
    <left-rail-section :section-name="$t('savings.lblMySavings')">
      <left-rail-section-nav-item-image
        :description="savingsBalance"
        description-class="bold"
        navigate-to="savings-manage"
        :title="$t('savings.lblSavings')"
        title-class="disabled"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="savings.alt"
            :sources="savings.sources"
            :src="savings.src"
            :webp-sources="savings.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
    </left-rail-section>
    <left-rail-section :section-name="$t('savings.lblManageSavings')">
      <left-rail-section-nav-item-image
        :description="$t('savings.deposit.txtDepositShortDescription')"
        description-class="disabled"
        navigate-to="savings-deposit"
        :title="$t('savings.btnDeposit.simple')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="savings.alt"
            :sources="savings.sources"
            :src="savings.src"
            :webp-sources="savings.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        v-if="hasActiveSavings"
        :description="$t('savings.withdraw.txtWithdrawShortDescription')"
        description-class="disabled"
        navigate-to="savings-withdraw"
        :title="$t('savings.btnWithdraw.simple')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="savings.alt"
            :sources="savings.sources"
            :src="savings.src"
            :webp-sources="savings.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('savings.txtGlobalAnalytics')"
        description-class="disabled"
        navigate-to="savings-global-analytics"
        :title="$t('savings.lblGlobalAnalytics')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="savings.alt"
            :sources="savings.sources"
            :src="savings.src"
            :webp-sources="savings.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
    </left-rail-section>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { formatToNative } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';

export default Vue.extend({
  name: 'SavingsLeftRail',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
    CustomPicture
  },
  data() {
    return {
      savings: {
        alt: '',
        src: require('@/assets/images/Savings@1x.png'),
        sources: [
          { src: require('@/assets/images/Savings@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.webp')
          }
        ]
      } as PictureDescriptor,
      global: {
        //TODO insert new image
        alt: '',
        src: require('@/assets/images/Savings@1x.png'),
        sources: [
          { src: require('@/assets/images/Savings@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapGetters('account', {
      hasActiveSavings: 'hasActiveSavings',
      savingsInfoBalanceNative: 'savingsInfoBalanceNative'
    }),
    savingsBalance(): string {
      return `$${formatToNative(this.savingsInfoBalanceNative)}`;
    }
  }
});
</script>
