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
            <navigation-section
              :is-loading="isStoreLoading"
              :section-name="$t('savingsPlus.leftRail.lblMySP')"
            >
              <navigation-section-item-image
                :description="savingsBalance"
                description-class="bold emphasize"
                navigate-to="savings-plus-manage"
                :title="$t('savingsPlus.lblSP')"
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

            <navigation-section
              :is-loading="isStoreLoading"
              :section-name="$t('savingsPlus.leftRail.lblManageSP')"
              :skeleton-components-count="3"
            >
              <navigation-section-item-image
                :description="
                  $t('savingsPlus.leftRail.lblDepositInSPDescription', {
                    value: formattedAPY
                  })
                "
                description-class="disabled"
                navigate-to="savings-plus-deposit"
                :title="$t('savingsPlus.leftRail.lblDepositInSP')"
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
                  $t('savingsPlus.leftRail.lblWithdrawFromSPDescription')
                "
                description-class="disabled"
                navigate-to="savings-plus-withdraw"
                :title="$t('savingsPlus.leftRail.lblWithdrawFromSP')"
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
                :description="
                  $t('savingsPlus.leftRail.lblGlobalAnalyticsDescription')
                "
                description-class="disabled"
                navigate-to="savings-plus-global-analytics"
                :title="$t('savingsPlus.leftRail.lblGlobalAnalytics')"
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
      <preload-product-secondary-page v-if="isStoreLoading" />
      <router-view v-else />
    </transition>

    <template v-slot:modals>
      <search-modal />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { formatPercents, formatToNative } from '@/utils/format';
import PreloadProductSecondaryPage from '@/views/preload/preload-product/preload-product-secondary-page.vue';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import { SearchModal } from '@/components/modals';
import {
  NavigationSection,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'SavingsPlusRoot',
  components: {
    ContentWrapper,
    SearchModal,
    NavigationSection,
    NavigationSectionItemImage,
    CustomPicture,
    PreloadProductSecondaryPage
  },
  data() {
    return {
      savings: {
        alt: 'Savings plus',
        src: require('@/assets/images/SavingsPlus@1x.png'),
        sources: [
          { src: require('@/assets/images/SavingsPlus@2x.png'), variant: '2x' }
        ],
        webpSources: [
          { src: require('@/assets/images/SavingsPlus@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/SavingsPlus@2x.webp')
          }
        ]
      } as PictureDescriptor,
      global: {
        alt: 'Global',
        src: require('@/assets/images/GlobalAnalyticsSP@1x.png'),
        sources: [
          { src: require('@/assets/images/GlobalAnalyticsSP@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/GlobalAnalyticsSP@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/GlobalAnalyticsSP@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/GlobalAnalyticsSP@2x.webp')
          }
        ]
      } as PictureDescriptor,
      withdraw: {
        alt: 'Withdraw',
        src: require('@/assets/images/WithdrawSP@1x.png'),
        sources: [
          { src: require('@/assets/images/WithdrawSP@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/WithdrawSP@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/WithdrawSP@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/WithdrawSP@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('savingsPlus', {
      apy: 'APY',
      isStoreLoading: 'isInfoLoading'
    }),
    ...mapGetters('savingsPlus', {
      hasActiveSavings: 'hasActiveSavingsPlus',
      infoBalanceNative: 'infoBalanceNative'
    }),
    formattedAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    savingsBalance(): string {
      return `$${formatToNative(this.infoBalanceNative)}`;
    }
  },
  async mounted() {
    await this.loadInfo();
  },
  methods: {
    ...mapActions('savingsPlus', { loadInfo: 'loadInfo' }),
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
