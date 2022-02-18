<template>
  <div
    class="modal-wrapper-info-items-item"
    :class="{ 'couple-tokens': hasCoupleTokens }"
  >
    <div class="modal-wrapper-info-items-item-left">
      <token-image
        :address="asset ? asset.address : ''"
        class="small"
        :src="iconSrc"
        :symbol="asset ? asset.symbol : ''"
      />
      <price-input-field
        :amount="amount"
        :disabled="disabledInput"
        :field-id="`${fieldRole}-selected-amount`"
        :input-class="'input-top'"
        :max-amount="maxAmount"
        :placeholder="placeholder"
        :step="inputStep"
        @update-amount="handleUpdateAmount"
      />
      <price-input-field
        :amount="nativeAmount"
        :disabled="disabledInput"
        :field-id="`${fieldRole}-selected-native-amount`"
        :input-class="'input-bottom'"
        :placeholder="placeholder"
        :step="nativeInputStep"
        :text-prefix="textPrefix"
        @update-amount="handleUpdateNativeAmount"
      />
    </div>
    <div class="modal-wrapper-info-items-item-right">
      <button
        class="currency button-active"
        :class="{ empty: asset == null }"
        :style="buttonStyle"
        type="button"
        @click.prevent.stop="handleOpenSelectModal"
      >
        <span>{{ openSelectModalText }}</span>
        <img
          :alt="$t('icon.txtSelectAssetButtonAlt')"
          src="@/assets/images/button-arrow-down.svg"
        />
      </button>

      <button
        v-if="showSelectMaxAmountButton"
        class="use button transparent fit icon no-padding"
        type="button"
        @click="handleSelectMaxAmount"
      >
        <plus-icon :stroke="plusIconColor" />
        <span :style="spanMaxAmountStyle">
          {{ $t('asset.lblSelectMax') }}
        </span>
      </button>
      <p v-else-if="showTokenBalance && tokenBalance">
        {{ $t('asset.lblBalance') }}: {{ tokenBalance }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { BigNumber } from 'bignumber.js';
import { Properties } from 'csstype';

import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import { formatToDecimals } from '@/utils/format';
import { TokenWithBalance } from '@/wallet/types';

import { TokenImage } from '@/components/tokens';

import PlusIcon from './plus-icon.vue';
import PriceInputField from './price-input-field.vue';

export default Vue.extend({
  name: 'AssetField',
  components: {
    TokenImage,
    PlusIcon,
    PriceInputField
  },
  props: {
    asset: {
      type: Object as PropType<TokenWithBalance | undefined>,
      default: undefined
    },
    fieldRole: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    maxAmount: {
      type: String,
      default: undefined
    },
    nativeAmount: {
      type: String,
      required: true
    },
    useWalletTokens: {
      type: Boolean,
      default: false
    },
    excludeTokens: {
      type: Array as PropType<Array<TokenWithBalance>>,
      default: () => []
    },
    forceTokenArray: {
      type: Array as PropType<Array<TokenWithBalance>>,
      default: () => []
    },
    disabledSelectCurrency: {
      type: Boolean,
      default: false
    },
    hasCoupleTokens: {
      type: Boolean,
      default: false
    },
    showTokenBalance: {
      type: Boolean,
      default: false
    },
    treasuryOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('account', ['tokens']),
    ...mapGetters('account', ['getTokenColor']),
    placeholder(): string {
      return this.asset === undefined ? '—' : '0.00';
    },
    disabledInput(): boolean {
      return this.asset === undefined;
    },
    iconSrc(): string {
      return this.asset === undefined ? '' : this.asset.logo;
    },
    iconAlt(): string {
      return (
        this.asset === undefined
          ? this.$t('asset.txtFallbackAlt', {
              fieldRole: this.fieldRole
            })
          : this.$t('asset.txtAlt', {
              name: this.asset.name
            })
      ) as string;
    },
    assetColor(): string | undefined {
      if (this.asset === undefined) {
        return undefined;
      }
      return this.getTokenColor(this.asset.address);
    },
    buttonStyle(): Properties {
      if (this.assetColor === undefined) {
        return {
          backgroundColor: '#000',
          boxShadow: `0 0 16px #000`,
          WebkitBoxShadow: `0 0 16px #000`
        };
      }

      return {
        backgroundColor: this.assetColor,
        boxShadow: `0 0 16px ${this.assetColor}`,
        WebkitBoxShadow: `0 0 16px ${this.assetColor}`
      };
    },
    spanMaxAmountStyle(): Properties {
      if (this.assetColor === undefined) {
        return {
          color: '#000'
        };
      }

      return {
        color: this.assetColor
      };
    },
    plusIconColor(): string {
      if (this.assetColor === undefined) {
        return '#000';
      }

      return this.assetColor;
    },
    textPrefix(): string {
      if (this.placeholder === '—') {
        return '';
      }

      return '≈$';
    },
    openSelectModalText(): string {
      if (this.asset === undefined) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      return `${this.asset.symbol}`;
    },
    showSelectMaxAmountButton(): boolean {
      return this.fieldRole === 'input' && !!this.asset;
    },
    tokenBalance(): string {
      if (this.asset !== undefined) {
        const token = this.tokens.find((t: TokenWithBalance) =>
          sameAddress(this.asset?.address ?? undefined, t.address)
        );
        if (token) {
          return `${formatToDecimals(token.balance, 4)} ${token.symbol}`;
        }
        return '0.0000';
      }
      return '';
    },
    inputStep(): string {
      if (this.asset === undefined) {
        return new BigNumber(10).pow(-18).toString(10);
      }

      return new BigNumber(10).pow(-this.asset.decimals).toString(10);
    },
    nativeInputStep(): string {
      return new BigNumber(10).pow(-6).toString(10);
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    handleUpdateAmount(amount: number): void {
      this.$emit('update-amount', String(amount));
    },
    handleSelectMaxAmount(): void {
      if (this.asset?.balance) {
        this.$emit('update-amount', this.maxAmount);
      }
    },
    handleUpdateNativeAmount(amount: number): void {
      this.$emit('update-native-amount', String(amount));
    },
    async handleOpenSelectModal(): Promise<void> {
      if (!this.disabledSelectCurrency) {
        const newAsset = await this.setModalIsDisplayed({
          id: ModalType.SearchToken,
          value: true,
          payload: {
            useWalletTokens: this.useWalletTokens,
            excludeTokens: this.excludeTokens,
            treasuryOnly: this.treasuryOnly,
            forceTokenArray: this.forceTokenArray
          }
        });

        if (newAsset === undefined) {
          return;
        }
        this.$emit('update-asset', newAsset);
      }
    }
  }
});
</script>
