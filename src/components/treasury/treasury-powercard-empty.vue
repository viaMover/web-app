<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="$t('treasury.powercard.txtThePowercardPageDescription')"
        :title="$t('treasury.powercard.lblThePowercard')"
      />
      <custom-picture
        :alt="powercard.alt"
        class="margin-top-80"
        :sources="powercard.sources"
        :src="powercard.src"
        :webp-sources="powercard.webpSources"
      />
      <p class="margin-top-40 medium gray">
        {{ $t('treasury.powercard.lblIfYouActivateCard') }}
      </p>
    </div>
    <div class="treasury__menu-wrapper-body margin-top-20">
      <div class="line">
        <div>
          <span class="title">{{ additionalBoost }}</span>
          <p class="description black">
            {{ $t('treasury.powercard.lblAdditionalBoost') }}
          </p>
        </div>
        <div>
          <span class="title">{{ activeTime }}</span>
          <p class="description black">
            {{ $t('treasury.powercard.lblActive') }}
          </p>
        </div>
        <div>
          <span class="title">{{ cooldownTime }}</span>
          <p class="description black">
            {{ $t('treasury.powercard.lblCooldown') }}
          </p>
        </div>
      </div>
      <action-button
        button-class="button button-active"
        :text="$t('treasury.powercard.btnActivateThePowercard')"
        @button-click="handleActivateCard"
      />
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { ActionButton } from '@/components/buttons';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';

export default Vue.extend({
  name: 'TreasuryPowercardEmpty',
  components: {
    CustomPicture,
    ActionButton,
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
    additionalBoost(): string {
      return `2x`;
    },
    cooldownTime(): string {
      return `60 days`;
    },
    activeTime(): string {
      return `30 days`;
    }
  },
  methods: {
    handleActivateCard(): void {
      //TODO
    },
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
