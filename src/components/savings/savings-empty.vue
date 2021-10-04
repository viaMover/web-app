<template>
  <secondary-page>
    <savings-yearly-chart-wrapper>
      <template v-slot:title>
        <span class="title">{{ title }}</span>
        <p>{{ $t('savings.txtYouCouldApproximately') }}</p>
      </template>
      <p>{{ $t('savings.txtIfYouDeposit') }}</p>
    </savings-yearly-chart-wrapper>
    <div class="savings__menu-wrapper-body">
      <span class="title">{{ currentVariableAPY }}</span>
      <p class="description">{{ $t('savings.lblAPYOnAllSavings') }}</p>
      <action-button
        button-class="button button-active"
        :text="$t('savings.lblStartSaving')"
      />
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { Modal as ModalType } from '@/store/modules/modals/types';
import { divide, multiply } from '@/utils/bigmath';
import { formatPercents, formatToNative } from '@/utils/format';

import ActionButton from '@/components/buttons/action-button.vue';
import SavingsYearlyChartWrapper from '@/components/savings/savings-yearly-chart-wrapper.vue';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

import { SecondaryPage } from '../../components/layout';

export default Vue.extend({
  name: 'SavingsEmpty',
  components: {
    ActionButton,
    SavingsYearlyChartWrapper,
    SecondaryPage
  },
  data() {
    return {
      popoverParentId: 'savings-empty-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', { hasActiveSavings: 'hasActiveSavings' }),
    ...mapState('account', { apy: 'savingsAPY' }),
    title(): string {
      const apyNative = multiply(divide(this.apy, '100'), '10000');
      return `~ $${formatToNative(apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    }
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
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    replaceActiveSavingsRoute(): void {
      this.$router.replace({
        name: 'savings-manage'
      });
    },
    toggleDeposit(): void {
      this.setModalIsDisplayed({
        id: ModalType.SavingsDeposit,
        value: true,
        payload: {}
      });
    },
    handleDepositClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({
        id: ModalType.SavingsDeposit,
        value: true,
        payload: {}
      });
    }
  }
});
</script>
