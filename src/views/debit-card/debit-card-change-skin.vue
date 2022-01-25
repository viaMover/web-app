<template>
  <secondary-page class="change-skin" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('debitCard.changeSkin.txtDigitalCardSkin')"
        :title="$t('debitCard.changeSkin.lblDigitalCardSkin')"
      />
    </template>

    <form class="form change-skin" @submit.prevent="handleChangeSkin">
      <h2>
        {{ $t('debitCard.changeSkin.lblWhatSkinDoWeChoose') }}
      </h2>
      <div class="info">
        <skin-image
          :id="skinToBeApplied ? skinToBeApplied.id : ''"
          :color="skinToBeApplied ? skinToBeApplied.color : undefined"
          :fallback-src-list="skinImageFallbackSrcList"
          :src="skinImageSrc"
          :symbol="skinToBeApplied ? skinToBeApplied.symbol : ''"
        />
        <div class="coin">
          <p>
            {{ skinToBeApplied ? skinToBeApplied.name : '' }}
            <span>
              {{ skinToBeApplied ? skinToBeApplied.symbol : '' }}
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
      <div class="description">
        <p>{{ skinToBeApplied ? skinToBeApplied.description : '' }}</p>
      </div>
      <action-button
        class="primary"
        :disabled="!isButtonActive"
        propagate-original-event
        type="submit"
      >
        <div v-if="isLoading || isProcessing" class="loader-icon">
          <img
            :alt="$t('icon.txtPendingIconAlt')"
            src="@/assets/images/ios-spinner-white.svg"
          />
        </div>
        <template v-else>
          {{ isButtonActive ? $t('debitCard.changeSkin.btnApplySkin') : error }}
        </template>
      </action-button>
    </form>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import { Properties as CssProperties } from 'csstype';

import { Skin } from '@/store/modules/debit-card/types';
import { Modal as ModalType } from '@/store/modules/modals/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon } from '@/components/controls';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { SkinImage } from '@/components/tokens';

export default Vue.extend({
  name: 'DebitCardChangeSkin',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    SkinImage,
    ArrowDownIcon,
    ActionButton
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
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    }),
    skinIsUnsaved(): boolean {
      return this.skinToBeApplied?.id !== this.currentSkin.id;
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
    },
    skinImageSrc(): string {
      if (this.skinToBeApplied === undefined) {
        return '';
      }

      return this.skinToBeApplied.previewPicture.src;
    },
    skinImageFallbackSrcList(): Array<string> | undefined {
      if (this.skinToBeApplied === undefined) {
        return undefined;
      }
      return this.skinToBeApplied.previewPicture.sources?.map(
        (source) => source.src
      );
    },
    selectorStyle(): CssProperties {
      if (this.skinToBeApplied === undefined) {
        return {
          backgroundColor: '#f1f1f1',
          boxShadow: '0 0 8px rgb(0, 0, 0, 0.5)'
        };
      }

      const assetColor = this.skinToBeApplied.color;
      return {
        backgroundColor: assetColor,
        boxShadow: `0 0 8px ${assetColor}`
      };
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
