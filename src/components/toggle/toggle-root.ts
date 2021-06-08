import Vue from 'vue';

const toggleEventBus = new Vue();

export interface TogglePayload<T> {
  group: string;
  id: string;
  payload?: T;
}

type HandleFunc<T> = (payload: TogglePayload<T>) => void | Promise<void>;

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

export const subToggle = <T>(
  toggleId: string,
  handler: HandleFunc<TogglePayload<T>>
): void => {
  toggleEventBus.$on(`toggle-${toggleId}`, handler);
};

export const unsubToggle = <T>(
  toggleId: string,
  handler: HandleFunc<TogglePayload<T>>
): void => {
  toggleEventBus.$off(`toggle-${toggleId}`, handler);
};

export const subResult = <T>(
  toggleId: string,
  handler: HandleFunc<T>
): void => {
  toggleEventBus.$on(`toggle-${toggleId}-result`, handler);
};

export const unsubResult = <T>(
  toggleId: string,
  handler: HandleFunc<T>
): void => {
  toggleEventBus.$off(`toggle-${toggleId}-result`, handler);
};

export const sendResult = <T>(toggleId: string, payload: T): void => {
  toggleEventBus.$emit(`toggle-${toggleId}-result`, payload);
};

export default toggleEventBus;
