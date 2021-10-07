<template>
  <span>
    <span>
      <input
        ref="input"
        v-bind="$attrs"
        :class="[inputClass, 'min-width']"
        :value="value"
        v-on="listeners"
      />
      <span ref="measury" class="measury"></span>
    </span>
    <span
      class="input-symbol"
      :class="{
        inactive: inactive
      }"
    >
      {{ symbol }}
    </span>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'DynamicInput',
  props: {
    value: {
      type: String,
      required: true
    },
    debounceTimeout: {
      type: Number,
      default: 700
    },
    inputClass: {
      type: String,
      default: ''
    },
    symbol: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      valueRaw: '',
      debounce: undefined as number | undefined,
      inactive: true
    };
  },
  computed: {
    listeners(): unknown {
      return {
        ...this.$listeners,
        input: (ev: Event) => {
          this.updateValue((ev.target as HTMLInputElement).value);
        }
      };
    }
  },
  watch: {
    value(newVal: string) {
      this.inactive = newVal === '';
      this.calcWidth(newVal);
    },
    valueRaw(newVal: string) {
      this.calcWidth(newVal);
      if (this.debounce) {
        window.clearTimeout(this.debounce);
      }
      const debounceTimeout = newVal === '' ? 0 : this.debounceTimeout;

      this.debounce = window.setTimeout(() => {
        try {
          this.inactive = newVal === '';
          this.$emit('update-value', newVal);
        } catch {
          return;
        }
      }, debounceTimeout);
    }
  },
  methods: {
    calcWidth(newVal: string): void {
      const input = this.$refs.input as HTMLInputElement;
      const measury = this.$refs.measury as HTMLInputElement;
      measury.textContent = newVal;
      input.style.width = measury.offsetWidth + 'px';
    },
    updateValue(value?: string): void {
      this.valueRaw = value ?? '';
    }
  }
});
</script>
