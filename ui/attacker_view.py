"""
Tampering & Man-in-the-Middle Attack Laboratory Workbench.
Provides interactive packet interception, bit-flipping, header forging,
and recipient authentication rejection inspection.
"""

import streamlit as st
import pandas as pd
from simulations.secure_channel import SecureChannelParticipant, EncryptedPacket
from simulations.attacker import NetworkAttacker
from ui.components import render_header, render_security_badge

def render_attacker_simulation_view():
    render_header(
        title="Tampering & Man-in-the-Middle Attack Workbench",
        subtitle="Active Adversary Wire Mutation, Bit-Flipping, and Cryptographic Authentication Failure"
    )

    render_security_badge(is_educational=False, custom_text="ACTIVE ADVERSARY SIMULATION")

    st.markdown(
        """
        ```text
        ORIGINAL TRANSMISSION               ADVERSARY MUTATION               RECEIVER REJECTION
        ─────────────────────               ──────────────────               ──────────────────
        Alice generates packet     ──►      Eve mutates wire bytes   ──►     Bob computes GHASH
        [Ciphertext, Tag, AAD]              (Bit-flip / Header mod)          Tag mismatch -> REJECT
        ```
        """
    )

    if "att_alice" not in st.session_state:
        alice = SecureChannelParticipant("Alice")
        bob = SecureChannelParticipant("Bob")
        alice.establish_session_key(bob.get_public_bytes())
        bob.establish_session_key(alice.get_public_bytes())
        st.session_state.att_alice = alice
        st.session_state.att_bob = bob

    alice = st.session_state.att_alice
    bob = st.session_state.att_bob

    st.markdown("**1. Original Message Composition (Alice)**")
    c_p, c_a = st.columns(2)
    with c_p:
        orig_msg = st.text_input("Plaintext Payload", value="Authorize transfer of USD 1,000,000 to Account #111", key="tamper_p")
    with c_a:
        orig_aad = st.text_input("Associated Data (Cleartext Header)", value="Priority: High | Source: Authorized-Terminal", key="tamper_a")

    orig_packet = alice.encrypt_message(orig_msg, aad=orig_aad)

    st.markdown("---")
    st.markdown("**2. Adversary Wire Interception & Mutation Studio**")

    attack_vector = st.selectbox(
        "Select Attack Vector",
        [
            "Vector 1: Ciphertext Bit-Flipping Attack",
            "Vector 2: Cleartext Associated Data (AAD) Header Modification",
            "Vector 3: Authentication Tag Bit Corruption"
        ]
    )

    if attack_vector == "Vector 1: Ciphertext Bit-Flipping Attack":
        max_idx = max(0, len(orig_packet.ciphertext) - 1)
        byte_idx = st.slider("Ciphertext Byte Offset to Invert (XOR 0xFF)", min_value=0, max_value=max_idx, value=0)
        mutated_packet = NetworkAttacker.tamper_ciphertext(orig_packet, bit_flip_index=byte_idx)
    elif attack_vector == "Vector 2: Cleartext Associated Data (AAD) Header Modification":
        forged_hdr = st.text_input("Forged Associated Data Header", value="Priority: LOW | Source: ATTACKER-INJECTION")
        mutated_packet = NetworkAttacker.tamper_aad(orig_packet, forged_aad=forged_hdr)
    else:
        corrupted_tag = bytearray(orig_packet.tag)
        corrupted_tag[0] ^= 0x01
        mutated_packet = EncryptedPacket(
            sender_public_bytes=orig_packet.sender_public_bytes,
            nonce=orig_packet.nonce,
            ciphertext=orig_packet.ciphertext,
            tag=bytes(corrupted_tag),
            aad=orig_packet.aad
        )

    st.markdown("**Wire Comparison: Original vs Mutated Packet**")
    comp_df = pd.DataFrame([
        {
            "Field": "Ciphertext (Hex)",
            "Original Wire Byte": orig_packet.ciphertext.hex(),
            "Mutated Wire Byte": mutated_packet.ciphertext.hex(),
            "Modified": orig_packet.ciphertext != mutated_packet.ciphertext
        },
        {
            "Field": "Authentication Tag (Hex)",
            "Original Wire Byte": orig_packet.tag.hex(),
            "Mutated Wire Byte": mutated_packet.tag.hex(),
            "Modified": orig_packet.tag != mutated_packet.tag
        },
        {
            "Field": "Associated Data (AAD)",
            "Original Wire Byte": orig_packet.aad.decode('utf-8', errors='ignore'),
            "Mutated Wire Byte": mutated_packet.aad.decode('utf-8', errors='ignore'),
            "Modified": orig_packet.aad != mutated_packet.aad
        }
    ])
    st.dataframe(comp_df, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.markdown("**3. Target Recipient Evaluation (Bob Interface)**")

    success, result_text = bob.decrypt_packet(mutated_packet)

    if success:
        st.success(f"[STATUS: ACCEPTED] Payload authenticated and decrypted: {result_text}")
    else:
        st.error(f"[STATUS: REJECTED] {result_text}")
        st.caption("GHASH evaluation over the received ciphertext and associated data failed to match the 128-bit authentication tag. Processing was immediately aborted.")
