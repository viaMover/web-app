<template>
  <content-wrapper
    class="smart-treasury"
    has-close-button
    has-left-rail
    is-black-close-button
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <left-rail-section
              :section-name="$t('treasury.lblMySmartTreasury')"
            >
              <left-rail-section-nav-item-image
                :description="balance"
                description-class="bold"
                navigate-to="treasury-manage"
                :title="$t('treasury.lblSmartTreasury')"
                title-class="disabled medium"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="treasury.alt"
                    :sources="treasury.sources"
                    :src="treasury.src"
                    :webp-sources="treasury.webpSources"
                  />
                </template>
              </left-rail-section-nav-item-image>
            </left-rail-section>
            <left-rail-section
              :section-name="$t('treasury.leftRail.lblManageSmartTreasury')"
            >
              <left-rail-section-nav-item-image
                :description="
                  $t('treasury.leftRail.lblIncreaseBoostDescription')
                "
                navigate-to="treasury-increase"
                :title="$t('treasury.leftRail.lblIncreaseBoost')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="increase.alt"
                    :sources="increase.sources"
                    :src="increase.src"
                    :webp-sources="increase.webpSources"
                  />
                </template>
              </left-rail-section-nav-item-image>
              <left-rail-section-nav-item-image
                v-if="hasActiveTreasury"
                :description="
                  $t('treasury.leftRail.lblDecreaseBoostDescription')
                "
                navigate-to="treasury-decrease"
                :title="$t('treasury.leftRail.lblDecreaseBoost')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="decrease.alt"
                    :sources="decrease.sources"
                    :src="decrease.src"
                    :webp-sources="decrease.webpSources"
                  />
                </template>
              </left-rail-section-nav-item-image>
              <left-rail-section-nav-item-image
                v-if="hasMoveOnBalance"
                :description="
                  $t('treasury.leftRail.lblClaimAndBurnDescription')
                "
                navigate-to="treasury-claim-and-burn"
                :title="$t('treasury.leftRail.lblClaimAndBurn')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="claimAndBurn.alt"
                    :sources="claimAndBurn.sources"
                    :src="claimAndBurn.src"
                    :webp-sources="claimAndBurn.webpSources"
                  />
                </template>
              </left-rail-section-nav-item-image>
              <left-rail-section-nav-item-image
                :description="$t('treasury.leftRail.lblPowerCardDescription')"
                navigate-to="treasury-powercard"
                :title="$t('treasury.leftRail.lblPowerCard')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="powerCard.alt"
                    :sources="powerCard.sources"
                    :src="powerCard.src"
                    :webp-sources="powerCard.webpSources"
                  />
                </template>
              </left-rail-section-nav-item-image>
              <left-rail-section-nav-item-image
                :description="
                  $t('treasury.leftRail.lblGlobalAnalyticsDescription')
                "
                navigate-to="treasury-global-analytics"
                :title="$t('treasury.leftRail.lblGlobalAnalytics')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="analytics.alt"
                    :sources="analytics.sources"
                    :src="analytics.src"
                    :webp-sources="analytics.webpSources"
                  />
                </template>
              </left-rail-section-nav-item-image>
            </left-rail-section>
          </div>
        </div>
      </nav>
    </template>

    <router-view />

    <template v-slot:modals>
      <search-modal />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { sameAddress } from '@/utils/address';
import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { getMoveAssetData } from '@/wallet/references/data';
import { Token } from '@/wallet/types';

import { PictureDescriptor } from '@/components/html5';
import { CustomPicture } from '@/components/html5';
import {
  ContentWrapper,
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';
import { SearchModal } from '@/components/modals';

// import '@/styles/_treasury.less';

export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    ContentWrapper,
    SearchModal,
    LeftRailSectionNavItemImage,
    LeftRailSection,
    CustomPicture
  },
  data() {
    return {
      treasury: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: require('@/assets/images/SmartTreasury@1x.png'),
        sources: [
          { src: require('@/assets/images/SmartTreasury@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/SmartTreasury@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.webp')
          }
        ]
      } as PictureDescriptor,
      powerCard: {
        alt: this.$t('treasury.leftRail.lblPowerCard'),
        src: require('@/assets/images/Powercard_icon@1x.png'),
        sources: [
          { src: require('@/assets/images/Powercard_icon@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Powercard_icon@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      increase: {
        alt: this.$t('treasury.leftRail.lblIncreaseBoost'),
        src: require('@/assets/images/IncreaseBoost@1x.png'),
        sources: [
          { src: require('@/assets/images/IncreaseBoost@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/IncreaseBoost@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      decrease: {
        alt: this.$t('treasury.leftRail.lblDecreaseBoost'),
        src: require('@/assets/images/DecreaseBoost@1x.png'),
        sources: [
          { src: require('@/assets/images/DecreaseBoost@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/DecreaseBoost@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      claimAndBurn: {
        alt: this.$t('treasury.leftRail.lblClaimAndBurn'),
        src: require('@/assets/images/Claim&Burn@1x.png'),
        sources: [
          { src: require('@/assets/images/Claim&Burn@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Claim&Burn@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      analytics: {
        alt: this.$t('treasury.leftRail.lblGlobalAnalytics'),
        src: require('@/assets/images/GlobalAnalytics@1x.png'),
        sources: [
          { src: require('@/assets/images/GlobalAnalytics@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/GlobalAnalytics@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('account', ['networkInfo', 'tokens']),
    ...mapGetters('account', { hasActiveTreasury: 'hasActiveTreasury' }),
    ...mapGetters('account', {
      treasuryStakedBalanceNative: 'treasuryStakedBalanceNative'
    }),
    hasMoveOnBalance(): boolean {
      const walletBalanceMove =
        this.tokens.find((t: Token) =>
          sameAddress(
            t.address,
            getMoveAssetData(this.networkInfo.network).address
          )
        )?.balance ?? '0';
      return greaterThan(walletBalanceMove, '0');
    },
    balance(): string {
      return `$${formatToNative(this.treasuryStakedBalanceNative)}`;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
