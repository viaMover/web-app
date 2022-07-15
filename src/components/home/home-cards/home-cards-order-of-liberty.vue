<template>
  <card
    :button-text="$t('orderOfLiberty.btnOrderOfLiberty')"
    class="order-of-liberty"
    :description="$t('orderOfLiberty.txtOrderOfLiberty')"
    :image="image"
    is-black-close-btn
    :opened="isVisible"
    :title="$t('orderOfLiberty.lblOrderOfLibertyHeading')"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Card } from '@/components/controls';
import { PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'HomeCardsOrderOfLiberty',
  components: {
    Card
  },
  data() {
    return {
      isLoading: false,
      image: {
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/order-of-liberty/home@1x.png',
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/order-of-liberty/home@2x.png',
            variant: '2x'
          }
        ],
        webpSources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/order-of-liberty/home@1x.webp'
          },
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/order-of-liberty/home@2x.webp',
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('account', { isVisible: 'isOrderOfLibertySectionVisible' })
  },
  methods: {
    ...mapActions('account', {
      toggleInfo: 'toggleIsOrderOfLibertySectionVisible'
    }),
    handleButtonClick(): void {
      this.$router.push({ name: 'the-order-of-liberty' });
    }
  }
});
</script>
