import csvParse from 'csv-parse';
import fs from 'fs';

export default async function readCsv(csvFilePath: string): Promise<Array<{}>> {
  const lines: Array<{}> = [];
  const readCSVStream = fs.createReadStream(csvFilePath);
  const parseStream = csvParse({
    ltrim: true,
    rtrim: true,
    columns: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);
  parseCSV.on('data', line => lines.push(line));

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  await fs.promises.unlink(csvFilePath);

  return lines;
}
