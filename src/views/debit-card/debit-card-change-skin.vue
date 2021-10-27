<template>
  <secondary-page
    has-back-button
    :title="$t('debitCard.changeSkin.lblChangeSkin')"
    @back="handleBack"
  >
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'DebitCardChangeSkin',
  components: {
    SecondaryPage
  },
  computed: {
    ...mapState('debitCard', {
      currentSkin: 'cardSkin',
      availableSkins: 'availableSkins'
    })
  },
  methods: {
    handleBack(): void {
      this.$router.replace({ name: 'debit-card-manage' });
    }
  }
});
</script>
