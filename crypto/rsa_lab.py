"""
RSA Module for CryptoLab.
Implements both Educational RSA (tiny parameters, mathematical demonstration)
and Production RSA (2048-bit RSA with OAEP padding using cryptography library).
"""

import math
from typing import Dict, Any, Tuple, List
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization

class EducationalRSA:
    """
    Educational RSA implementation using small primes for mathematical tracing.
    ⚠️ INSECURE FOR PRODUCTION USE.
    """
    def __init__(self, p: int = 61, q: int = 53, e: int = 17):
        self.p = p
        self.q = q
        self.n = p * q
        self.phi = (p - 1) * (q - 1)
        self.e = e
        
        if math.gcd(self.e, self.phi) != 1:
            raise ValueError(f"e={e} and phi(n)={self.phi} are not coprime (gcd={math.gcd(e, self.phi)}). Choose another e.")
            
        # Compute private exponent d = e^-1 mod phi(n)
        self.d = pow(self.e, -1, self.phi)
        
    def get_key_params(self) -> Dict[str, int]:
        return {
            "p": self.p,
            "q": self.q,
            "n": self.n,
            "phi": self.phi,
            "e": self.e,
            "d": self.d
        }

    def encrypt_number(self, m: int) -> int:
        if m >= self.n:
            raise ValueError(f"Message m={m} must be smaller than modulus n={self.n}")
        return pow(m, self.e, self.n)

    def decrypt_number(self, c: int) -> int:
        return pow(c, self.d, self.n)

    def encrypt_text(self, text: str) -> List[int]:
        return [self.encrypt_number(ord(char)) for char in text]

    def decrypt_text(self, cipher_ints: List[int]) -> str:
        return "".join([chr(self.decrypt_number(c)) for c in cipher_ints])


class ProductionRSA:
    """
    Production-grade RSA using cryptography library with 2048-bit key and OAEP padding.
    """
    def __init__(self, key_size: int = 2048):
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_size
        )
        self.public_key = self.private_key.public_key()

    def get_public_pem(self) -> str:
        return self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

    def get_private_pem(self) -> str:
        return self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')

    def encrypt(self, plaintext: bytes) -> bytes:
        """Encrypts bytes using RSA-OAEP with SHA-256."""
        return self.public_key.encrypt(
            plaintext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

    def decrypt(self, ciphertext: bytes) -> bytes:
        """Decrypts bytes using RSA-OAEP with SHA-256."""
        return self.private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
