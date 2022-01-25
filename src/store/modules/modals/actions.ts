import { ActionFuncs } from '@/store/types';

import { MutationType } from './mutations';
import {
  ModalsStoreState,
  TModalKey,
  TModalPayload,
  TModalReturn
} from './types';

type SetVisibilityArgs<K extends TModalKey> = {
  id: K;
  value: boolean;
  payload: TModalPayload<K>;
  waitForResult?: boolean;
};

enum Actions {
  setIsDisplayed
}

const actions: ActionFuncs<typeof Actions, ModalsStoreState, MutationType> = {
  async setIsDisplayed(
    { state, commit, dispatch },
    { id, value, payload }: SetVisibilityArgs<TModalKey>
  ): Promise<TModalReturn<TModalKey>> {
    if (!value) {
      if (state.state[id].needGasListener) {
        await dispatch('account/stopGasListening', id, { root: true });
      }

      const stackPosition = state.stack.findIndex(
        (stackEntry) => stackEntry === id
      );
      if (stackPosition == -1) {
        // broken state, just ignore and leave
        return;
      }

      // not a top entry
      if (stackPosition !== 0) {
        state.stack.forEach((openedModalId, modalIdx) => {
          if (modalIdx > stackPosition) {
            // do not close parents
            return;
          }

          // force nested resolvers to resolve with undefined
          state.state[openedModalId].resolver?.(undefined);

          commit('setStateEntry', {
            id: openedModalId,
            state: {
              isDisplayed: value,
              isVisible: value,
              payload: undefined,
              stackDepth: -1,
              resolver: undefined
            }
          });
        });

        // remove child modals from stack
        commit('popStack', stackPosition + 1);
        return;
      }

      // force nested resolvers to resolve with undefined
      state.state[id].resolver?.(undefined);

      commit('setStateEntry', {
        id,
        state: {
          isDisplayed: value,
          isVisible: value,
          payload: undefined,
          stackDepth: -1,
          resolver: undefined
        }
      });

      // remove modal from stack
      commit('popStack');
      return;
    }

    if (state.state[id].needGasListener) {
      await dispatch('account/startGasListening', id, { root: true });
    }

    if (state.stack.length > 0) {
      if (state.stack[0] === id) {
        return;
      }

      // make stack parent element invisible before pushing a new stack entry
      commit('setIsStateEntryVisible', {
        id: state.stack[0],
        isVisible: false
      });
    }

    commit('pushStack', id);
    if (!state.state[id].waitForResult) {
      commit('setStateEntry', {
        id,
        state: {
          stackDepth: state.stack.length,
          isDisplayed: value,
          isVisible: value,
          payload: payload
        }
      });
      return;
    }

    // force nested resolvers to resolve with undefined
    state.state[id].resolver?.(undefined);

    let resolver;
    const ret = new Promise<TModalReturn<TModalKey>>((resolve) => {
      resolver = (args: TModalReturn<TModalKey>) => {
        resolve(args);
        commit('setStateEntry', {
          id,
          state: {
            isDisplayed: false,
            isVisible: false,
            payload: undefined,
            stackDepth: -1,
            resolver: undefined
          }
        });
        if (state.stack.length > 1) {
          commit('setIsStateEntryVisible', {
            id: state.stack[1],
            isVisible: true
          });
        }

        if (state.stack.length === 1 && state.stack[0] === id) {
          commit('popStack');
        }
      };
    });

    commit('setStateEntry', {
      id,
      state: {
        stackDepth: state.stack.length,
        isDisplayed: value,
        isVisible: value,
        payload,
        resolver
      }
    });

    return ret;
  }
};

export type ActionType = typeof actions;
export default actions;
