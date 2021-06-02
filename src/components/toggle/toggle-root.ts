import Vue from 'vue';

const toggleEventBus = new Vue();

export interface TogglePayload {
  toggleId: string;
  payload?: Record<string, unknown>;
}

export const toggleModal = (
  toggleId: string,
  payload?: Record<string, unknown>
): void => {
  toggleEventBus.$emit(`toggle-${toggleId}`, {
    toggleId,
    payload
  });
};

export default toggleEventBus;
