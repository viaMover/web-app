<template>
  <div>
    <slot v-if="hideTitle" name="title">
      <h2>
        {{ title }}
      </h2>
    </slot>
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

import AccountListItem from './account-list-item.vue';

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
    },
    hideTitle: {
      type: Boolean,
      default: false
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
      return this.$t('vaultsRace.lblAccount', {
        address: item.address
      }).toString();
    },
    descriptionText(item: VaultRaceAccount): string {
      return this.$t('vaultsRace.lblPoints', {
        points: item.points
      }).toString();
    },
    tagText(item: VaultRaceAccount): string {
      return this.$t('vaultsRace.lblPosition', {
        position: item.position
      }).toString();
    }
  }
});
</script>
