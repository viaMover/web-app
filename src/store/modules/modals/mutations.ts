import { MutationTree } from 'vuex';

import { ModalsStoreState, ModalState, TModalKey } from './types';

export default {
  pushStack(state, entry: TModalKey): void {
    state.stack = [entry, ...state.stack];
  },
  popStack(state, count = 1): void {
    state.stack.splice(0, count);
  },
  setStateEntry(
    state,
    args: { id: TModalKey; state: ModalState<TModalKey> }
  ): void {
    state.state[args.id] = {
      ...state.state[args.id],
      ...args.state
    };
  },
  setIsStateEntryVisible(
    state,
    args: { id: TModalKey; isVisible: boolean }
  ): void {
    state.state[args.id].isVisible = args.isVisible;
  }
} as MutationTree<ModalsStoreState>;
