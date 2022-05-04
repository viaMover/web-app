<template>
  <vue-select
    v-bind="$attrs"
    :autocomplete="autocomplete"
    class="dropdown"
    :clearable="clearable"
    :filterable="filterable"
    :input-id="inputId"
    :label="label"
    :no-drop="disabled"
    :options="options"
    :searchable="searchable"
    :value="value"
    v-on="$listeners"
  >
    <template v-slot:open-indicator="{ attributes }">
      <base-icon v-bind="attributes" icon-class="icon-select-option" />
    </template>

    <template v-if="hasCustomOption" v-slot:option="option">
      <slot v-bind="option" name="option" />
    </template>

    <template
      v-if="hasCustomSelectedOption && value !== undefined"
      v-slot:selected-option="selectedOption"
    >
      <slot v-bind="selectedOption" name="selected-option" />
    </template>
  </vue-select>
</template>

<script lang="ts">
import Vue from 'vue';
import VueSelect from 'vue-select';

import BaseIcon from '@/components/v1.2/base-icon.vue';

export default Vue.extend({
  name: 'BaseDropdown',
  components: { VueSelect, BaseIcon },
  props: {
    hasCustomOption: {
      type: Boolean,
      default: false
    },
    hasCustomSelectedOption: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    },
    value: {
      type: [String, Number, Object],
      default: undefined
    },
    options: {
      type: Array,
      required: true
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    inputId: {
      type: String,
      default: undefined
    },
    label: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
});
</script>
