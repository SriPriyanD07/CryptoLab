"""
Unit tests for crypto/hash_lab.py
"""

import pytest
from crypto.hash_lab import compute_sha256, analyze_avalanche_effect

def test_sha256_deterministic():
    res1 = compute_sha256(b"Hello World")
    res2 = compute_sha256(b"Hello World")
    
    assert res1["hex"] == res2["hex"]
    assert len(res1["hex"]) == 64
    assert len(res1["binary"]) == 256

def test_avalanche_effect():
    # Changing 'W' to 'w' (single bit difference in ASCII)
    analysis = analyze_avalanche_effect("Hello World", "Hello world")
    
    assert analysis["hash1_hex"] != analysis["hash2_hex"]
    # Ideally around 50% bits flip (between 35% and 65%)
    assert 30 <= analysis["percentage_flipped"] <= 70
