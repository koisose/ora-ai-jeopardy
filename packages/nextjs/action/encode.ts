export function encodeString(str: string) {
    return Buffer.from(str, 'utf-8').toString('hex');
  }
  
  export function decodeString(encodedStr: string) {
    return Buffer.from(encodedStr, 'hex').toString('utf-8');
  }
  