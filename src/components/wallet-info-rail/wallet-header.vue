<template>
  <div class="header">
    <div class="input">
      <label for="wallet_address">{{ $t('lblWallet') }}</label>
      <select
        id="wallet_address"
        name="wallet address"
        :value="currentAddress"
        @change="handleAddressChanged"
      >
        <option disabled :value="null">{{ $t('lblSelectWallet') }}</option>
        <option v-for="address in addresses" :key="address" :value="address">
          {{ address }}
        </option>
      </select>

      <button v-if="!web3" @click="connectMetaMask()">
        {{ metaMaskBtnText }}
      </button>
      <button v-if="!web3" @click="connectWalletConnect()">
        WalletConnect
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations, mapState } from 'vuex';
import Vue from 'vue';
import Web3 from 'web3';
import { provider } from 'web3-core';

import { AccountData } from '@/store/modules/account/types';
import MetaMaskOnboarding from '@metamask/onboarding';
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';

export default Vue.extend({
  name: 'WalletHeader',
  props: {
    currentAddress: {
      type: String,
      required: false
    },
    addresses: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      metaMaskBtnText: '' as string,
      metaMaskProvider: null as null | unknown,
      metaMaskDetecting: true as boolean
    };
  },
  computed: {
    ...mapState('account', ['web3'])
  },
  mounted() {
    (async () => {
      this.metaMaskDetecting = true;
      this.metaMaskBtnText = 'Detecting MetaMask';
      this.metaMaskProvider = await detectEthereumProvider({
        mustBeMetaMask: true
      });
      if (this.metaMaskProvider) {
        this.metaMaskBtnText = 'Connect MetaMask';
      } else {
        this.metaMaskBtnText = 'Install MetaMask';
      }
      this.metaMaskDetecting = false;
    })();
  },
  methods: {
    ...mapMutations('account', {
      setAccountData: 'setAccountData',
      setCurrentWallet: 'setCurrentWallet',
      setProviderBeforeCloseCb: 'setProviderBeforeCloseCb'
    }),
    ...mapActions('account', {
      clearProvider: 'clearProvider'
    }),
    handleAddressChanged(address: string): void {
      this.$emit('selected-address-changed', address);
    },
    async connectWalletConnect(): Promise<void> {
      //  Create WalletConnect Provider
      const provider = new WalletConnectProvider({
        infuraId: 'eac548bd478143d09d2c090d09251bf1'
      });
      //  Enable session (triggers QR Code modal)
      await provider.enable();
      this.webConnect(provider as unknown as provider, false);
    },
    async connectMetaMask(): Promise<void> {
      if (this.metaMaskDetecting) {
        return;
      }
      if (this.metaMaskProvider) {
        const provider = this.metaMaskProvider as any;

        await this.webConnect(provider, true);

        const chainChangedHandler = () => {
          console.log('MetaMask - chain has been chainged! Reloading page...');
          window.location.reload();
        };

        const disconnectHandler = () => {
          console.log('MetaMask - has been disconnected! Reloading page...');
          window.location.reload();
        };

        const accountsChangedHandler = async (accounts: Array<string>) => {
          console.log('MetaMask - accounts array has been changed!', accounts);

          if (accounts.length === 0) {
            this.clearProvider();
          } else if (accounts[0] !== this.currentAddress) {
            const accData = await this.getAccountData(this.web3, true);
            this.setAccountData(accData);
            this.setCurrentWallet(accounts[0]);
          }
        };

        provider.on('chainChanged', chainChangedHandler);
        provider.on('disconnect', disconnectHandler);
        provider.on('accountsChanged', accountsChangedHandler);

        this.setProviderBeforeCloseCb(() => {
          console.log(provider);
          provider.removeListener('chainChanged', chainChangedHandler);
          provider.removeListener('disconnect', disconnectHandler);
          provider.removeListener('accountsChanged', accountsChangedHandler);
        });
      } else {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
      }
    },
    async getAccountData(
      web3Inst: Web3,
      useRequest: boolean
    ): Promise<AccountData> {
      let accounts;
      if (useRequest) {
        accounts = await web3Inst.eth.requestAccounts();
      } else {
        accounts = await web3Inst.eth.getAccounts();
      }
      console.log('accounts: ', accounts);
      let balance = '';
      if (accounts) {
        balance = await web3Inst.eth.getBalance(accounts[0]);
      }
      console.log('balance:', balance);
      const chainId = await web3Inst.eth.getChainId();
      return {
        addresses: accounts,
        web3Inst: web3Inst,
        balance: balance,
        networkId: chainId
      } as AccountData;
    },
    async webConnect(provider: provider, injected: boolean): Promise<void> {
      try {
        const web3Inst = new Web3(provider);

        const accData = await this.getAccountData(web3Inst, injected);

        this.setAccountData(accData);
      } catch (err) {
        console.log('User cancelled');
        console.log(err);
      }
    }
  }
});
</script>
