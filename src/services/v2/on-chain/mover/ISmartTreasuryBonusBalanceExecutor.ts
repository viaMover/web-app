/**
 * Any class implementing this interface should be considered as
 * a valid source of truth about bonus balance
 *
 * @see SubsidizedTransactionsOnChainService
 */
export interface ISmartTreasuryBonusBalanceExecutor {
  getBonusBalance(): Promise<string | never>;
}
