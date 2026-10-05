"""
Unit tests for crypto/ecdsa_lab.py
"""

import pytest
from crypto.ecdsa_lab import ECDSALab

def test_ecdsa_sign_verify_valid():
    lab = ECDSALab()
    msg = b"Transfer $10,000 to Alice"
    signature = lab.sign(msg)
    
    assert len(signature) > 0
    assert lab.verify(signature, msg) is True

def test_ecdsa_tampered_message_fails():
    lab = ECDSALab()
    msg = b"Transfer $10,000 to Alice"
    signature = lab.sign(msg)
    
    tampered_msg = b"Transfer $90,000 to Eve"
    assert lab.verify(signature, tampered_msg) is False

def test_ecdsa_wrong_public_key_fails():
    lab_alice = ECDSALab()
    lab_bob = ECDSALab()
    
    msg = b"Authentic Announcement"
    signature_alice = lab_alice.sign(msg)
    
    # Verifying Alice's signature using Bob's public key should fail
    assert lab_bob.verify(signature_alice, msg, public_key=lab_bob.public_key) is False
