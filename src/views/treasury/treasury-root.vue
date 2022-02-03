<template>
  <content-wrapper
    class="product smart-treasury"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <navigation-section
              :section-name="$t('treasury.lblMySmartTreasury')"
            >
              <navigation-section-item-image
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
              </navigation-section-item-image>
            </navigation-section>
            <navigation-section
              :section-name="$t('treasury.leftRail.lblManageSmartTreasury')"
            >
              <navigation-section-item-image
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
              </navigation-section-item-image>

              <navigation-section-item-image
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
              </navigation-section-item-image>

              <navigation-section-item-image
                v-if="showClaimAndBurnMove"
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
              </navigation-section-item-image>

              <navigation-section-item-image
                v-if="showClaimAndBurnMOBO"
                :description="
                  $t('treasury.leftRail.lblClaimAndBurnMOBODescription')
                "
                navigate-to="treasury-claim-and-burn-mobo"
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
              </navigation-section-item-image>

              <navigation-section-item-image
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
              </navigation-section-item-image>

              <navigation-section-item-image
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

import { isFeatureEnabled } from '@/settings';
import { sameAddress } from '@/utils/address';
import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { getMoveAssetData } from '@/wallet/references/data';
import { Token } from '@/wallet/types';

import { PictureDescriptor } from '@/components/html5';
import { CustomPicture } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import { SearchModal } from '@/components/modals';
import {
  NavigationSection,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'TreasuryRoot',
  components: {
    ContentWrapper,
    SearchModal,
    NavigationSection,
    NavigationSectionItemImage,
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
    },
    showClaimAndBurnMove(): boolean {
      return (
        this.hasMoveOnBalance &&
        isFeatureEnabled('isTreasuryClaimAndBurnMOVEEnabled')
      );
    },
    showClaimAndBurnMOBO(): boolean {
      return isFeatureEnabled('isTreasuryClaimAndBurnMOBOEnabled');
    }
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
