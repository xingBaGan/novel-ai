
import fs from 'fs';
import path from 'path';

const commenterPrompt = fs.readFileSync(path.join(__dirname, '..', '..', 'prompts', 'commenter.md'), 'utf8');


export function getPrompt(command: string, extractedText: string) {
  switch (command) {
    case "evaluate":
      return `${commenterPrompt}\n\n${extractedText}`;
    default:
      return extractedText;
  }
}