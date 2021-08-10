<template>
  <secondary-page :title="$t('savings.lblSavings')">
    <template v-slot:title>
      <secondary-page-title
        :icon="$t('savings.icon')"
        :title="$t('savings.lblSavings')"
        wrapper-class="savings__menu-wrapper-title"
      >
        <template v-slot:context-menu>
          <context-button :popover-parent-id="popoverParentId">
            <context-button-item
              :text="$t('savings.btnDeposit.emoji')"
              @click="handleDepositClick"
            />
          </context-button>
        </template>
      </secondary-page-title>
    </template>
    <div class="savings__menu-wrapper-empty">
      <span class="icon">💰</span>
      <h2>{{ $t('savings.lblNothingInSavings') }}</h2>
      <p>{{ $t('savings.txtNothingInSavings') }}</p>
      <action-button
        button-class="black-link button-active"
        @button-click="toggleDeposit"
      >
        {{ $t('savings.btnDeposit.emoji') }}
      </action-button>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';

import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal as ModalType } from '@/store/modules/modals/types';

import {
  ActionButton,
  ContextButton,
  ContextButtonItem
} from '@/components/buttons';
import { SecondaryPage, SecondaryPageTitle } from '../../components/layout';

export default Vue.extend({
  name: 'SavingsEmpty',
  components: {
    SecondaryPage,
    SecondaryPageTitle,
    ContextButton,
    ContextButtonItem,
    ActionButton
  },
  data() {
    return {
      popoverParentId: 'savings-empty-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', { hasActiveSavings: 'hasActiveSavings' })
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
      this.setModalIsDisplayed({ id: ModalType.SavingsDeposit, value: true });
    },
    handleDepositClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({ id: ModalType.SavingsDeposit, value: true });
    }
  }
});
</script>

<style scoped></style>
