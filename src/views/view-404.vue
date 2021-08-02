<template>
  <main>
    <router-link class="logo" :to="{ name: 'home' }">
      <img alt="logo" src="@/assets/images/logo.svg" />
    </router-link>
    <div class="general-no-wallet-desktop">
      <div class="g-wrapper">
        <div class="general-no-wallet-desktop__wrapper">
          <p>Nothing here, sorry</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'View404'
});
</script>
