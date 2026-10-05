"""
Modular Arithmetic Engine for CryptoLab.
Provides step-by-step algorithms for Modular Arithmetic, GCD, Extended Euclidean Algorithm,
Modular Inverses, and Modular Exponentiation.
"""

from typing import List, Tuple, Dict, Any

def mod_add(a: int, b: int, m: int) -> Dict[str, Any]:
    """Computes (a + b) mod m with step trace."""
    raw = a + b
    res = raw % m
    return {
        "a": a,
        "b": b,
        "m": m,
        "operation": "+",
        "raw_result": raw,
        "result": res,
        "explanation": f"({a} + {b}) = {raw} ≡ {res} (mod {m})"
    }

def mod_sub(a: int, b: int, m: int) -> Dict[str, Any]:
    """Computes (a - b) mod m with step trace."""
    raw = a - b
    res = raw % m
    return {
        "a": a,
        "b": b,
        "m": m,
        "operation": "-",
        "raw_result": raw,
        "result": res,
        "explanation": f"({a} - {b}) = {raw} ≡ {res} (mod {m})"
    }

def mod_mul(a: int, b: int, m: int) -> Dict[str, Any]:
    """Computes (a * b) mod m with step trace."""
    raw = a * b
    res = raw % m
    return {
        "a": a,
        "b": b,
        "m": m,
        "operation": "*",
        "raw_result": raw,
        "result": res,
        "explanation": f"({a} * {b}) = {raw} ≡ {res} (mod {m})"
    }

def euclidean_gcd(a: int, b: int) -> Tuple[int, List[Dict[str, int]]]:
    """
    Computes GCD(a, b) using Euclidean Algorithm and captures each step.
    Returns (gcd_value, list_of_steps).
    """
    steps = []
    x, y = abs(a), abs(b)
    while y != 0:
        q = x // y
        r = x % y
        steps.append({"x": x, "y": y, "quotient": q, "remainder": r})
        x, y = y, r
    return x, steps

def extended_gcd(a: int, b: int) -> Tuple[int, int, int, List[Dict[str, Any]]]:
    """
    Computes Extended Euclidean Algorithm: gcd(a, b) = a*x + b*y
    Returns (gcd, x, y, steps_trace).
    """
    steps = []
    if a == 0:
        return b, 0, 1, [{"a": a, "b": b, "gcd": b, "x": 0, "y": 1}]
    
    old_r, r = a, b
    old_s, s = 1, 0
    old_t, t = 0, 1
    
    while r != 0:
        quotient = old_r // r
        steps.append({
            "old_r": old_r, "r": r, "q": quotient,
            "old_s": old_s, "s": s,
            "old_t": old_t, "t": t
        })
        old_r, r = r, old_r - quotient * r
        old_s, s = s, old_s - quotient * s
        old_t, t = t, old_t - quotient * t
        
    return old_r, old_s, old_t, steps

def mod_inverse(a: int, m: int) -> Dict[str, Any]:
    """
    Calculates the modular multiplicative inverse of a mod m: a*x ≡ 1 (mod m).
    Raises ValueError if inverse does not exist (gcd(a, m) != 1).
    """
    if m <= 1:
        raise ValueError("Modulus must be greater than 1")
    
    g, x, _, steps = extended_gcd(a, m)
    if g != 1:
        return {
            "a": a,
            "m": m,
            "exists": False,
            "gcd": g,
            "inverse": None,
            "explanation": f"Modular inverse does NOT exist because gcd({a}, {m}) = {g} ≠ 1."
        }
    
    inv = x % m
    return {
        "a": a,
        "m": m,
        "exists": True,
        "gcd": g,
        "inverse": inv,
        "steps": steps,
        "explanation": f"{a}⁻¹ mod {m} = {inv} (since {a} * {inv} ≡ 1 mod {m})"
    }

def mod_pow_steps(base: int, exp: int, mod: int) -> Dict[str, Any]:
    """
    Computes (base^exp) % mod using binary exponentiation (Square-and-Multiply)
    and logs step-by-step execution.
    """
    if mod == 1:
        return {"result": 0, "steps": []}
    
    steps = []
    result = 1
    current_base = base % mod
    binary_exp = bin(exp)[2:]
    
    for idx, bit in enumerate(reversed(binary_exp)):
        step_info = {
            "step": idx,
            "bit": bit,
            "base_before": current_base,
            "result_before": result
        }
        if bit == '1':
            result = (result * current_base) % mod
        current_base = (current_base * current_base) % mod
        step_info["result_after"] = result
        step_info["base_after"] = current_base
        steps.append(step_info)
        
    return {
        "base": base,
        "exp": exp,
        "mod": mod,
        "binary_exp": binary_exp,
        "result": pow(base, exp, mod),
        "steps": steps
    }
