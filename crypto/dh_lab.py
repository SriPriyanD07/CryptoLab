"""
Diffie-Hellman Key Exchange Module for CryptoLab.
Implements Educational DH (small modulus p, generator g) and
Production DH (Standard RFC 3526 2048-bit MODP Group using cryptography library).
"""

import math
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import dh

class EducationalDH:
    """
    Educational Diffie-Hellman demonstration using small numbers.
    ⚠️ INSECURE FOR PRODUCTION USE.
    """
    def __init__(self, p: int = 23, g: int = 5):
        self.p = p
        self.g = g

    def generate_public_key(self, private_key: int) -> int:
        """Computes Public Key = g^private_key mod p"""
        return pow(self.g, private_key, self.p)

    def compute_shared_secret(self, peer_public_key: int, private_key: int) -> int:
        """Computes Shared Secret = (peer_public_key)^private_key mod p"""
        return pow(peer_peer_public_key if False else peer_public_key, private_key, self.p)

    def get_full_exchange_trace(self, a_secret: int = 6, b_secret: int = 15) -> Dict[str, Any]:
        """Runs complete simulated exchange between Alice and Bob."""
        A = self.generate_public_key(a_secret)
        B = self.generate_public_key(b_secret)
        
        s_alice = self.compute_shared_secret(B, a_secret)
        s_bob = self.compute_shared_secret(A, b_secret)
        
        return {
            "p": self.p,
            "g": self.g,
            "alice": {
                "private_a": a_secret,
                "public_A": A,
                "computed_secret": s_alice,
                "formula": f"B^a mod p = {B}^{a_secret} mod {self.p} = {s_alice}"
            },
            "bob": {
                "private_b": b_secret,
                "public_B": B,
                "computed_secret": s_bob,
                "formula": f"A^b mod p = {A}^{b_secret} mod {self.p} = {s_bob}"
            },
            "attacker_sees": {
                "p": self.p,
                "g": self.g,
                "public_A": A,
                "public_B": B
            },
            "secrets_match": (s_alice == s_bob)
        }


class ProductionDH:
    """
    Production Diffie-Hellman key exchange using standard 2048-bit MODP group parameters.
    """
    def __init__(self):
        # Generate standard 2048-bit DH parameters
        self.parameters = dh.generate_parameters(generator=2, key_size=2048)
        
        # Generate Alice and Bob keypairs
        self.alice_private = self.parameters.generate_private_key()
        self.alice_public = self.alice_private.public_key()
        
        self.bob_private = self.parameters.generate_private_key()
        self.bob_public = self.bob_private.public_key()

    def exchange(self) -> Tuple[bytes, bytes]:
        """Computes shared secret for Alice and Bob."""
        alice_shared = self.alice_private.exchange(self.bob_public)
        bob_shared = self.bob_private.exchange(self.alice_public)
        return alice_shared, bob_shared
