import { ListenerParams, StateChangedHandler, TransactionState } from './types';

export class TransactionStateEventBus {
  private handlers: Map<TransactionState, Array<StateChangedHandler<never>>>;
  constructor() {
    this.handlers = new Map<
      TransactionState,
      Array<StateChangedHandler<never>>
    >();
  }

  public on<
    Type extends keyof ListenerParams,
    Payload extends ListenerParams[Type]
  >(
    type: Type,
    handler: StateChangedHandler<Payload>
  ): TransactionStateEventBus {
    const existingHandlers = this.handlers.get(type);
    if (existingHandlers !== undefined) {
      this.handlers.set(type, [...existingHandlers, handler]);
    } else {
      this.handlers.set(type, [handler]);
    }

    return this;
  }

  public dispatch<
    Type extends keyof ListenerParams,
    Payload extends ListenerParams[Type]
  >(type: Type, payload: Payload): void {
    const handlers = this.handlers.get(type) as
      | Array<StateChangedHandler<Payload>>
      | undefined;
    if (handlers === undefined) {
      return;
    }

    for (const handler of handlers) {
      handler(payload);
    }
  }
}
