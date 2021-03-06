<template>
  <content-wrapper
    class="product staking-ubt"
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
              :section-name="$t('stakingUBT.lblMain')"
            >
              <navigation-section-item-image
                :description="balance"
                description-class="bold emphasize"
                navigate-to="staking-ubt-manage"
                :title="$t('stakingUBT.lblStaking')"
                title-class="muted medium"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="$t('stakingUBT.lblStaking')"
                    :sources="stakingUBT.sources"
                    :src="stakingUBT.src"
                    :webp-sources="stakingUBT.webpSources"
                  />
                </template>
              </navigation-section-item-image>
            </navigation-section>

            <navigation-section
              :is-loading="isStoreLoading"
              :section-name="$t('stakingUBT.lblManage')"
              :skeleton-components-count="3"
            >
              <navigation-section-item-image
                :description="
                  $t('stakingUBT.txtDeposit', {
                    value: formattedAPY
                  })
                "
                description-class="disabled"
                navigate-to="staking-ubt-deposit"
                :title="$t('stakingUBT.lblDeposit')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="$t('stakingUBT.lblDeposit')"
                    :sources="stakingUBT.sources"
                    :src="stakingUBT.src"
                    :webp-sources="stakingUBT.webpSources"
                  />
                </template>
              </navigation-section-item-image>

              <navigation-section-item-image
                v-if="hasActiveStaking"
                :description="$t('stakingUBT.txtWithdraw')"
                description-class="disabled"
                navigate-to="staking-ubt-withdraw"
                :title="$t('stakingUBT.lblWithdraw')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="$t('stakingUBT.lblWithdraw')"
                    :sources="withdraw.sources"
                    :src="withdraw.src"
                    :webp-sources="withdraw.webpSources"
                  />
                </template>
              </navigation-section-item-image>

              <navigation-section-item-image
                :description="$t('stakingUBT.txtGlobalAnalytics')"
                description-class="disabled"
                navigate-to="staking-ubt-global-analytics"
                :title="$t('stakingUBT.lblGlobalAnalytics')"
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
  name: 'StakingUbtRoot',
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
      stakingUBT: {
        src: require('@/assets/images/staking-ubt/Staking_General.png'),
        sources: [
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_General@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/staking-ubt/Staking_General.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_General@2x.webp')
          }
        ]
      } as PictureDescriptor,
      global: {
        alt: 'Global',
        src: require('@/assets/images/staking-ubt/Staking_GlobalAnalytics@1x.png'),
        sources: [
          {
            src: require('@/assets/images/staking-ubt/Staking_GlobalAnalytics@1x.png')
          },
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_GlobalAnalytics@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      withdraw: {
        src: require('@/assets/images/staking-ubt/Staking_Withdraw.png'),
        sources: [
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_Withdraw@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/staking-ubt/Staking_Withdraw.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/staking-ubt/Staking_Withdraw@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('stakingUBT', {
      isStoreLoading: 'isInfoLoading',
      apy: 'apy'
    }),
    ...mapGetters('stakingUBT', {
      hasActiveStaking: 'hasActiveStaking',
      balanceNative: 'balanceNative'
    }),
    balance(): string {
      return `$${formatToNative(this.balanceNative)}`;
    },
    formattedAPY(): string {
      return `${formatPercents(this.apy)}%`;
    }
  },
  async mounted() {
    await this.loadInfo();
  },
  methods: {
    ...mapActions('stakingUBT', { loadInfo: 'loadInfo' }),
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
