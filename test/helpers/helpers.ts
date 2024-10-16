import * as fs from 'fs';
import * as path from 'path';

export function readFromJson(filename: string): any {
  const filePath = path.join(__dirname, filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}
