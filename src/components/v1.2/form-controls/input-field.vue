<template>
  <div>
    <label class="form-label" :for="inputId">
      <slot name="label">{{ labelText }}</slot>
    </label>
    <div class="input-group">
      <input
        :id="inputId"
        ref="input"
        class="form-control"
        placeholder="0.00"
        :type="type"
        :value="value"
        @input="handleInput"
      />
    </div>
    <slot name="description">
      <p v-if="descriptionText" class="form-text">{{ descriptionText }}</p>
    </slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'InputField',
  props: {
    inputId: {
      type: String,
      required: true
    },
    labelText: {
      type: String,
      default: undefined
    },
    value: {
      type: [String, Number],
      required: true
    },
    descriptionText: {
      type: String,
      default: undefined
    },
    type: {
      type: String as PropType<
        'text' | 'number' | 'date' | 'email' | 'search' | 'tel'
      >,
      default: 'text'
    }
  },
  methods: {
    handleInput(ev: InputEvent): void {
      this.$emit('input', (ev.target as HTMLInputElement).value);
    }
  }
});
</script>
