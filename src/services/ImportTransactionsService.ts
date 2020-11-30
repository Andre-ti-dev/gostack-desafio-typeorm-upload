import { getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import csvReader from '../utils/csvReader';

interface CSVTransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const csvTransactionData = (await csvReader(
      filepath,
    )) as CSVTransactionData[];

    const categories = csvTransactionData.map(
      transaction => transaction.category,
    );

    const existentCategories = await categoryRepository.find({
      where: In(categories),
    });

    const existentCategoriesTitles = existentCategories.map(
      category => category.title,
    );

    const categoriesToAdd = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      categoriesToAdd.map(title => ({ title })),
    );

    await categoryRepository.save(newCategories);

    const allCategories = [...newCategories, ...existentCategories];

    const newTransactions = transactionRepository.create(
      csvTransactionData.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category: allCategories.find(c => c.title === category),
      })),
    );

    await transactionRepository.save(newTransactions);

    return newTransactions;
  }
}

export default ImportTransactionsService;
