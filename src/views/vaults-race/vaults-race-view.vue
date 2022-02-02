<template>
  <shop-wrapper has-close-button @close="handleClose">
    <template v-slot:info>
      <h1 class="info__title">{{ $t('vaultsRace.lblRollDice') }}</h1>
      <p class="info__description">
        {{ $t('vaultsRace.txtPageDescriptionPartOne') }}
      </p>
      <shop-list>
        <shop-list-item
          :title="$t('vaultsRace.lblAccountNumber')"
          :value="item ? item.address : ''"
        />
        <shop-list-item
          :title="$t('vaultsRace.lblCurrentScore')"
          :value="item ? item.score : ''"
        />
        <shop-list-item
          :title="$t('vaultsRace.lblOpenSeaCollection')"
          value="view"
        />
      </shop-list>
      <action-button
        class="primary"
        :text="$t('vaultsRace.btn.rollDice')"
        @button-click="handleRoll"
      />
      <div v-if="error !== undefined" class="error-message">
        {{ error }}
      </div>
    </template>
    <template v-slot:illustration>
      <video
        autoplay="autoplay"
        class="moving-with-olympus"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
      >
        <source
          src="https://storage.googleapis.com/movermedia/OL_MOV_FIN.mp4"
          type="video/mp4"
        />
      </video>
    </template>
  </shop-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { VaultRaceAccount } from '@/store/modules/games/types';

import ActionButton from '@/components/buttons/action-button.vue';
import ShopList from '@/components/layout/shop-wrapper/shop-list/shop-list.vue';
import ShopListItem from '@/components/layout/shop-wrapper/shop-list/shop-list-item.vue';
import ShopWrapper from '@/components/layout/shop-wrapper/shop-wrapper.vue';

export default Vue.extend({
  name: 'VaultsRaceView',
  components: { ActionButton, ShopListItem, ShopList, ShopWrapper },
  data() {
    return {
      error: undefined as string | undefined
    };
  },
  computed: {
    ...mapGetters('games', ['vaultsRaceAccount']),
    item(): VaultRaceAccount {
      return this.vaultsRaceAccount(this.$route.params.address);
    }
  },
  methods: {
    handleRoll(): void {
      //TODO
    },
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
