import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = this.getTotalTransactionsForType(transactions, 'income');
    const outcome = this.getTotalTransactionsForType(transactions, 'outcome');

    const total = income - outcome;

    return { income, outcome, total };
  }

  private getTotalTransactionsForType(
    transactions: Transaction[],
    type: 'income' | 'outcome',
  ): number {
    return transactions
      .filter(t => t.type === type)
      .reduce((total, nextTransaction) => {
        return total + Number(nextTransaction.value);
      }, 0);
  }
}

export default TransactionsRepository;
