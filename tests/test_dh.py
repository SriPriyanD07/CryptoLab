"""
Unit tests for crypto/dh_lab.py
"""

import pytest
from crypto.dh_lab import EducationalDH, ProductionDH

def test_educational_dh_matching_secret():
    dh_edu = EducationalDH(p=23, g=5)
    trace = dh_edu.get_full_exchange_trace(a_secret=6, b_secret=15)
    
    assert trace["secrets_match"] is True
    # g^(ab) mod p: 5^(6*15) = 5^90 mod 23
    # 5^1 = 5, 5^2 = 25 = 2, 5^3 = 10, 5^4 = 4, 5^22 = 1 mod 23 (Fermat's Little Thm)
    # 90 mod 22 = 2 => 5^2 = 2 mod 23.
    assert trace["alice"]["computed_secret"] == 2
    assert trace["bob"]["computed_secret"] == 2

def test_production_dh_exchange():
    dh_prod = ProductionDH()
    alice_secret, bob_secret = dh_prod.exchange()
    assert len(alice_secret) > 0
    assert alice_secret == bob_secret
