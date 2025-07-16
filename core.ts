export async function encryptWithPassword(text: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    
    // PBKDF2を使ってパスワードから鍵にする
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    // 鍵を派生させる
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('salt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-CBC', length: 256 },
        false,
        ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encoder.encode(text)
    );
    
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const encryptedHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return ivHex + ':' + encryptedHex;
}


export async function decryptWithPassword(encryptedText: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Generate key from password using PBKDF2 (same as encryption)
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('salt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt']
    );
    
    const textParts = encryptedText.split(':');
    const ivHex = textParts[0];
    const encryptedHex = textParts[1];
    
    const iv = new Uint8Array(ivHex!.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(encryptedHex!.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encrypted
    );
    
    return decoder.decode(decrypted);
}