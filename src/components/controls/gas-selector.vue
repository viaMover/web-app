<template>
  <div
    v-if="!isLoading"
    class="modal-wrapper-info-footer"
    @click="toggleGasPrice"
  >
    <div class="modal-wrapper-info-footer-left">
      <span>{{ networkFee }}</span>
      <p>{{ $t('gas.lblNetworkFee') }}</p>
    </div>
    <div class="modal-wrapper-info-footer-right">
      <div class="swiper-pagination-bullets">
        <span
          v-for="mode in avaialbleGasModes"
          :key="mode"
          class="swiper-pagination-bullet"
          :class="{
            'swiper-pagination-bullet-active': mode === selectedGasMode
          }"
        />
      </div>
      <p class="speed">
        {{ $t(`gas.lblSelector.${selectedGasMode}`) }}
      </p>
      <span>
        {{ gasPriceInGwei }}
        {{ estimatedTimeSign }}
        {{ estimatedTimeValue }}
        {{ estimatedTimeUnit }}
      </span>
    </div>
  </div>
  <div v-else>
    <div class="loader">Price is loading</div>
  </div>
</template>

<script lang="ts">
import { add, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';
import Web3 from 'web3';

export type GasMode = 'high' | 'low' | 'normal' | 'custom' | 'treasury';
export type GasModeData = {
  mode: GasMode;
  price: string;
  estTime: number;
};

export type GasPrice = {
  type: 'high' | 'low' | 'normal' | 'custom' | 'treasury';
  amount: number;
  txFee: {
    native: {
      value: {
        amount: number;
      };
    };
    value: {
      amount: number;
    };
  };
};

export default Vue.extend({
  name: 'GasSelector',
  props: {
    avaialbleGasModes: {
      type: Array as PropType<Array<GasMode>>,
      required: true
    },
    approveGasLimit: {
      type: String,
      default: '0'
    },
    txnGasLimit: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      selectedGasModeIndex: 0,
      isLoading: false
    };
  },
  computed: {
    ...mapState('account', ['gasPrices', 'ethPrice']),
    selectedGasMode(): GasMode {
      return this.avaialbleGasModes[this.selectedGasModeIndex];
    },
    selectedGasData(): GasModeData | undefined {
      if (this.gasPrices === undefined) {
        return undefined;
      }
      switch (this.selectedGasMode) {
        case 'low':
          return {
            mode: 'low',
            price: this.gasPrices.SafeGas.price,
            estTime: this.gasPrices.SafeGas.estTime
          };
        case 'normal':
          return {
            mode: 'normal',
            price: this.gasPrices.ProposeGas.price,
            estTime: this.gasPrices.ProposeGas.estTime
          };
        case 'high':
          return {
            mode: 'high',
            price: this.gasPrices.FastGas.price,
            estTime: this.gasPrices.FastGas.estTime
          };
        case 'treasury':
          return {
            mode: 'treasury',
            price: this.gasPrices.FastGas.price,
            estTime: this.gasPrices.FastGas.estTime
          };
      }
      return undefined;
    },
    nativeCurrencySymbol(): string {
      return '$';
    },
    gasPriceInGwei(): string {
      if (this.selectedGasData === undefined) {
        return 'No data';
      }

      return `${this.selectedGasData.price} Gwei`;
    },
    networkFee(): string {
      if (
        this.selectedGasData === undefined ||
        this.txnGasLimit === undefined ||
        this.ethPrice === undefined
      ) {
        return 'No data';
      }

      const selectedGasPriceInWEI = Web3.utils.toWei(
        this.selectedGasData.price,
        'Gwei'
      );

      let txnPriceInWEI = '0';
      if (this.selectedGasMode === 'treasury') {
        txnPriceInWEI = multiply(selectedGasPriceInWEI, this.approveGasLimit);
      } else {
        txnPriceInWEI = multiply(
          selectedGasPriceInWEI,
          add(this.txnGasLimit, this.approveGasLimit)
        );
      }
      const txnPriceInEth = Web3.utils.fromWei(txnPriceInWEI, 'ether');
      const txnPriceNative = multiply(txnPriceInEth, this.ethPrice);

      return `${this.nativeCurrencySymbol}${formatToNative(txnPriceNative)}`;
    },
    estimatedTimeValue(): string {
      if (this.selectedGasData === undefined) {
        return 'No data';
      }
      return String(this.selectedGasData.estTime);
    },
    estimatedTimeUnit(): string {
      return 'sec';
    },
    estimatedTimeSign(): string {
      return '~';
    }
  },
  methods: {
    toggleGasPrice() {
      this.selectedGasModeIndex =
        (this.selectedGasModeIndex + 1) % this.avaialbleGasModes.length;
      this.$nextTick(() => {
        if (this.selectedGasData !== undefined) {
          this.$emit('selected-gas-changed', this.selectedGasData);
        }
      });
    }
  }
});
</script>
