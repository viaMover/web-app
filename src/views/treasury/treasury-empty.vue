<template>
  <secondary-page :title="$t('treasury.lblTreasury')">
    <template v-slot:title>
      <secondary-page-title
        :icon="$t('treasury.icon')"
        :title="$t('treasury.lblTreasury')"
        wrapper-class="smart-treasury__menu-wrapper-title"
      >
        <template v-slot:context-menu>
          <context-button :popover-parent-id="popoverParentId">
            <context-button-item
              :text="$t('treasury.btnDeposit.emoji')"
              @click="handleIncreaseBoostClick"
            />
            <context-button-item
              :text="$t('treasury.btnWithdraw.emoji')"
              @click="handleDecreaseBoostClick"
            />
            <context-button-item
              :text="$t('treasury.btnClaimAndBurn.emoji')"
              @click="handleClaimAndBurnClick"
            />
          </context-button>
        </template>
      </secondary-page-title>
    </template>
    <div class="smart-treasury__menu-wrapper-empty">
      <span class="icon">🐷</span>
      <h2>{{ $t('treasury.lblNothingInTreasury') }}</h2>
      <p>{{ $t('treasury.txtNothingInTreasury') }}</p>
      <action-button
        button-class="black-link button-active"
        @button-click="toggleIncreaseBoost"
      >
        {{ $t('treasury.btnDeposit.emoji') }}
      </action-button>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { toggleSingleItem } from '@/components/toggle/toggle-root';

import {
  ActionButton,
  ContextButton,
  ContextButtonItem
} from '@/components/buttons';
import { SecondaryPage, SecondaryPageTitle } from '../../components/layout';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  name: 'TreasuryEmpty',
  components: {
    SecondaryPage,
    SecondaryPageTitle,
    ContextButton,
    ContextButtonItem,
    ActionButton
  },
  data() {
    return {
      popoverParentId: 'treasury-empty-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', { hasActiveTreasury: 'hasActiveTreasury' })
  },
  watch: {
    hasActiveTreasury(newVal: boolean) {
      if (newVal) {
        this.replaceActiveTreasuryRoute();
      }
    }
  },
  beforeMount() {
    if (this.hasActiveTreasury) {
      this.replaceActiveTreasuryRoute();
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    replaceActiveTreasuryRoute(): void {
      this.$router.replace({
        name: 'treasury-manage'
      });
    },
    toggleIncreaseBoost(): void {
      this.setModalIsDisplayed({
        id: ModalType.TreasuryIncreaseBoost,
        value: true
      });
    },
    handleIncreaseBoostClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({
        id: ModalType.TreasuryIncreaseBoost,
        value: true
      });
    },
    handleDecreaseBoostClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({
        id: ModalType.TreasuryDecreaseBoost,
        value: true
      });
    },
    handleClaimAndBurnClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({
        id: ModalType.TreasuryClaimAndBurn,
        value: true
      });
    }
  }
});
</script>

<style scoped></style>
