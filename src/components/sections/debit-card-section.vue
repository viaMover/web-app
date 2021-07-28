<template>
  <heading-section
    v-show="isInfoVisible"
    class="general-desktop__menu-wrapper-order"
    container-class="hellow"
    :name="$t('debitCard.lblDebitCard')"
  >
    <div class="order__info">
      <div class="order__info-description">
        <h2>{{ $t('debitCard.lblDebitCardHeading') }}</h2>
        <p>{{ $t('debitCard.txtDebitCard') }}</p>
      </div>
      <div class="order__info-icon"><span>💳</span></div>
    </div>
    <div class="order__buttons">
      <action-button class="black-link button-active">
        {{ $t('debitCard.btnOrderDebitCard') }}
      </action-button>
      <close-button @close="toggleInfo"></close-button>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import HeadingSection from './heading-section.vue';
import { ActionButton, CloseButton } from '@/components/buttons';

export default Vue.extend({
  name: 'DebitCardSection',
  components: {
    HeadingSection,
    ActionButton,
    CloseButton
  },
  computed: {
    ...mapState('account', { isInfoVisible: 'isDebitCardSectionVisible' })
  },
  methods: {
    ...mapActions('account', { toggleInfo: 'toggleIsDebitCardSectionVisible' })
  }
});
</script>
