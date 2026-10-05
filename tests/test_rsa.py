"""
Unit tests for crypto/rsa_lab.py
"""

import pytest
from crypto.rsa_lab import EducationalRSA, ProductionRSA

def test_educational_rsa_math():
    rsa_edu = EducationalRSA(p=61, q=53, e=17)
    params = rsa_edu.get_key_params()
    assert params["n"] == 3233
    assert params["phi"] == 3120
    assert (params["e"] * params["d"]) % params["phi"] == 1

def test_educational_rsa_encrypt_decrypt_number():
    rsa_edu = EducationalRSA(p=61, q=53, e=17)
    msg = 65  # ASCII 'A'
    cipher = rsa_edu.encrypt_number(msg)
    decrypted = rsa_edu.decrypt_number(cipher)
    assert decrypted == msg

def test_educational_rsa_encrypt_decrypt_text():
    rsa_edu = EducationalRSA(p=61, q=53, e=17)
    text = "CryptoLab"
    ciphers = rsa_edu.encrypt_text(text)
    decrypted = rsa_edu.decrypt_text(ciphers)
    assert decrypted == text

def test_production_rsa():
    prod_rsa = ProductionRSA(key_size=2048)
    message = b"Secret message for Production RSA"
    ciphertext = prod_rsa.encrypt(message)
    assert ciphertext != message
    decrypted = prod_rsa.decrypt(ciphertext)
    assert decrypted == message
