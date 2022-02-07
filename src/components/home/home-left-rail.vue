<template>
  <aside class="left-rail history wallet">
    <div class="wrapper">
      <div class="button-group">
        <label class="button" :class="{ active: mode === DisplayMode.Wallet }">
          {{ $t('lblWallet') }}
          <input v-model="mode" type="radio" :value="DisplayMode.Wallet" />
        </label>

        <label class="button" :class="{ active: mode === DisplayMode.History }">
          {{ $t('lblHistory') }}
          <input v-model="mode" type="radio" :value="DisplayMode.History" />
        </label>
      </div>

      <transition mode="out-in" name="fade">
        <home-wallet v-if="mode === DisplayMode.Wallet" />
        <home-transactions-list v-else-if="mode === DisplayMode.History" />
      </transition>
    </div>
  </aside>
</template>

<script lang="ts">
import Vue from 'vue';

import HomeTransactionsList from './home-transactions-list/home-transactions-list.vue';
import HomeWallet from './home-wallet.vue';

enum DisplayMode {
  Wallet = 'wallet',
  History = 'history'
}

export default Vue.extend({
  name: 'HomeLeftRail',
  components: {
    HomeTransactionsList,
    HomeWallet
  },
  data() {
    return {
      DisplayMode,
      mode: DisplayMode.History as DisplayMode,
      modes: [DisplayMode.Wallet, DisplayMode.History]
    };
  }
});
</script>
