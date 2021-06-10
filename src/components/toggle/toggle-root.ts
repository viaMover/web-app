import Vue from 'vue';

const toggleEventBus = new Vue();

export interface TogglePayload<T> {
  group: string;
  id: string;
  payload?: T;
}

type HandleFunc<T> = (payload: T) => void | Promise<void>;

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

export const sendResult = <T>(toggleId: string, payload: T): void => {
  toggleEventBus.$emit(`toggle-${toggleId}-result`, payload);
};

export const toggleThenWaitForResult = <TP, RP>(
  toggleId: string,
  resultHandler: HandleFunc<RP>,
  togglePayload?: TP
): void => {
  const unsubscribeAll = (): void => {
    toggleEventBus.$off(`toggle-${toggleId}-result`, handleResult);
    toggleEventBus.$off(`toggle-${toggleId}`, unsubscribeAll);
  };

  const handleResult = (payload: RP): void => {
    resultHandler(payload);
    toggleEventBus.$off(`toggle-${toggleId}-result`, handleResult);
    unsubscribeAll();
  };

  toggleEventBus.$on(`toggle-${toggleId}-result`, handleResult);
  toggleEventBus.$emit(`toggle-${toggleId}`, {
    group: toggleId,
    id: toggleId,
    payload: togglePayload
  });
  toggleEventBus.$on(`toggle-${toggleId}`, unsubscribeAll);
};

export default toggleEventBus;
