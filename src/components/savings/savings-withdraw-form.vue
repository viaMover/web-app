<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="savings_secondary_page-title"
        :description="$t('savings.withdraw.txtWithdrawDescription')"
        :title="$t('savings.withdraw.lblWithdrawFromSavings')"
      />
      <div class="savings_secondary_page-token-info">
        <span>~ $0.00</span>
        <p>{{ $t('savings.withdraw.txtIfYouKeepSavings') }}</p>
      </div>
    </div>
    <div class="savings_secondary_page-body">
      <h2>{{ $t('savings.withdraw.lblWhatDoWeWithdraw') }}</h2>
      <div class="info">
        <token-image
          :address="token.address"
          :src="token.logo"
          :symbol="token.symbol"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ token.name }}
            <span>
              {{ token.symbol }}
            </span>
          </p>
        </div>
      </div>
      <div class="available">
        <p>
          {{ $t('savings.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="description">
        <p>
          {{ $t('savings.txtUSDCCoinIsAStable') }}
        </p>
      </div>
      <form action="#" autocomplete="off" class="form">
        <p>
          {{ $t('savings.withdraw.lblAmountWeDepositIn') }}
          <span class="form-button">
            {{ $t('savings.USDC') }}
          </span>
        </p>
        <input
          v-model.trim="amountToWithdraw"
          class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          type="text"
        />
        <span>{{ $t('savings.USDC') }}</span>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleTxReview"
        >
          {{
            isButtonActive
              ? $t('savings.lblReviewTransaction')
              : $t('savings.withdraw.lblChooseAmount')
          }}
        </action-button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';
import { formatToDecimals } from '@/utils/format';
import { isFinite, isNaN, notZero } from '@/utils/bigmath';
import { getUSDCAssetData } from '@/wallet/references/data';

import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import { ActionButton } from '@/components/buttons';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

export default Vue.extend({
  name: 'SavingsWithdrawForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton
  },
  data() {
    return {
      amountToWithdraw: '' as string
    };
  },
  computed: {
    ...mapState('account', ['tokens', 'networkInfo', 'savingsBalance']),
    ...mapGetters('account', ['usdcNativePrice']),
    token(): TokenWithBalance {
      return {
        address: this.USDCAsset.address,
        decimals: this.USDCAsset.decimals,
        symbol: this.USDCAsset.symbol,
        name: 'USDc',
        priceUSD: this.usdcNativePrice,
        logo: this.USDCAsset.iconURL,
        isFavorite: true,
        isVerified: true,
        balance: this.savingsBalance,
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    USDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    isButtonActive(): boolean {
      return (
        this.amountToWithdraw !== '' &&
        !isNaN(this.amountToWithdraw) &&
        notZero(this.amountToWithdraw) &&
        isFinite(this.amountToWithdraw)
      );
    },
    formattedMaxAmount(): string {
      return `${formatToDecimals(this.token.balance, 4)} ${this.token.symbol}`;
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleTxReview(): void {
      if (!this.isButtonActive) {
        return;
      }

      this.$emit('tx-review', {
        token: this.token,
        amount: this.amountToWithdraw
      });
    },
    handleSelectMaxAmount(): void {
      if (!this.token) {
        return;
      }
      this.amountToWithdraw = this.token.balance;
    }
  }
});
</script>
