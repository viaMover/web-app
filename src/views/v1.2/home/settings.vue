<template>
  <div class="settings">
    <h1>{{ $t('settings') }}</h1>

    <div class="items">
      <div class="mb-40">
        <label class="form-label" for="wallet_address">
          {{ $t('yourCurrentWallet') }}
        </label>
        <div class="input-group address">
          <input
            id="wallet_address"
            class="form-control"
            disabled
            size="42"
            :value="currentAddress"
          />
          <button
            class="input-group-text"
            type="button"
            @click="disconnectWallet"
          >
            <base-icon icon-class="icon-log-out" />
          </button>
        </div>
      </div>

      <div class="theme mb-40">
        <h3 class="form-label">{{ $t('themeSettings') }}</h3>
        <div class="input-group group">
          <button
            v-for="button in themeButtons"
            :key="button.theme"
            class="selector"
            :class="{ active: button.theme === currentTheme }"
            type="button"
            @click="changeTheme(button.theme)"
          >
            {{ $t(button.theme) }}
            <base-icon :icon-class="button.iconClass" />
          </button>
        </div>
      </div>

      <div class="currency mb-40">
        <label class="form-label" for="native_currency">{{
          $t('baseCurrency')
        }}</label>
        <base-dropdown
          has-custom-option
          has-custom-selected-option
          input-id="native_currency"
          label="currency"
          :options="availableNativeCurrencies"
          :value="selectedNativeCurrency"
          @input="handleChangeNativeCurrency"
        >
          <template v-slot:option="{ currency, flag }">
            <span class="emoji flag">{{ flag }}</span>
            <span class="currency">{{ currency }}</span>
          </template>

          <template v-slot:selected-option="{ currency, flag }">
            <span class="emoji flag">{{ flag }}</span>
            <span class="currency">{{ currency }}</span>
          </template>
        </base-dropdown>
        <p class="form-text">{{ $t('baseCurrencyDescription') }}</p>
      </div>

      <div class="language">
        <label class="form-label" for="language">{{ $t('language') }}</label>
        <base-dropdown
          input-id="language"
          label="name"
          :options="availableLanguages"
          :value="selectedLanguage"
          @input="handleChangeLanguage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { availableLanguages, LanguageEntryItem } from '@/i18n';
import { availableThemes, Theme } from '@/settings/theme';
import { nativeCurrencyFormatters } from '@/store/modules/account/types';

import { BaseIcon } from '@/components/v1.2';
import BaseDropdown from '@/components/v1.2/base-dropdown.vue';

type ThemeButton = {
  theme: Theme;
  iconClass: string;
};

type CurrencyItem = {
  id: string;
  currency: string;
  flag: string;
};

export default Vue.extend({
  components: { BaseDropdown, BaseIcon },
  data() {
    return {
      availableThemes,
      availableLanguages,
      nativeCurrencyFormatters
    };
  },
  computed: {
    ...mapState({
      currentTheme: 'preferredTheme'
    }),
    ...mapState('account', {
      currentAddress: 'currentAddress',
      currentNativeCurrency: 'nativeCurrency'
    }),
    themeButtons(): Array<ThemeButton> {
      return availableThemes.map((theme) => {
        const isActive = theme === this.currentTheme;
        return {
          theme,
          iconClass: `icon-${theme}-mode-${isActive ? 'on' : 'off'}`
        };
      });
    },
    availableNativeCurrencies(): Array<CurrencyItem> {
      return Object.entries(nativeCurrencyFormatters)
        .map(([key, value]) => ({
          id: key,
          currency: value?.currency,
          flag: value?.flag || value?.sign
        }))
        .filter(
          (item: Record<string, unknown>): item is CurrencyItem =>
            item.currency !== undefined && item.flag !== undefined
        );
    },
    selectedNativeCurrency(): CurrencyItem {
      return (
        this.availableNativeCurrencies.find(
          (c) => c.id === this.currentNativeCurrency
        ) ?? this.availableNativeCurrencies[0]
      );
    },
    currentLanguage(): string {
      return this.$i18n.locale;
    },
    selectedLanguage(): LanguageEntryItem {
      return (
        this.availableLanguages.find((l) => l.code === this.currentLanguage) ??
        this.availableLanguages[0]
      );
    }
  },
  methods: {
    ...mapActions({
      changeTheme: 'changeTheme',
      setLanguage: 'setLanguage'
    }),
    ...mapActions('account', {
      changeNativeCurrency: 'changeNativeCurrency',
      clearWalletState: 'disconnectWallet'
    }),
    async handleChangeNativeCurrency(selected: CurrencyItem): Promise<void> {
      await this.changeNativeCurrency(selected.id);
    },
    async handleChangeLanguage(selected: LanguageEntryItem): Promise<void> {
      await this.setLanguage(selected.code);
    },
    async disconnectWallet(): Promise<void> {
      await this.clearWalletState();
      window.location.reload();
    }
  }
});
</script>
