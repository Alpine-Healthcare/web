import * as aes from "ethereum-cryptography/aes.js";
import { bytesToUtf8, hexToBytes, utf8ToBytes } from "ethereum-cryptography/utils.js";
import { getRandomBytes } from 'ethereum-cryptography/random';


export const publicKeyToHex = (publicKey: string) => {
  return publicKey.slice(2)
}

export const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

export const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export const importAddressAsHmacKey = async (keyBytes: Uint8Array) => {
    return await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-KW", length: 128 },
        true,
        ["wrapKey", "unwrapKey"]
      ); }


// 1. Convert your IV (typically a Uint8Array) into a temporary CryptoKey
//    so we can use wrapKey() on it. We'll treat the IV as "raw" key material.
export const importIvAsKey = async (iv: Uint8Array) =>  {
    // For demonstration, let’s treat the IV as an AES key just so that
    // Web Crypto will allow us to import it as "raw" key material. In reality,
    // you wouldn’t normally do this, but it shows how to wrap an arbitrary byte buffer.
    return window.crypto.subtle.importKey(
      "raw",
      iv,    // ArrayBufferView
      { name: "AES-GCM", length: 128 }, // or 256, but must match iv.byteLength * 8 if it’s to be recognized
      true,  // extractable (so we can wrap it)
      ["encrypt", "decrypt"] // usage
    );
  }
  
  // 2. Wrap that "key" using your public key.
export const wrapIv = async (iv: Uint8Array, publicKey: CryptoKey) => {
    const ivAsKey = await importIvAsKey(iv);
    const wrapped = await window.crypto.subtle.wrapKey(
      "raw",            // format of ivAsKey when unwrapped
      ivAsKey,          // the key to wrap
      publicKey,        // the RSA public key
    { name: "AES-KW", length: 128 },
    );
    return wrapped; // an ArrayBuffer with the encrypted (wrapped) data
  }