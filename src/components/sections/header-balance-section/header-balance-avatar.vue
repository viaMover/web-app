<template>
  <pu-skeleton
    v-if="avatar === undefined"
    circle
    class="avatar button-like"
    tag="div"
  />
  <div
    v-else
    class="avatar button-like"
    :style="avatarStyle"
    @click="toggleAvatar"
  >
    <span v-if="avatar.type === 'symbol'" class="icon">
      {{ avatar.symbol }}
    </span>
    <img
      v-else
      :alt="avatar.imageAlt"
      class="image"
      :src="avatar.imageSrc"
      :style="imageStyle"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Properties as CSSProperties } from 'csstype';

export default Vue.extend({
  name: 'HeaderBalanceAvatar',
  computed: {
    ...mapState('account', { avatar: 'avatar' }),
    avatarStyle(): CSSProperties {
      if (this.avatar === undefined) {
        return {};
      }

      // TODO: Remove this compatibility patch
      if (this.avatar.color === undefined) {
        this.toggleAvatar();
      }

      return {
        backgroundColor: this.avatar.color,
        boxShadow: `0 0 10px 0 ${this.avatar.color}`
      };
    },
    imageStyle(): CSSProperties {
      if (this.avatar === undefined || this.avatar.type === 'symbol') {
        return {};
      }

      return {
        filter: `drop-shadow(0 0 10px ${this.avatar.color})`
      };
    }
  },
  methods: {
    ...mapActions('account', { toggleAvatar: 'toggleAvatar' })
  }
});
</script>
