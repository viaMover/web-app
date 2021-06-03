<template>
  <heading-section
    class="section debit"
    has-expand-button
    :name="$t('debitCard.lblDebitCard')"
    navigate-to-name="debit-card"
  >
    <template v-slot:heading>
      {{ $t('debitCard.lblDebitCard') }}
    </template>

    <div class="body">
      <div>
        <div>
          <h3 class="heading">{{ $t('debitCard.lblDebitCardHeading') }}</h3>
          <p class="content">{{ $t('debitCard.txtDebitCard') }}</p>
        </div>
        <div class="emoji right floating">🐐</div>
      </div>

      <div class="button-container">
        <action-button class="button-primary">
          {{ $t('debitCard.btnOrderDebitCard') }}
        </action-button>
        <div class="cross-icon">
          <img src="@/assets/images/cross.svg" />
        </div>
      </div>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';
import ActionButton from '../buttons/action-button.vue';

export default Vue.extend({
  name: 'DebitCardSection',
  components: {
    HeadingSection,
    ActionButton
  }
});
</script>
