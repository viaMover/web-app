<template>
  <div class="wallet">
    <div class="connect">
      <img alt="imageprofile" :src="'https://linkpicture.com/q/Group-6.png'" />
      <div class="content">
        <div class="label">
          <span class="id">0xf13</span>
          <img
            alt="arrow-down"
            class="arrow"
            src="@/assets/images/arrow-down.svg"
          />
        </div>
        <span class="disconnect">{{ $t('lblDisconnect') }}</span>
      </div>
    </div>
    <div class="input">
      <label for="wallet_address">{{ $t('lblWallet') }}</label>
      <select
        id="wallet_address"
        :value="currentAddress"
        @change="handleAddressChanged"
      >
        <option disabled :value="null">{{ $t('lblConnectWallet') }}</option>
        <option
          v-for="address in accountAddresses"
          :key="address"
          :value="address"
        >
          {{ address }}
        </option>
      </select>

      <button v-if="!provider" @click="connectMetaMask()">
        {{ metaMaskBtnText }}
      </button>
      <button v-if="!provider" @click="connectWalletConnect()">
        WalletConnect
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations, mapState } from 'vuex';
import Vue from 'vue';

import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { InitWalletPayload } from '@/store/modules/account/actions/wallet';
import { InitCallbacks } from '@/web3/callbacks';

export default Vue.extend({
  name: 'WalletHeader',
  computed: {
    ...mapState('account', [
      'detectedProvider',
      'provider',
      'addresses',
      'currentAddress'
    ]),
    metaMaskBtnText(): string {
      return this.detectedProvider ? 'Connect MetaMask' : 'Install MetaMask';
    },
    accountAddresses(): Array<string> {
      return this.addresses;
    }
  },
  methods: {
    ...mapMutations('account', {
      setCurrentWallet: 'setCurrentWallet'
    }),
    ...mapActions('account', {
      refreshWallet: 'refreshWallet',
      initWallet: 'initWallet'
    }),
    handleAddressChanged(address: string): void {
      this.setCurrentWallet(address);
      this.refreshWallet();
      this.$emit('selected-address-changed', address);
    },
    async connectWalletConnect(): Promise<void> {
      //  Create WalletConnect Provider
      const provider = new WalletConnectProvider({
        infuraId: 'eac548bd478143d09d2c090d09251bf1'
      });
      await provider.enable();
      const providerWithCb = await InitCallbacks(this.detectedProvider);

      //  Enable session (triggers QR Code modal)
      this.initWallet({
        provider: providerWithCb.provider,
        providerName: 'WalletConnect',
        providerBeforeCloseCb: providerWithCb.onDisconnectCb,
        injected: false
      } as InitWalletPayload);
    },
    async connectMetaMask(): Promise<void> {
      if (this.detectedProvider) {
        await this.detectedProvider.enable();
        const providerWithCb = await InitCallbacks(this.detectedProvider);
        this.initWallet({
          provider: providerWithCb.provider,
          providerName: 'MetaMask',
          providerBeforeCloseCb: providerWithCb.onDisconnectCb,
          injected: false
        } as InitWalletPayload);
      } else {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
      }
    }
  }
});
</script>
