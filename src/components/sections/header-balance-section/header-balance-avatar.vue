<template>
  <div class="user" :class="userClass" @click="toggleAvatar">
    <span v-if="avatar.type === 'symbol'" class="icon">{{
      avatar ? avatar.symbol : ''
    }}</span>
    <img v-else :alt="avatar.imageAlt" :src="avatar.imageSrc" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Avatar } from '@/store/modules/account/types';

export default Vue.extend({
  name: 'HeaderBalanceAvatar',
  computed: {
    ...mapState('account', { avatar: 'avatar' }),
    userClass(): string {
      return (this.avatar as Avatar | undefined)?.className ?? 'user-icon';
    }
  },
  methods: {
    ...mapActions('account', { toggleAvatar: 'toggleAvatar' })
  }
});
</script>
