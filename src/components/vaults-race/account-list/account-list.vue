<template>
  <div>
    <h2 v-if="title !== ''">
      <slot name="title">{{ title }}</slot>
    </h2>
    <div class="list">
      <account-list-item
        v-for="item in items"
        :key="item.address"
        :button-text="buttonText(item)"
        :description="descriptionText(item)"
        :disabled-button="!item.allowRoll"
        :icon="icon"
        :tag-text="tagText(item)"
        :title="titleText(item)"
        @button-click="handleButton(item)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { VaultRaceAccount } from '@/store/modules/games/types';

import AccountListItem from '@/components/vaults-race/account-list/account-list-item.vue';

export default Vue.extend({
  name: 'AccountList',
  components: {
    AccountListItem
  },
  props: {
    items: {
      type: Array as PropType<Array<VaultRaceAccount>>,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleButton(item: VaultRaceAccount): void {
      this.$emit('button-click', item);
    },
    buttonText(item: VaultRaceAccount): string {
      return (
        item.allowRoll
          ? this.$t('vaultsRace.btn.rollDice')
          : this.$t('vaultsRace.btn.comeBackTomorrow')
      ) as string;
    },
    titleText(item: VaultRaceAccount): string {
      return `Account ${item.address}`;
    },
    descriptionText(item: VaultRaceAccount): string {
      return `${item.points} Points`;
    },
    tagText(item: VaultRaceAccount): string {
      return `#${item.position} Position`;
    }
  }
});
</script>
