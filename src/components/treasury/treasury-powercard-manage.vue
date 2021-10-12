<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="$t('treasury.powercard.txtThePowercardPageDescription')"
        :title="$t('treasury.powercard.lblThePowercard')"
      />
    </div>
    <div class="treasury__menu-wrapper-body margin-top-80">
      <div class="token__item">
        <div class="item__info">
          <progress-loader class="loading" value="100" />
          <div class="item__info-icon">
            <custom-picture
              :alt="powercard.alt"
              :sources="powercard.sources"
              :src="powercard.src"
              :webp-sources="powercard.webpSources"
            />
          </div>
          <div class="item__info-label">
            <p>{{ $t('treasury.powercard.lblThePowercard') }}</p>
            <span>{{ status }}</span>
          </div>
        </div>
      </div>
      <div class="treasury-powercard-list">
        <div class="item">
          <h2>{{ $t('treasury.powercard.lblPowercardStatus') }}</h2>
          <span>
            {{ status }}
          </span>
        </div>
        <div class="item">
          <h2>{{ $t('treasury.powercard.lblRemainingTime') }}</h2>
          <span>
            {{ remainingTime }}
          </span>
        </div>
      </div>
      <action-button
        button-class="button button-active"
        :text="$t('treasury.powercard.btnRemoveThePowercard')"
        @button-click="handleRemoveCard"
      />
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import ActionButton from '@/components/buttons/action-button.vue';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import ProgressLoader from '@/components/statements/progress-loader.vue';

export default Vue.extend({
  name: 'TreasuryPowercardManage',
  components: {
    CustomPicture,
    ActionButton,
    ProgressLoader,
    SecondaryPageSimpleTitle,
    SecondaryPage
  },
  data() {
    return {
      powercard: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: require('@/assets/images/Powercard@1x.png'),
        sources: [
          { src: require('@/assets/images/Powercard@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Powercard@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor
    };
  },
  computed: {
    status(): string {
      return 'Active';
    },
    remainingTime(): string {
      return '27 days';
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    },
    handleRemoveCard(): void {
      //TODO
    }
  }
});
</script>
