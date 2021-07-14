<template>
  <secondary-page :title="$t('savings.lblSavings')">
    <div class="image">💰</div>
    <h2>{{ $t('savings.lblNothingInSavings') }}</h2>
    <p>{{ $t('savings.txtNothingInSavings') }}</p>
    <action-button @button-click="toggleDeposit">{{
      $t('savings.btnDeposit.emoji')
    }}</action-button>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { toggleSingleItem } from '@/components/toggle/toggle-root';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage } from '../../components/layout';
import { Modal } from '@/components/modals';

export default Vue.extend({
  name: 'SavingsEmpty',
  components: {
    SecondaryPage,
    ActionButton
  },
  computed: {
    ...mapGetters('account', ['hasActiveSavings'])
  },
  watch: {
    hasActiveSavings(newVal: boolean) {
      if (newVal) {
        this.replaceActiveSavingsRoute();
      }
    }
  },
  beforeMount() {
    if (this.hasActiveSavings) {
      this.replaceActiveSavingsRoute();
    }
  },
  methods: {
    replaceActiveSavingsRoute(): void {
      this.$router.replace({
        name: 'savingsManage'
      });
    },
    toggleDeposit(): void {
      toggleSingleItem(Modal.SavingsDeposit);
    }
  }
});
</script>

<style scoped></style>
