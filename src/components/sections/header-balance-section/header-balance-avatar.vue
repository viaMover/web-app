<template>
  <div class="user" :class="userClass" @click="toggleAvatar">
    <span class="icon">{{ avatar ? avatar.symbol : '' }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

export default Vue.extend({
  name: 'HeaderBalanceAvatar',
  computed: {
    ...mapState('account', { avatar: 'avatar' }),
    userClass(): string {
      return this.avatar?.className ?? 'user-icon';
    }
  },
  methods: {
    ...mapActions('account', { toggleAvatar: 'toggleAvatar' })
  }
});
</script>
