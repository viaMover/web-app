<template>
  <input v-bind="$attrs" type="number" :value="value" v-on="listeners" />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'DebouncedInput',
  props: {
    value: {
      type: String,
      required: true
    },
    debounceTimeout: {
      type: Number,
      default: 700
    }
  },
  data() {
    return {
      valueRaw: '',
      debounce: undefined as number | undefined
    };
  },
  computed: {
    listeners(): unknown {
      return {
        ...this.$listeners,
        input: (ev: Event) =>
          this.updateValue((ev.target as HTMLInputElement).value)
      };
    }
  },
  watch: {
    valueRaw(newVal: string) {
      if (this.debounce) {
        window.clearTimeout(this.debounce);
      }
      const debounceTimeout = newVal === '' ? 0 : this.debounceTimeout;

      this.debounce = window.setTimeout(() => {
        try {
          this.$emit('update-value', newVal);
        } catch {
          return;
        }
      }, debounceTimeout);
    }
  },
  methods: {
    updateValue(value?: string): void {
      this.valueRaw = value ?? '';
    }
  }
});
</script>
