<template>
  <content-wrapper
    class="product debit-card"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nav class="left-rail navigation">
        <div class="wrapper">
          <div class="list">
            <navigation-section
              :is-loading="isLoading"
              :section-name="$t('debitCard.lblMyCard')"
              skeleton-component="navigation-section-item-image-skeleton"
            >
              <navigation-section-item-image
                :description="cardStateText"
                :description-class="descriptionClass"
                navigate-to="debit-card-manage"
                :title="$t('debitCard.lblBeautifulCard')"
                title-class="medium muted"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="currentSkinPicture.alt"
                    :sources="currentSkinPicture.sources"
                    :src="currentSkinPicture.src"
                  />
                </template>
              </navigation-section-item-image>
            </navigation-section>

            <navigation-section
              v-if="showManageCard"
              :is-loading="isLoading"
              :section-name="$t('debitCard.lblManageCard')"
              skeleton-component="navigation-section-item-image-skeleton"
              :skeleton-components-count="2"
            >
              <navigation-section-item-image
                v-if="showTopUp"
                :description="$t('debitCard.txtCardTopUp')"
                :navigate-to="{
                  name: 'debit-card-top-up',
                  params: { step: 'prepare' }
                }"
                :title="$t('debitCard.lblCardTopUp')"
                use-partial-match-active-class
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="topUpPicture.alt"
                    :sources="topUpPicture.sources"
                    :src="topUpPicture.src"
                  />
                </template>
              </navigation-section-item-image>

              <navigation-section-item-image
                v-if="showChangeSkin"
                :description="$t('debitCard.txtChangeSkin')"
                navigate-to="debit-card-change-skin"
                :title="$t('debitCard.lblChangeSkin')"
              >
                <template v-slot:picture>
                  <custom-picture
                    :alt="changeSkinPicture.alt"
                    :sources="changeSkinPicture.sources"
                    :src="changeSkinPicture.src"
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
      <search-skin-modal key="search-skin-modal" />
      <search-modal key="search-token-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import { SearchModal, SearchSkinModal } from '@/components/modals';
import {
  NavigationSection,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'DebitCardRoot',
  components: {
    ContentWrapper,
    SearchSkinModal,
    SearchModal,
    NavigationSection,
    NavigationSectionItemImage,
    CustomPicture
  },
  data() {
    return {
      topUpPicture: {
        src: require('@/assets/images/CardTopUpPreview.png'),
        alt: this.$t('debitCard.lblCardTopUp') as string,
        sources: [
          {
            src: require('@/assets/images/CardTopUpPreview@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      changeSkinPicture: {
        src: require('@/assets/images/CardChangeSkinPreview.png'),
        alt: this.$t('debitCard.lblChangeSkin') as string,
        sources: [
          {
            src: require('@/assets/images/CardChangeSkinPreview@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isLoading',
      cardState: 'cardState'
    }),
    ...mapGetters('debitCard', {
      cardStateText: 'cardStateText',
      currentSkin: 'currentSkin'
    }),
    currentSkinPicture(): PictureDescriptor {
      return this.currentSkin.previewPicture;
    },
    descriptionClass(): string {
      if (['frozen', 'expired'].includes(this.cardState)) {
        return 'bold error';
      }

      return 'bold emphasize';
    },
    showTopUp(): boolean {
      return (
        isFeatureEnabled('isDebitCardTopUpEnabled', this.currentNetwork) &&
        this.cardState === 'active'
      );
    },
    showChangeSkin(): boolean {
      return (
        isFeatureEnabled('isDebitCardChangeSkinEnabled') &&
        ['active', 'frozen', 'expired'].includes(this.cardState)
      );
    },
    showManageCard(): boolean {
      return this.showTopUp || this.showChangeSkin;
    }
  },
  async mounted() {
    await this.loadInfo(true);
  },
  methods: {
    isFeatureEnabled,
    ...mapActions('debitCard', {
      loadInfo: 'loadInfo'
    }),
    handleClose() {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
