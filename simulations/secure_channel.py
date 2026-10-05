"""
Secure Channel Integration Protocol for CryptoLab.
Combines ECDH Key Exchange, HKDF-SHA256 Key Derivation, and AES-256-GCM AEAD Encryption.
"""

import base64
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import ec
from crypto.ecdh_lab import ECDHLab
from crypto.aes_lab import AESGCMEngine
from cryptography.exceptions import InvalidTag

class EncryptedPacket:
    """
    Represents the unencrypted network payload transmitted over the wire.
    """
    def __init__(self, sender_public_bytes: bytes, nonce: bytes, ciphertext: bytes, tag: bytes, aad: bytes):
        self.sender_public_bytes = sender_public_bytes
        self.nonce = nonce
        self.ciphertext = ciphertext
        self.tag = tag
        self.aad = aad

    def to_dict(self) -> Dict[str, str]:
        return {
            "sender_public_bytes_hex": self.sender_public_bytes.hex(),
            "nonce_hex": self.nonce.hex(),
            "ciphertext_hex": self.ciphertext.hex(),
            "tag_hex": self.tag.hex(),
            "aad_text": self.aad.decode('utf-8', errors='ignore')
        }


class SecureChannelParticipant:
    """
    Participant (Alice or Bob) holding local ephemeral state in a Secure Channel session.
    """
    def __init__(self, name: str):
        self.name = name
        self.ecdh_lab = ECDHLab()
        self.session_key = None

    def get_public_bytes(self) -> bytes:
        return self.ecdh_lab.get_public_bytes(self.ecdh_lab.alice_public)

    def establish_session_key(self, peer_public_bytes: bytes, salt: bytes = b"CryptoLab-Channel-Salt"):
        """Computes ECDH shared secret with peer and derives AES session key via HKDF."""
        # Deserializes peer SEC1 public key
        peer_pub_key = ec.EllipticCurvePublicKey.from_encoded_point(
            self.ecdh_lab.curve,
            peer_public_bytes
        )
        raw_shared = self.ecdh_lab.alice_private.exchange(ec.ECDH(), peer_pub_key)
        self.session_key = self.ecdh_lab.derive_session_key(raw_shared, salt=salt, info=b"CryptoLab-Channel-Session")

    def encrypt_message(self, plaintext: str, aad: str = "") -> EncryptedPacket:
        if self.session_key is None:
            raise RuntimeError("Session key not established! Complete key exchange first.")
            
        enc = AESGCMEngine.encrypt(
            key=self.session_key,
            plaintext=plaintext.encode('utf-8'),
            aad=aad.encode('utf-8')
        )
        return EncryptedPacket(
            sender_public_bytes=self.get_public_bytes(),
            nonce=enc["nonce"],
            ciphertext=enc["ciphertext"],
            tag=enc["tag"],
            aad=enc["aad"]
        )

    def decrypt_packet(self, packet: EncryptedPacket) -> Tuple[bool, str]:
        """
        Decrypts network packet.
        Returns (success_flag, plaintext_or_error_message).
        """
        if self.session_key is None:
            raise RuntimeError("Session key not established!")
            
        try:
            decrypted_bytes = AESGCMEngine.decrypt(
                key=self.session_key,
                nonce=packet.nonce,
                ciphertext=packet.ciphertext,
                tag=packet.tag,
                aad=packet.aad
            )
            return True, decrypted_bytes.decode('utf-8')
        except InvalidTag:
            return False, "MESSAGE REJECTED: Authentication verification failed! Packet payload or headers modified in transit."
