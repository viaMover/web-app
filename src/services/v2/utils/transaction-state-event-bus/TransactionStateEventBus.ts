import {
  ListenerParams,
  StateChangedHandler,
  TransactionState,
  UniversalStateChangedHandler
} from './types';

export class TransactionStateEventBus {
  private readonly handlers: Map<
    TransactionState,
    Array<StateChangedHandler<never>>
  >;
  private readonly universalHandlers: Array<UniversalStateChangedHandler>;
  constructor() {
    this.handlers = new Map<
      TransactionState,
      Array<StateChangedHandler<never>>
    >();
    this.universalHandlers = new Array<UniversalStateChangedHandler>();
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

  public onAny(
    handler: UniversalStateChangedHandler
  ): TransactionStateEventBus {
    this.universalHandlers.push(handler);
    return this;
  }

  public dispatch<
    Type extends keyof ListenerParams,
    Payload extends ListenerParams[Type]
  >(type: Type, payload: Payload): void {
    const handlers = (this.handlers.get(type) ?? []) as Array<
      StateChangedHandler<Payload>
    >;

    for (const handler of this.universalHandlers) {
      handler(type, payload);
    }

    for (const handler of handlers) {
      handler(payload);
    }
  }
}
