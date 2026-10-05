"""
Elliptic Curve Diffie-Hellman (ECDH) Engine for CryptoLab.
Implements SECP256R1 (NIST P-256) key agreement and HKDF key derivation.
"""

from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

class ECDHLab:
    """
    ECDH Key Exchange using SECP256R1 (NIST P-256) and HKDF-SHA256 key derivation.
    """
    def __init__(self, curve=ec.SECP256R1()):
        self.curve = curve
        
        # Generate Alice keypair
        self.alice_private = ec.generate_private_key(self.curve)
        self.alice_public = self.alice_private.public_key()
        
        # Generate Bob keypair
        self.bob_private = ec.generate_private_key(self.curve)
        self.bob_public = self.bob_private.public_key()

    def get_public_bytes(self, public_key: ec.EllipticCurvePublicKey) -> bytes:
        """Serializes public key to SEC1 uncompressed X9.62 format."""
        return public_key.public_bytes(
            encoding=serialization.Encoding.X962,
            format=serialization.PublicFormat.UncompressedPoint
        )

    def compute_raw_shared_secret(self) -> Tuple[bytes, bytes]:
        """Computes raw ECDH shared secret for Alice and Bob."""
        alice_raw = self.alice_private.exchange(ec.ECDH(), self.bob_public)
        bob_raw = self.bob_private.exchange(ec.ECDH(), self.alice_public)
        return alice_raw, bob_raw

    def derive_session_key(self, raw_shared_secret: bytes, salt: bytes = None, info: bytes = b"CryptoLab-ECDH-SessionKey") -> bytes:
        """
        Derives a 256-bit (32-byte) AES symmetric session key using HKDF-SHA256.
        """
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            info=info
        )
        return hkdf.derive(raw_shared_secret)

    def run_full_ecdh_protocol(self) -> Dict[str, Any]:
        """Runs end-to-end ECDH + HKDF simulation."""
        alice_raw, bob_raw = self.compute_raw_shared_secret()
        
        alice_pub_bytes = self.get_public_bytes(self.alice_public)
        bob_pub_bytes = self.get_public_bytes(self.bob_public)
        
        # Derive AES keys
        salt = b"CryptoLab-Fixed-Salt"
        info = b"CryptoLab-ECDH-Session"
        
        alice_aes_key = self.derive_session_key(alice_raw, salt=salt, info=info)
        bob_aes_key = self.derive_session_key(bob_raw, salt=salt, info=info)
        
        return {
            "curve_name": self.curve.name,
            "alice_public_bytes": alice_pub_bytes,
            "bob_public_bytes": bob_pub_bytes,
            "raw_shared_secret_match": (alice_raw == bob_raw),
            "raw_shared_secret_len": len(alice_raw),
            "raw_shared_secret_hex": alice_raw.hex(),
            "derived_aes_key_match": (alice_aes_key == bob_aes_key),
            "alice_aes_key_hex": alice_aes_key.hex(),
            "bob_aes_key_hex": bob_aes_key.hex()
        }
