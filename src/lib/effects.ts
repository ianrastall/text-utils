export type TextEffect = 'reverse' | 'upside-down' | 'mirror' | 'zalgo' | 'vaporwave' | 'small-caps' | 'alternating';

const upsideDownMap: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
  k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ',
  K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'd', Q: 'Q', R: 'ᴚ', S: 'S', T: '┴',
  U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
  '8': '8', '9': '6',
  ',': "'", '.': '˙', '?': '¿', '!': '¡', '"': '„', "'": ',', '`': ',', '(': ')',
  ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '℘',
  '_': '‾', '‿': '⁀', '⁅': '⁆', '∴': '∵'
};

const mirrorMap: Record<string, string> = {
  a: 'ɒ', b: 'd', c: 'ɔ', d: 'b', e: 'ɘ', f: 'Ꮈ', g: 'ǫ', h: 'ʜ', i: 'i', j: 'ꞁ',
  k: 'ʞ', l: 'l', m: 'm', n: 'n', o: 'o', p: 'q', q: 'p', r: 'ɿ', s: 'ƨ', t: 't',
  u: 'u', v: 'v', w: 'w', x: 'x', y: 'y', z: 'z',
  A: 'A', B: 'ᙠ', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'ꟻ', G: 'อ', H: 'H', I: 'I', J: 'Ⴑ',
  K: 'ﻼ', L: '⅃', M: 'M', N: 'И', O: 'O', P: 'ꟼ', Q: 'Ọ', R: 'Я', S: 'Ƨ', T: 'T',
  U: 'U', V: 'V', W: 'W', X: 'X', Y: 'Y', Z: 'Z',
  '1': '⥝', '2': 'S', '3': 'Ɛ', '4': '4', '5': 'Ƨ', '6': '0', '7': '7', '8': '8', '9': 'e',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '/': '\\', '\\': '/'
};

const smallCapsMap: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

const zalgoUp = ['\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310','\u0352','\u0357','\u0351','\u0307','\u0308','\u030a','\u0342','\u0343','\u0344','\u034a','\u034b','\u034c','\u0303','\u0302','\u030c','\u0350','\u0300','\u0301','\u030b','\u030f','\u0312','\u0313','\u0314','\u033d','\u0309','\u0363','\u0364','\u0365','\u0366','\u0367','\u0368','\u0369','\u036a','\u036b','\u036c','\u036d','\u036e','\u036f','\u033e','\u035b','\u0346','\u031a'];
const zalgoDown = ['\u0316','\u0317','\u0318','\u0319','\u031c','\u031d','\u0320','\u0324','\u0325','\u0326','\u0329','\u032a','\u032b','\u032c','\u032d','\u032e','\u032f','\u0330','\u0331','\u0332','\u0333','\u0339','\u033a','\u033b','\u033c','\u0345','\u0347','\u0348','\u0349','\u034d','\u034e','\u0353','\u0354','\u0355','\u0356','\u0359','\u035a','\u0323'];
const zalgoMid = ['\u0315','\u031b','\u0340','\u0341','\u0358','\u0321','\u0322','\u0327','\u0328','\u0334','\u0335','\u0336','\u034f','\u035c','\u035d','\u035e','\u035f','\u0360','\u0362','\u0338','\u0337','\u0361','\u0489'];

function getRandomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function applyEffect(text: string, effect: TextEffect): string {
  switch (effect) {
    case 'reverse':
      return text.split('').reverse().join('');
    
    case 'upside-down':
      return text.split('').map(c => upsideDownMap[c] || c).reverse().join('');
    
    case 'mirror':
      return text.split('').map(c => mirrorMap[c] || c).reverse().join('');
    
    case 'vaporwave':
      return text.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 33 && code <= 126) {
          return String.fromCharCode(code + 65248);
        }
        if (c === ' ') return '　';
        return c;
      }).join('');
    
    case 'small-caps':
      return text.split('').map(c => smallCapsMap[c.toLowerCase()] || c).join('');
    
    case 'alternating':
      return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    
    case 'zalgo':
      return text.split('').map(c => {
        if (c === '\n' || c === ' ') return c;
        let charStr = c;
        // add up to 3 of each
        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) charStr += getRandomItem(zalgoUp);
        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) charStr += getRandomItem(zalgoDown);
        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) charStr += getRandomItem(zalgoMid);
        return charStr;
      }).join('');
      
    default:
      return text;
  }
}
