<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="savings_secondary_page-title"
        :description="$t('savings.deposit.txtDepositDescription')"
        :title="$t('savings.deposit.lblDepositInSavings')"
      />
      <div class="savings_secondary_page-token-info">
        <span>~ $0.00</span>
        <p>{{ $t('savings.deposit.txtYouCouldEarnInYear') }}</p>
      </div>
    </div>
    <div class="savings_secondary_page-body">
      <h2>{{ $t('savings.deposit.lblWhatDoWeDeposit') }}</h2>
      <div class="info">
        <token-image
          :address="token ? token.address : ''"
          :src="token ? token.logo : ''"
          :symbol="token ? token.symbol : ''"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ token ? token.name : '' }}
            <span>
              {{ token ? token.symbol : '' }}
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
      <div class="available">
        <p>
          {{ $t('savings.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="description">
        <p>
          {{
            isSelectedUSDCToken
              ? $t('savings.txtUSDCCoinIsAStable')
              : $t('savings.deposit.txtAssetWillBeConverted')
          }}
        </p>
      </div>
      <form action="#" autocomplete="off" class="form">
        <p>
          {{ $t('savings.deposit.lblAmountWeDepositIn') }}
          <span
            class="form-button"
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
        <div v-if="isShowSwappingBlock" class="form-swap">
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
              : $t('savings.deposit.lblChooseAmount')
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
import { isUSDCAssetData } from '@/wallet/references/data';

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
      token: undefined as TokenWithBalance | undefined
    };
  },
  computed: {
    ...mapState('account', ['tokens', 'networkInfo']),
    isSelectedUSDCToken(): boolean {
      return isUSDCAssetData(
        this.networkInfo.network,
        this.token?.address ?? ''
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
        this.token !== undefined &&
        this.amountToDeposit !== '' &&
        !isNaN(this.amountToDeposit) &&
        notZero(this.amountToDeposit) &&
        isFinite(this.amountToDeposit)
      );
    },
    formattedMaxAmount(): string {
      if (this.token === undefined) {
        return `0`;
      }

      return `${formatToDecimals(this.token.balance, 4)} ${this.token.symbol}`;
    },
    formattedNativeTotal(): string {
      if (this.token === undefined) {
        return '0';
      }
      const native = convertNativeAmountFromAmount(
        this.amountToDeposit,
        this.token.priceUSD
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
      this.token = eth;
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleTxReview(): void {
      if (this.token === undefined) {
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
            this.token.priceUSD,
            this.token.decimals
          );
        } else {
          amount = this.amountToDeposit;
          nativeAmount = convertNativeAmountFromAmount(
            this.amountToDeposit,
            this.token.priceUSD
          );
        }
      }

      this.$emit('tx-review', {
        token: this.token,
        amount: amount,
        nativeAmount: nativeAmount,
        selectedDepositIn: this.selectedDepositIn
      });
    },
    swapSelectedDepositIn(): void {
      if (this.selectedDepositIn === 'USDC') {
        if (this.token !== undefined) {
          if (this.isSelectedUSDCToken) {
            return;
          }

          this.selectedDepositIn = this.token.symbol;
          this.amountToDeposit = convertAmountFromNativeValue(
            this.amountToDeposit,
            this.token.priceUSD,
            this.token.decimals
          );
        }
      } else {
        this.selectedDepositIn = 'USDC';
        if (this.token !== undefined) {
          this.amountToDeposit = convertNativeAmountFromAmount(
            this.amountToDeposit,
            this.token.priceUSD
          );
        }
      }

      if (this.amountToDeposit === 'NaN') {
        this.amountToDeposit = '0';
      }
    },
    handleSelectMaxAmount(): void {
      if (!this.token) {
        return;
      }
      if (this.selectedDepositIn === 'USDC') {
        this.amountToDeposit = convertNativeAmountFromAmount(
          this.token.balance,
          this.token.priceUSD
        );
      } else {
        this.amountToDeposit = this.token.balance;
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
        this.token = token;
      }
      this.amountToDeposit = '';

      if (this.selectedDepositIn !== 'USDC' && this.token !== undefined) {
        this.selectedDepositIn = this.token.symbol;
      } else {
        this.selectedDepositIn = 'USDC';
      }
    }
  }
});
</script>
