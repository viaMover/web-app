<template>
  <transition-group class="masthead" name="list-transition" tag="nav">
    <router-link
      v-for="tab in orderedTabs"
      :key="tab.id"
      class="tab"
      :to="tab.to"
    >
      {{ tab.emoji }}
    </router-link>
  </transition-group>
</template>

<script lang="ts">
import Vue from 'vue';
import { Location } from 'vue-router';

type TabConfigEntry = {
  id: string;
  emoji: string;
  to: Location;
};

export default Vue.extend({
  name: 'TheMasthead',
  data() {
    return {
      tabs: [
        {
          id: 'home',
          emoji: '🎒',
          to: { name: 'home' }
        },
        { id: 'account', emoji: '👨🏻', to: { name: 'account' } },
        { id: 'settings', emoji: '⚙️', to: { name: 'settings' } }
      ] as Array<TabConfigEntry>
    };
  },
  computed: {
    activeTab(): TabConfigEntry {
      return (
        this.tabs.find((tab) => tab.to.name === this.$route.name) ??
        this.tabs[0]
      );
    },
    orderedTabs(): Array<TabConfigEntry> {
      let ordered = new Array<TabConfigEntry>(this.tabs.length);
      const activeTabIdx = this.tabs.findIndex(
        (tab) => tab.id === this.activeTab.id
      );
      for (let i = 0; i < ordered.length; i++) {
        ordered[i] = this.tabs[(i + activeTabIdx) % ordered.length];
      }

      return ordered;
    }
  }
});
</script>
