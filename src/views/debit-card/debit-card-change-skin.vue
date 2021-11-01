<template>
  <secondary-page
    has-back-button
    :title="$t('debitCard.changeSkin.lblChangeSkin')"
    @back="handleBack"
  >
    <p class="description">{{ $t('debitCard.changeSkin.txtChangeSkin') }}</p>

    <div class="content">
      <form class="form" @submit.prevent="handleChangeSkin">
        <h2>{{ $t('debitCard.changeSkin.lblWhatSkinDoWeChoose') }}</h2>
        <div class="info">
          <skin-image
            :id="skinToBeApplied.id"
            :src="skinToBeApplied.src"
            :symbol="skinToBeApplied.symbol"
            wrapper-class="icon"
          />
          <div class="coin">
            <p>
              {{ skinToBeApplied.name }}
              <span>
                {{ skinToBeApplied.symbol }}
              </span>
            </p>
          </div>
          <button
            class="button-active button-arrow"
            :style="selectorStyle"
            type="button"
            @click.stop.prevent="handleOpenSelectModal"
          >
            <arrow-down-icon stroke="#000" />
          </button>
        </div>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          propagate-original-event
          type="submit"
        >
          <div v-if="isLoading || isProcessing" class="loader-icon">
            <img
              :alt="$t('txtPendingIconAlt')"
              src="@/assets/images/ios-spinner-white.svg"
            />
          </div>
          <template v-else>
            {{ isButtonActive ? $t('debitCard.btnApplySkin') : error }}
          </template>
        </action-button>
      </form>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { Skin } from '@/store/modules/debit-card/types';
import { Modal as ModalType } from '@/store/modules/modals/types';

import { SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'DebitCardChangeSkin',
  components: {
    SecondaryPage
  },
  data() {
    return {
      skinToBeApplied: undefined as Skin | undefined,
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false
    };
  },
  computed: {
    ...mapState('debitCard', {
      currentSkin: 'cardSkin'
    }),
    skinIsUnsaved(): boolean {
      return this.skinToBeApplied?.id !== this.currentSkin;
    },
    error(): string | undefined {
      if (!this.skinIsUnsaved) {
        return this.$t(
          'debitCard.changeSkin.btnChooseAnotherCardSkin'
        ) as string;
      }

      return undefined;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading;
    }
  },
  watch: {
    currentSkin: {
      handler(newVal: Skin) {
        if (newVal !== undefined && this.skinIsUnsaved) {
          this.skinToBeApplied = newVal;
        }
      },
      immediate: true
    }
  },
  async mounted() {
    this.isLoading = true;
    await this.loadAvailableSkins();
    this.isLoading = false;
  },
  methods: {
    ...mapActions('debitCard', {
      changeSkin: 'changeSkin',
      loadAvailableSkins: 'loadAvailableSkins'
    }),
    ...mapActions('modals', {
      setModalIsDisplayed: 'setIsDisplayed'
    }),
    handleBack(): void {
      this.$router.replace({ name: 'debit-card-manage' });
    },
    async handleOpenSelectModal(): Promise<void> {
      const newSkin = await this.setModalIsDisplayed({
        id: ModalType.SearchSkin,
        value: true
      });

      if (newSkin === undefined) {
        return;
      }

      this.skinToBeApplied = newSkin;
    },
    async handleChangeSkin(): Promise<void> {
      if (this.skinToBeApplied === undefined) {
        return;
      }

      await this.changeSkin(this.skinToBeApplied);
    }
  }
});
</script>
