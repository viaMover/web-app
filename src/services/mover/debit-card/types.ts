export class DebitCardApiError extends Error {
  constructor(readonly message: string) {
    super();
  }
}
