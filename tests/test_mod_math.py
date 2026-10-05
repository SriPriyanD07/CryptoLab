"""
Unit tests for crypto/mod_math.py
"""

import pytest
from crypto.mod_math import (
    mod_add, mod_sub, mod_mul,
    euclidean_gcd, extended_gcd, mod_inverse, mod_pow_steps
)

def test_basic_mod_ops():
    assert mod_add(7, 8, 5)["result"] == 0
    assert mod_sub(3, 7, 5)["result"] == 1
    assert mod_mul(4, 3, 5)["result"] == 2

def test_euclidean_gcd():
    gcd_val, steps = euclidean_gcd(252, 105)
    assert gcd_val == 21
    assert len(steps) > 0

def test_extended_gcd():
    g, x, y, steps = extended_gcd(240, 46)
    assert g == 2
    assert 240 * x + 46 * y == g

def test_mod_inverse():
    # 7 * 3 = 21 ≡ 1 mod 20
    inv_res = mod_inverse(7, 20)
    assert inv_res["exists"] is True
    assert inv_res["inverse"] == 3

    # gcd(6, 9) = 3 != 1 -> no inverse
    no_inv = mod_inverse(6, 9)
    assert no_inv["exists"] is False
    assert no_inv["inverse"] is None

def test_mod_pow_steps():
    res = mod_pow_steps(5, 3, 13)
    # 5^3 = 125 ≡ 8 mod 13
    assert res["result"] == 8
    assert pow(5, 3, 13) == 8
