<template>
  <div>
    <label class="form-label" :for="inputId">
      {{ labelText }}
    </label>
    <base-dropdown
      has-custom-option
      has-custom-selected-option
      :input-id="inputId"
      label="fullDisplayedName"
      :options="supportedNetworks"
      :value="currentNetworkInfo"
      @input="handleInput"
    >
      <template v-slot:option="network">
        <token-image
          :address="network.baseAsset.address"
          hide-shadow
          :src="network.baseAsset.iconURL"
          :symbol="network.baseAsset.symbol"
        />
        <span class="network-name">
          {{
            network.fullDisplayedName ? network.fullDisplayedName : network.name
          }}
        </span>
      </template>
      <template v-slot:selected-option="network">
        <token-image
          :address="network.baseAsset.address"
          hide-shadow
          :src="network.baseAsset.iconURL"
          :symbol="network.baseAsset.symbol"
        />
        <span class="network-name">
          {{
            network.fullDisplayedName ? network.fullDisplayedName : network.name
          }}
        </span>
      </template>
    </base-dropdown>
    <p class="form-text">
      <slot>{{ descriptionText }}</slot>
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';

import { getNetwork, Network, NetworkInfo } from '@/utils/networkTypes';

import TokenImage from '@/components/tokens/token-image.vue';
import BaseDropdown from '@/components/v1.2/base-dropdown.vue';

export default Vue.extend({
  name: 'NetworkSelector',
  components: {
    TokenImage,
    BaseDropdown
  },
  props: {
    value: {
      type: String as PropType<Network>
    },
    networks: {
      type: Array as PropType<Array<Network> | undefined>,
      default: undefined
    },
    labelText: {
      type: String,
      required: true
    },
    inputId: {
      type: String,
      required: true
    },
    descriptionText: {
      type: String,
      default: undefined
    }
  },
  computed: {
    ...mapState('account', ['networkInfo', 'availableNetworks']),
    currentNetworkInfo(): NetworkInfo {
      return getNetwork(this.value) ?? this.networkInfo;
    },
    supportedNetworks(): Array<NetworkInfo> {
      if (this.networks !== undefined && this.networks.length > 0) {
        return this.mapNetworks(this.networks);
      }

      return this.mapNetworks(this.availableNetworks);
    }
  },
  methods: {
    handleInput(item: NetworkInfo): void {
      this.$emit('input', item.network);
    },
    mapNetworks(networks: Array<Network>): Array<NetworkInfo> {
      return networks
        .map((n) => getNetwork(n))
        .filter((n): n is NetworkInfo => n !== undefined);
    }
  }
});
</script>
