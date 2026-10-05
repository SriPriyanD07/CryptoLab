"""
Secure Channel Protocol Laboratory Workbench.
Full end-to-end interactive simulation of modern secure messaging (TLS 1.3 / Signal pattern)
combining Ephemeral ECDH, HKDF-SHA256, and AES-256-GCM AEAD.
"""

import streamlit as st
import pandas as pd
from simulations.secure_channel import SecureChannelParticipant, EncryptedPacket
from simulations.attacker import NetworkAttacker
from ui.components import render_header, render_security_badge, render_attacker_view

def render_secure_channel_view():
    render_header(
        title="Secure Channel Protocol Workbench",
        subtitle="End-to-End Cryptographic Tunnel: Ephemeral ECDH + HKDF-SHA256 + AES-256-GCM"
    )

    render_security_badge(is_educational=False, custom_text="TLS 1.3 / SIGNAL CRYPTOGRAPHIC PRIMITIVE PATTERN")

    st.markdown(
        """
        ```text
        ALICE (Endpoint)                     NETWORK WIRE (Attacker Eve)                     BOB (Endpoint)
        ────────────────                     ───────────────────────────                     ──────────────
        Ephemeral Keypair (d_A, Q_A) ─────── Transmits Q_A ────────────► Receives Q_A
        Receives Q_B  ◄───────────────────── Transmits Q_B ───────────── Ephemeral Keypair (d_B, Q_B)
              │                                                                            │
        Computes Shared Secret S = d_A·Q_B                                          Computes Shared Secret S = d_B·Q_A
              │                                                                            │
        HKDF-SHA256 (K_session)                                                     HKDF-SHA256 (K_session)
              │                                                                            │
        AES-256-GCM Encrypt                                                         AES-256-GCM Decrypt & Verify
        [Plaintext + AAD] ─────────────────── Transmits Packet ────────► [Verify Tag & Extract Plaintext]
                                              [Q_A, Nonce, C, Tag, AAD]
        ```
        """
    )

    if "channel_alice" not in st.session_state:
        alice = SecureChannelParticipant("Alice")
        bob = SecureChannelParticipant("Bob")
        alice.establish_session_key(bob.get_public_bytes())
        bob.establish_session_key(alice.get_public_bytes())
        st.session_state.channel_alice = alice
        st.session_state.channel_bob = bob

    col_rst, col_status = st.columns([1, 3])
    with col_rst:
        if st.button("Reset / Re-Key Ephemeral Channel"):
            alice = SecureChannelParticipant("Alice")
            bob = SecureChannelParticipant("Bob")
            alice.establish_session_key(bob.get_public_bytes())
            bob.establish_session_key(alice.get_public_bytes())
            st.session_state.channel_alice = alice
            st.session_state.channel_bob = bob
            if "active_packet" in st.session_state:
                del st.session_state.active_packet
            st.success("Ephemeral session re-keyed.")

    alice = st.session_state.channel_alice
    bob = st.session_state.channel_bob

    st.markdown("---")
    st.markdown("**1. Alice Endpoint — Compose & Encrypt Message**")

    c_msg_in, c_hdr_in = st.columns(2)
    with c_msg_in:
        plain_input = st.text_input("Plaintext Payload", value="Hello Bob", key="sc_msg")
    with c_hdr_in:
        hdr_input = st.text_input("Associated Data Header (Cleartext)", value="SessionID: 9482 | Proto: TLS_AES_256_GCM_SHA384", key="sc_hdr")

    if st.button("Transmit Encrypted Packet Across Wire", type="primary"):
        st.session_state.active_packet = alice.encrypt_message(plain_input, aad=hdr_input)

    if "active_packet" in st.session_state:
        packet = st.session_state.active_packet

        st.markdown("---")
        st.markdown("**2. Network Wire Capture (Adversary View)**")
        st.caption("Values transmitted unencrypted across the physical wire and captured by an adversary.")

        wire_dict = packet.to_dict()
        df_wire = pd.DataFrame([
            {"Field": "Sender Public Key (Q_A)", "Value": wire_dict["sender_public_bytes_hex"], "Length": "65 bytes (SEC1)"},
            {"Field": "Nonce (IV)", "Value": wire_dict["nonce_hex"], "Length": "12 bytes (96 bits)"},
            {"Field": "Ciphertext", "Value": wire_dict["ciphertext_hex"], "Length": f"{len(packet.ciphertext)} bytes"},
            {"Field": "Authentication Tag", "Value": wire_dict["tag_hex"], "Length": "16 bytes (128 bits)"},
            {"Field": "Associated Data (AAD)", "Value": wire_dict["aad_text"], "Length": f"{len(packet.aad)} bytes"}
        ])
        st.dataframe(df_wire, use_container_width=True, hide_index=True)

        st.markdown("---")
        st.markdown("**3. Active Wire Tampering Control**")

        tamper_choice = st.radio(
            "Adversary Action on Packet in Transit",
            ["Pass Through Unmodified", "Tamper Ciphertext Bytes (Bit-Flip)", "Tamper Associated Data (Altered Routing Header)"],
            horizontal=True
        )

        packet_for_bob = packet
        if tamper_choice == "Tamper Ciphertext Bytes (Bit-Flip)":
            packet_for_bob = NetworkAttacker.tamper_ciphertext(packet, bit_flip_index=0)
        elif tamper_choice == "Tamper Associated Data (Altered Header)":
            packet_for_bob = NetworkAttacker.tamper_aad(packet, forged_aad="SessionID: 9482 | Proto: MALICIOUS_INJECTION")

        st.markdown("---")
        st.markdown("**4. Bob Endpoint — Decryption & Authentication Verification**")

        success, result_message = bob.decrypt_packet(packet_for_bob)

        if success:
            st.success(f"[PACKET ACCEPTED & VERIFIED] Decrypted Plaintext: {result_message}")
        else:
            st.error(f"[PACKET REJECTED] {result_message}")

        render_attacker_view(
            public_data={
                "Wire Ciphertext (Hex)": packet_for_bob.ciphertext.hex(),
                "Wire Nonce (Hex)": packet_for_bob.nonce.hex(),
                "Wire Auth Tag (Hex)": packet_for_bob.tag.hex(),
                "Wire AAD Header": packet_for_bob.aad.decode('utf-8', errors='ignore')
            },
            secret_data={
                "Alice Private Scalar d_A": "[Private memory only]",
                "Bob Private Scalar d_B": "[Private memory only]",
                "Derived Session Key K": alice.session_key.hex(),
                "Protected Plaintext": plain_input
            }
        )
