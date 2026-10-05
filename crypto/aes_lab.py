"""
AES & AES-GCM (Galois/Counter Mode) Authenticated Encryption Module for CryptoLab.
Implements AES-256-GCM AEAD encryption, decryption, AAD authentication, and Nonce Reuse Catastrophe demonstration.
"""

import os
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

class AESGCMEngine:
    """
    AEAD Authenticated Encryption using AES-GCM (128/256 bit keys).
    """
    @staticmethod
    def generate_key(bit_length: int = 256) -> bytes:
        if bit_length not in (128, 192, 256):
            raise ValueError("AES key length must be 128, 192, or 256 bits")
        return AESGCM.generate_key(bit_length=bit_length)

    @staticmethod
    def generate_nonce(byte_length: int = 12) -> bytes:
        """Generates 96-bit (12-byte) standard cryptographically secure random nonce."""
        return os.urandom(byte_length)

    @staticmethod
    def encrypt(key: bytes, plaintext: bytes, aad: bytes = None, nonce: bytes = None) -> Dict[str, bytes]:
        """
        Encrypts plaintext using AES-GCM.
        Returns dictionary containing key, nonce, ciphertext, tag, and aad.
        Note: Python's cryptography AESGCM.encrypt returns (ciphertext + 16-byte tag).
        """
        if nonce is None:
            nonce = AESGCMEngine.generate_nonce(12)
            
        aesgcm = AESGCM(key)
        raw_output = aesgcm.encrypt(nonce, plaintext, aad)
        
        ciphertext = raw_output[:-16]
        tag = raw_output[-16:]
        
        return {
            "key": key,
            "nonce": nonce,
            "ciphertext": ciphertext,
            "tag": tag,
            "raw_combined": raw_output,
            "aad": aad if aad is not None else b""
        }

    @staticmethod
    def decrypt(key: bytes, nonce: bytes, ciphertext: bytes, tag: bytes, aad: bytes = None) -> bytes:
        """
        Decrypts ciphertext and verifies authentication tag using AES-GCM.
        Raises InvalidTag if ciphertext, tag, or AAD was tampered with.
        """
        aesgcm = AESGCM(key)
        raw_combined = ciphertext + tag
        return aesgcm.decrypt(nonce, raw_combined, aad if aad is not None else b"")

def demonstrate_nonce_reuse_catastrophe(key: bytes, nonce: bytes, msg1: bytes, msg2: bytes) -> Dict[str, Any]:
    """
    Demonstrates why reusing a nonce with the same key in AES-GCM destroys confidentiality.
    C1 = P1 ⊕ KeyStream
    C2 = P2 ⊕ KeyStream
    => C1 ⊕ C2 = P1 ⊕ P2 !
    """
    res1 = AESGCMEngine.encrypt(key, msg1, nonce=nonce)
    res2 = AESGCMEngine.encrypt(key, msg2, nonce=nonce)
    
    c1 = res1["ciphertext"]
    c2 = res2["ciphertext"]
    
    # XOR ciphertexts
    min_len = min(len(c1), len(c2))
    xor_ciphertext = bytes([c1[i] ^ c2[i] for i in range(min_len)])
    xor_plaintext = bytes([msg1[i] ^ msg2[i] for i in range(min_len)])
    
    return {
        "msg1": msg1,
        "msg2": msg2,
        "c1": c1,
        "c2": c2,
        "xor_ciphertext": xor_ciphertext,
        "xor_plaintext": xor_plaintext,
        "xor_matches": (xor_ciphertext == xor_plaintext)
    }
