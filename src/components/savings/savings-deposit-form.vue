<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="deposit_in_savings-title"
        :description="$t('savings.deposit.txtDepositDescription')"
        :title="$t('savings.deposit.lblDepositInSavings')"
      />
    </div>
    <div class="deposit_in_savings-body">
      <h2>{{ $t('savings.deposit.lblWhatDoWeDeposit') }}</h2>
      <div class="deposit__info">
        <token-image
          :address="selectedToken ? selectedToken.address : ''"
          :src="selectedToken ? selectedToken.logo : ''"
          :symbol="selectedToken ? selectedToken.symbol : ''"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ selectedToken ? selectedToken.name : '' }}
            <span>
              {{ selectedToken ? selectedToken.symbol : '' }}
            </span>
          </p>
        </div>
        <button
          class="button-active button-arrow"
          type="button"
          @click.capture.stop.prevent="handleOpenSelectModal"
        >
          <arrow-down-icon stroke="#fff" />
        </button>
      </div>
      <div class="deposit__available">
        <p>
          {{ $t('savings.deposit.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="deposit__description">
        <p>
          {{
            isSelectedUSDCToken
              ? $t('savings.deposit.txtUSDCCoinIsAStable')
              : $t('savings.deposit.txtAssetWillBeConverted')
          }}
        </p>
      </div>
      <form action="#" autocomplete="off" class="deposit__form">
        <p>
          {{ $t('savings.deposit.lblAmountWeDepositIn') }}
          <span
            class="deposit__form-button"
            @click.capture.stop.prevent="swapSelectedDepositIn"
          >
            {{ selectedDepositIn }}
          </span>
        </p>
        <input
          v-model.trim="amountToDeposit"
          class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          type="text"
        />
        <span>{{ selectedDepositIn }}</span>
        <div v-if="isShowSwappingBlock" class="deposit__form-swap">
          <p>
            {{ $t('savings.deposit.lblSwappingFor') }}
            <picture>
              <img alt="" src="@/assets/images/coin-icon1.png" />
            </picture>
            <span>{{ formattedNativeTotal }}</span>
          </p>
        </div>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleTxReview"
        >
          {{
            isButtonActive
              ? $t('savings.lblReviewTransaction')
              : $t('savings.lblChooseAmount')
          }}
        </action-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { TokenWithBalance } from '@/wallet/types';
import { formatToDecimals, formatToNative } from '@/utils/format';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  isFinite,
  isNaN,
  notZero
} from '@/utils/bigmath';
import { Modal as ModalType } from '@/store/modules/modals/types';

import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import { ArrowDownIcon } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

export default Vue.extend({
  name: 'SavingsDepositForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton,
    ArrowDownIcon
  },
  data() {
    return {
      selectedDepositIn: 'USDC' as string,
      amountToDeposit: '' as string,
      selectedToken: undefined as TokenWithBalance | undefined
    };
  },
  computed: {
    ...mapState('account', ['tokens']),
    isSelectedUSDCToken(): boolean {
      //TODO find some best way
      return (
        this.selectedToken !== undefined && this.selectedToken.name === 'USDc'
      );
    },
    isShowSwappingBlock(): boolean {
      if (this.isSelectedUSDCToken) {
        return false;
      } else {
        return this.selectedDepositIn !== 'USDC';
      }
    },
    isButtonActive(): boolean {
      return (
        this.selectedToken !== undefined &&
        this.amountToDeposit !== '' &&
        !isNaN(this.amountToDeposit) &&
        notZero(this.amountToDeposit) &&
        isFinite(this.amountToDeposit)
      );
    },
    formattedMaxAmount(): string {
      if (this.selectedToken === undefined) {
        return `0`;
      }

      return `${formatToDecimals(this.selectedToken.balance, 4)} ${
        this.selectedToken.symbol
      }`;
    },
    formattedNativeTotal(): string {
      if (this.selectedToken === undefined) {
        return '0';
      }
      const native = convertNativeAmountFromAmount(
        this.amountToDeposit,
        this.selectedToken.priceUSD
      );

      if (native === 'NaN') {
        return '0 USDC';
      } else {
        return `${formatToNative(native)} USDC`;
      }
    }
  },
  mounted() {
    const eth = this.tokens.find((t: TokenWithBalance) => t.address === 'eth');
    if (eth) {
      this.selectedToken = eth;
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleTxReview(): void {
      if (this.selectedToken === undefined) {
        return;
      }
      let nativeAmount = '';
      let amount = '';

      if (this.isSelectedUSDCToken) {
        nativeAmount = this.amountToDeposit;
        amount = this.amountToDeposit;
      } else {
        if (this.selectedDepositIn === 'USDC') {
          nativeAmount = this.amountToDeposit;
          amount = convertAmountFromNativeValue(
            this.amountToDeposit,
            this.selectedToken.priceUSD,
            this.selectedToken.decimals
          );
        } else {
          amount = this.amountToDeposit;
          nativeAmount = convertNativeAmountFromAmount(
            this.amountToDeposit,
            this.selectedToken.priceUSD
          );
        }
      }

      this.$emit('tx-review', {
        selectedToken: this.selectedToken,
        amountToDeposit: amount,
        nativeAmountToDeposit: nativeAmount,
        selectedDepositIn: this.selectedDepositIn
      });
    },
    swapSelectedDepositIn(): void {
      if (this.selectedDepositIn === 'USDC') {
        if (this.selectedToken !== undefined) {
          if (this.isSelectedUSDCToken) {
            return;
          }

          this.selectedDepositIn = this.selectedToken.symbol;
          this.amountToDeposit = convertAmountFromNativeValue(
            this.amountToDeposit,
            this.selectedToken.priceUSD,
            this.selectedToken.decimals
          );
        }
      } else {
        this.selectedDepositIn = 'USDC';
        if (this.selectedToken !== undefined) {
          this.amountToDeposit = convertNativeAmountFromAmount(
            this.amountToDeposit,
            this.selectedToken.priceUSD
          );
        }
      }

      if (this.amountToDeposit === 'NaN') {
        this.amountToDeposit = '0';
      }
    },
    handleSelectMaxAmount(): void {
      if (!this.selectedToken) {
        return;
      }
      if (this.selectedDepositIn === 'USDC') {
        this.amountToDeposit = convertNativeAmountFromAmount(
          this.selectedToken.balance,
          this.selectedToken.priceUSD
        );
      } else {
        this.amountToDeposit = this.selectedToken.balance;
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setIsModalDisplayed({
        id: ModalType.SearchToken,
        value: true
      });

      if (token === undefined) {
        return;
      } else {
        this.selectedToken = token;
      }
      this.amountToDeposit = '';

      if (
        this.selectedDepositIn !== 'USDC' &&
        this.selectedToken !== undefined
      ) {
        this.selectedDepositIn = this.selectedToken.symbol;
      } else {
        this.selectedDepositIn = 'USDC';
      }
    }
  }
});
</script>
