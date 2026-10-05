"""
Unit tests for simulations/secure_channel.py and simulations/attacker.py
"""

import pytest
from simulations.secure_channel import SecureChannelParticipant
from simulations.attacker import NetworkAttacker

def test_secure_channel_end_to_end():
    alice = SecureChannelParticipant("Alice")
    bob = SecureChannelParticipant("Bob")
    
    # Establish Session Key
    alice.establish_session_key(bob.get_public_bytes())
    bob.establish_session_key(alice.get_public_bytes())
    
    assert alice.session_key == bob.session_key
    
    # Encrypt
    packet = alice.encrypt_message("Secret Wire Transfer: $500,000", aad="Seq: 101")
    
    # Decrypt
    success, decrypted_text = bob.decrypt_packet(packet)
    assert success is True
    assert decrypted_text == "Secret Wire Transfer: $500,000"

def test_tampered_ciphertext_rejection():
    alice = SecureChannelParticipant("Alice")
    bob = SecureChannelParticipant("Bob")
    
    alice.establish_session_key(bob.get_public_bytes())
    bob.establish_session_key(alice.get_public_bytes())
    
    original_packet = alice.encrypt_message("Secret Wire Transfer: $500,000", aad="Seq: 101")
    
    # Attacker tampers ciphertext
    tampered_packet = NetworkAttacker.tamper_ciphertext(original_packet, bit_flip_index=2)
    
    success, err_msg = bob.decrypt_packet(tampered_packet)
    assert success is False
    assert "MESSAGE REJECTED" in err_msg

def test_tampered_aad_rejection():
    alice = SecureChannelParticipant("Alice")
    bob = SecureChannelParticipant("Bob")
    
    alice.establish_session_key(bob.get_public_bytes())
    bob.establish_session_key(alice.get_public_bytes())
    
    original_packet = alice.encrypt_message("Secret Wire Transfer: $500,000", aad="Seq: 101")
    
    # Attacker tampers AAD header
    tampered_packet = NetworkAttacker.tamper_aad(original_packet, forged_aad="Seq: 999 (Forged Header)")
    
    success, err_msg = bob.decrypt_packet(tampered_packet)
    assert success is False
    assert "MESSAGE REJECTED" in err_msg
