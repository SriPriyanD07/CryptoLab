"""
SHA-256 & Cryptographic Hashing Module for CryptoLab.
Implements SHA-256 hashing, digest formatting, and bit-level Avalanche Effect analysis.
"""

import hashlib
from typing import Dict, Any, Tuple

def compute_sha256(data: bytes) -> Dict[str, Any]:
    """Computes SHA-256 digest in hex and binary formats."""
    hasher = hashlib.sha256()
    hasher.update(data)
    hex_digest = hasher.hexdigest()
    
    # Convert hex digest to 256-bit binary string
    bin_digest = bin(int(hex_digest, 16))[2:].zfill(256)
    
    return {
        "hex": hex_digest,
        "bytes_len": 32,
        "bit_len": 256,
        "binary": bin_digest
    }

def analyze_avalanche_effect(text1: str, text2: str) -> Dict[str, Any]:
    """
    Compares SHA-256 digests of text1 and text2 to quantify bit difference (Hamming Distance).
    """
    res1 = compute_sha256(text1.encode('utf-8'))
    res2 = compute_sha256(text2.encode('utf-8'))
    
    bin1 = res1["binary"]
    bin2 = res2["binary"]
    
    # Count bit differences
    differing_bits = sum(b1 != b2 for b1, b2 in zip(bin1, bin2))
    bit_flip_percentage = (differing_bits / 256) * 100.0
    
    return {
        "text1": text1,
        "hash1_hex": res1["hex"],
        "hash1_bin": bin1,
        "text2": text2,
        "hash2_hex": res2["hex"],
        "hash2_bin": bin2,
        "differing_bits": differing_bits,
        "total_bits": 256,
        "percentage_flipped": round(bit_flip_percentage, 2)
    }
