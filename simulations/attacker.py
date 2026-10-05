"""
Attacker Network Sniffing & Tampering Module for CryptoLab.
Simulates an active Adversary (Eve / Mallory) intercepting and modifying packets on the wire.
"""

from typing import Dict, Any
from simulations.secure_channel import EncryptedPacket

class NetworkAttacker:
    """
    Simulates network adversary eavesdropping and active packet tampering.
    """
    @staticmethod
    def inspect_sniffed_packet(packet: EncryptedPacket) -> Dict[str, Any]:
        """Returns what an attacker sitting on the wire can inspect."""
        return {
            "sender_public_key_hex": packet.sender_public_bytes.hex(),
            "nonce_hex": packet.nonce.hex(),
            "ciphertext_hex": packet.ciphertext.hex(),
            "tag_hex": packet.tag.hex(),
            "aad_cleartext": packet.aad.decode('utf-8', errors='ignore'),
            "can_read_private_keys": False,
            "can_read_session_key": False,
            "can_decrypt_payload": False
        }

    @staticmethod
    def tamper_ciphertext(packet: EncryptedPacket, bit_flip_index: int = 0) -> EncryptedPacket:
        """Flips bits in the encrypted ciphertext payload."""
        raw_c = bytearray(packet.ciphertext)
        if len(raw_c) > 0:
            target_idx = bit_flip_index % len(raw_c)
            raw_c[target_idx] ^= 0xFF  # Flip all bits in byte
            
        return EncryptedPacket(
            sender_public_bytes=packet.sender_public_bytes,
            nonce=packet.nonce,
            ciphertext=bytes(raw_c),
            tag=packet.tag,
            aad=packet.aad
        )

    @staticmethod
    def tamper_aad(packet: EncryptedPacket, forged_aad: str) -> EncryptedPacket:
        """Modifies cleartext Associated Data header in transit."""
        return EncryptedPacket(
            sender_public_bytes=packet.sender_public_bytes,
            nonce=packet.nonce,
            ciphertext=packet.ciphertext,
            tag=packet.tag,
            aad=forged_aad.encode('utf-8')
        )
