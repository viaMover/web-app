<template>
  <div v-if="useClickEvent" class="link-icon" @click.prevent="handleClick">
    <img
      :alt="$t('icon.txtNavigationLinkAlt')"
      src="@/assets/images/link-icon.png"
    />
  </div>
  <router-link
    v-else
    v-slot="{ navigate, route }"
    custom
    :to="{ name: navigateToName }"
  >
    <div class="link-icon button-active" @click.prevent="navigate(route)">
      <img
        :alt="$t('icon.txtNavigationLinkAlt')"
        src="@/assets/images/link-icon.png"
      />
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SectionBaseLink',
  props: {
    navigateToName: {
      type: String,
      default: ''
    },
    useClickEvent: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('navigation-click');
    }
  }
});
</script>
