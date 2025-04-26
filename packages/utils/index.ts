/**
 * 生成文件的唯一标识符
 * 使用 Web Crypto API 来生成哈希，这在现代浏览器和 Node.js 环境都可用
 */
export async function generateFileId(path: string, name: string): Promise<string> {
  const text = `${path}${name}`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    
    // 将 buffer 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } else {
    // Node.js environment
    const { createHash } = await import('crypto');
    const hash = createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
  }
}