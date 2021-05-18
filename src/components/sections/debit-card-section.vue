<template>
  <heading-section
    class="section debit"
    has-expand-button
    :name="$t('lblDebitCard')"
    navigate-to-name="debit-card"
  >
    <template v-slot:heading>
      {{ $t('lblDebitCard') }}
    </template>

    <div class="body">
      <h3>{{ $t('lblDebitCardHeading') }}</h3>
      <p>{{ $t('txtDebitCard') }}</p>
      <div class="button-container">
        <action-button class="button-primary">
          {{ $t('btnOrderDebitCard') }}
        </action-button>
        <action-button class="button-primary round-icon">X</action-button>
        <div class="emoji right floating">🐐</div>
        <div class="clearfix"></div>
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
