import Vue from 'vue';

const toggleEventBus = new Vue();

export interface TogglePayload<T> {
  group: string;
  id: string;
  payload?: T;
}

type HandleFunc = (payload: TogglePayload<never>) => void | Promise<void>;

export const toggleSingleItem = <T>(toggleId: string, payload?: T): void => {
  toggleEventBus.$emit(`toggle-${toggleId}`, {
    group: toggleId,
    id: toggleId,
    payload
  } as TogglePayload<T>);
};

export const toggleGroupItem = <T>(
  toggleGroup: string,
  toggleId: string,
  payload?: T
): void => {
  toggleEventBus.$emit(`toggle-${toggleGroup}`, {
    group: toggleGroup,
    id: toggleId,
    payload
  } as TogglePayload<T>);
};

export const subToggle = (toggleId: string, handler: HandleFunc): void => {
  toggleEventBus.$on(`toggle-${toggleId}`, handler);
};

export const unsubToggle = (toggleId: string, handler: HandleFunc): void => {
  toggleEventBus.$off(`toggle-${toggleId}`, handler);
};

export const subResult = (toggleId: string, handler: HandleFunc): void => {
  toggleEventBus.$on(`toggle-${toggleId}-result`, handler);
};

export const unsubResult = (toggleId: string, handler: HandleFunc): void => {
  toggleEventBus.$off(`toggle-${toggleId}-result`, handler);
};

export const sendResult = <T>(toggleId: string, payload: T): void => {
  toggleEventBus.$emit(`toggle-${toggleId}-result`, payload);
};

export default toggleEventBus;
