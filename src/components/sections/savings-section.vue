<template>
  <heading-section
    class="general-desktop__menu-wrapper-item"
    container-class="general-desktop__menu-wrapper-item-info"
    has-expand-button
    :name="$t('savings.lblSavings')"
    navigate-to-name="savings-manage"
  >
    <template v-slot:heading>
      {{ $t('savings.lblSavingsHeader', { amount: savingsBalanceNative }) }}
    </template>

    <p>
      {{
        $t('savings.lblSavingsEarnedTodaySection', {
          amount: amountEarnedToday
        })
      }}
    </p>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import HeadingSection from './heading-section.vue';

export default Vue.extend({
  name: 'SavingsSection',
  components: {
    HeadingSection
  },
  data() {
    return {
      amountEarnedToday: '+$24.89'
    };
  },
  computed: {
    ...mapGetters('account', {
      savingsBalanceNative: 'savingsInfoBalanceNative'
    })
  }
});
</script>
