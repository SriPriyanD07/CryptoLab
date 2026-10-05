"""
ECDSA (Elliptic Curve Digital Signature Algorithm) Module for CryptoLab.
Implements message hashing, signing, DER signature formatting, and verification.
"""

from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

class ECDSALab:
    """
    ECDSA Signing and Verification engine using SECP256R1 and SHA-256.
    """
    def __init__(self, curve=ec.SECP256R1()):
        self.curve = curve
        self.private_key = ec.generate_private_key(self.curve)
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

    def sign(self, message: bytes) -> bytes:
        """Signs message bytes using ECDSA with SHA-256."""
        return self.private_key.sign(
            message,
            ec.ECDSA(hashes.SHA256())
        )

    def verify(self, signature: bytes, message: bytes, public_key: ec.EllipticCurvePublicKey = None) -> bool:
        """
        Verifies ECDSA signature against message bytes.
        Returns True if valid, False if invalid or tampered.
        """
        target_pub_key = public_key if public_key is not None else self.public_key
        try:
            target_pub_key.verify(
                signature,
                message,
                ec.ECDSA(hashes.SHA256())
            )
            return True
        except InvalidSignature:
            return False
