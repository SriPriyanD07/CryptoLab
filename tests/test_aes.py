"""
Unit tests for crypto/aes_lab.py
"""

import pytest
from cryptography.exceptions import InvalidTag
from crypto.aes_lab import AESGCMEngine, demonstrate_nonce_reuse_catastrophe

def test_aes_gcm_encrypt_decrypt():
    key = AESGCMEngine.generate_key(256)
    plaintext = b"Top Secret Payload 123"
    aad = b"Header: Version 1.0"
    
    enc_res = AESGCMEngine.encrypt(key, plaintext, aad=aad)
    
    decrypted = AESGCMEngine.decrypt(
        key=key,
        nonce=enc_res["nonce"],
        ciphertext=enc_res["ciphertext"],
        tag=enc_res["tag"],
        aad=aad
    )
    assert decrypted == plaintext

def test_aes_gcm_tampered_ciphertext_fails():
    key = AESGCMEngine.generate_key(256)
    plaintext = b"Top Secret Payload 123"
    enc_res = AESGCMEngine.encrypt(key, plaintext)
    
    # Tamper with 1 byte of ciphertext
    tampered_ciphertext = bytearray(enc_res["ciphertext"])
    tampered_ciphertext[0] ^= 0xFF
    
    with pytest.raises(InvalidTag):
        AESGCMEngine.decrypt(
            key=key,
            nonce=enc_res["nonce"],
            ciphertext=bytes(tampered_ciphertext),
            tag=enc_res["tag"]
        )

def test_aes_gcm_tampered_aad_fails():
    key = AESGCMEngine.generate_key(256)
    plaintext = b"Top Secret Payload 123"
    aad = b"Sender: Alice"
    enc_res = AESGCMEngine.encrypt(key, plaintext, aad=aad)
    
    with pytest.raises(InvalidTag):
        AESGCMEngine.decrypt(
            key=key,
            nonce=enc_res["nonce"],
            ciphertext=enc_res["ciphertext"],
            tag=enc_res["tag"],
            aad=b"Sender: Eve" # Tampered AAD
        )

def test_nonce_reuse_catastrophe():
    key = AESGCMEngine.generate_key(256)
    nonce = AESGCMEngine.generate_nonce(12)
    m1 = b"Attack at dawn!"
    m2 = b"Retreat at dusk!"
    
    demo = demonstrate_nonce_reuse_catastrophe(key, nonce, m1, m2)
    assert demo["xor_matches"] is True
