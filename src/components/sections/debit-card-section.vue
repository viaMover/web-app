<template>
  <card
    :button-text="$t('debitCard.btnOrderDebitCard')"
    :description="$t('debitCard.txtDebitCard')"
    :icon="$t('debitCard.icon')"
    :image="image"
    :opened="isInfoVisible"
    :title="$t('debitCard.lblDebitCardHeading')"
    wrapper-class="general-desktop__menu-wrapper-order"
    @button-click="handleButtonClick"
    @close="toggleInfo"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { Card } from '@/components/controls';

import { PictureDescriptor } from '../html5';

export default Vue.extend({
  name: 'DebitCardSection',
  components: {
    Card
  },
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    ...mapState('account', { isInfoVisible: 'isDebitCardSectionVisible' }),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    }),
    image(): PictureDescriptor {
      return this.currentSkin.picture;
    }
  },
  async mounted() {
    this.isLoading = true;
    await this.loadCurrentSkin();
    this.isLoading = false;
  },
  methods: {
    ...mapActions('account', { toggleInfo: 'toggleIsDebitCardSectionVisible' }),
    ...mapActions('debitCard', {
      loadCurrentSkin: 'loadCurrentSkin'
    }),
    handleButtonClick(): void {
      this.$router.push({ name: 'debit-card-manage' });
    }
  }
});
</script>
