"""
Unit tests for crypto/ecdh_lab.py
"""

import pytest
from crypto.ecdh_lab import ECDHLab

def test_ecdh_key_exchange():
    ecdh = ECDHLab()
    res = ecdh.run_full_ecdh_protocol()
    
    assert res["curve_name"] == "secp256r1"
    assert res["raw_shared_secret_match"] is True
    assert res["raw_shared_secret_len"] == 32  # 256 bits
    assert res["derived_aes_key_match"] is True
    assert len(res["alice_aes_key_hex"]) == 64  # 32 bytes hex = 64 chars
