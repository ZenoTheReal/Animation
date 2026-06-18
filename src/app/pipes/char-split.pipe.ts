import { Pipe, PipeTransform } from '@angular/core';

export interface CharToken {
  char: string;    // the character (never a space — spaces are emitted separately)
  delay: number;   // seconds, for transition-delay
  isSpace: boolean;
  isBr: boolean;
}

@Pipe({ name: 'charSplit', standalone: true, pure: true })
export class CharSplitPipe implements PipeTransform {
  /**
   * Input:  'Bronze <br>and Time'
   * Output: CharToken[] — one token per visible character + space/br markers.
   */
  transform(raw: string): CharToken[] {
    const tokens: CharToken[] = [];
    let charIndex = 0;
    // Split on <br> tags while preserving them as separate tokens
    const parts = raw.split(/(<br\s*\/?>)/i);
    for (const part of parts) {
      if (/^<br/i.test(part)) {
        tokens.push({ char: '', delay: 0, isSpace: false, isBr: true });
      } else {
        for (const ch of part) {
          if (ch === ' ') {
            tokens.push({ char: ' ', delay: 0, isSpace: true, isBr: false });
          } else {
            tokens.push({ char: ch, delay: charIndex * 0.035, isSpace: false, isBr: false });
            charIndex++;
          }
        }
      }
    }
    return tokens;
  }
}
