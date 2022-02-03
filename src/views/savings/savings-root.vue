<template>
  <content-wrapper
    class="product savings"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <navigation-section :section-name="$t('savings.lblMySavings')">
              <navigation-section-item-image
                :description="savingsBalance"
                description-class="bold emphasize"
                navigate-to="savings-manage"
                :title="$t('savings.lblSavings')"
                title-class="muted medium"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="savings.alt"
                    :sources="savings.sources"
                    :src="savings.src"
                    :webp-sources="savings.webpSources"
                  />
                </template>
              </navigation-section-item-image>
            </navigation-section>

            <navigation-section :section-name="$t('savings.lblManageSavings')">
              <navigation-section-item-image
                :description="
                  $t('savings.deposit.txtDepositShortDescription', {
                    apy: formattedAPY
                  })
                "
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
              </navigation-section-item-image>

              <navigation-section-item-image
                v-if="hasActiveSavings"
                :description="
                  $t('savings.withdraw.txtWithdrawShortDescription')
                "
                description-class="disabled"
                navigate-to="savings-withdraw"
                :title="$t('savings.btnWithdraw.simple')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="withdraw.alt"
                    :sources="withdraw.sources"
                    :src="withdraw.src"
                    :webp-sources="withdraw.webpSources"
                  />
                </template>
              </navigation-section-item-image>

              <navigation-section-item-image
                :description="$t('savings.txtGlobalAnalytics')"
                description-class="disabled"
                navigate-to="savings-global-analytics"
                :title="$t('savings.lblGlobalAnalytics')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="global.alt"
                    :sources="global.sources"
                    :src="global.src"
                    :webp-sources="global.webpSources"
                  />
                </template>
              </navigation-section-item-image>
            </navigation-section>
          </div>
        </div>
      </nav>
    </template>

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>

    <template v-slot:modals>
      <search-modal />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { formatPercents, formatToNative } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import { SearchModal } from '@/components/modals';
import {
  NavigationSection,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'SavingsRoot',
  components: {
    ContentWrapper,
    SearchModal,
    NavigationSection,
    NavigationSectionItemImage,
    CustomPicture
  },
  data() {
    return {
      savings: {
        alt: 'Savings',
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
        alt: 'Global',
        src: require('@/assets/images/Global@1x.png'),
        sources: [
          { src: require('@/assets/images/Global@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Global@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      withdraw: {
        alt: 'Withdraw',
        src: require('@/assets/images/Withdraw@1x.png'),
        sources: [
          { src: require('@/assets/images/Withdraw@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Withdraw@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('account', { apy: 'savingsAPY' }),
    ...mapGetters('account', {
      hasActiveSavings: 'hasActiveSavings',
      savingsInfoBalanceNative: 'savingsInfoBalanceNative'
    }),
    formattedAPY(): string {
      return formatPercents(this.apy);
    },
    savingsBalance(): string {
      return `$${formatToNative(this.savingsInfoBalanceNative)}`;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
