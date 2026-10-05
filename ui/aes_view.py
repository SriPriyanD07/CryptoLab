"""
AES-GCM Authenticated Encryption Laboratory Workbench.
Provides interactive AEAD encryption, decryption, tampering verification,
and the Nonce Reuse Catastrophe demonstration.
"""

import streamlit as st
from crypto.aes_lab import AESGCMEngine, demonstrate_nonce_reuse_catastrophe
from cryptography.exceptions import InvalidTag
from ui.components import render_header, render_security_badge, render_attacker_view

def render_aes_view():
    render_header(
        title="AES-GCM Workbench",
        subtitle="Authenticated Encryption with Associated Data (AEAD) via AES-256 and GHASH"
    )

    render_security_badge(is_educational=False, custom_text="OPENSSL / CRYPTOGRAPHY AES-256-GCM AEAD")

    tab1, tab2 = st.tabs([
        "AEAD Encryption & Tampering Verification",
        "Nonce Reuse Catastrophe"
    ])

    with tab1:
        st.markdown("**1. Key and Nonce Initialization**")
        st.caption("The Nonce (IV) is a public uniqueness parameter. It is NOT the secret key, but it MUST NEVER be reused with the same key.")

        if "aes_key" not in st.session_state:
            st.session_state.aes_key = AESGCMEngine.generate_key(256)
        if "aes_nonce" not in st.session_state:
            st.session_state.aes_nonce = AESGCMEngine.generate_nonce(12)

        c_k_btn, c_n_btn = st.columns(2)
        with c_k_btn:
            if st.button("Generate New 256-bit Key"):
                st.session_state.aes_key = AESGCMEngine.generate_key(256)
        with c_n_btn:
            if st.button("Generate New 96-bit Nonce"):
                st.session_state.aes_nonce = AESGCMEngine.generate_nonce(12)

        key_hex = st.session_state.aes_key.hex()
        nonce_hex = st.session_state.aes_nonce.hex()

        col_k, col_n = st.columns(2)
        with col_k:
            st.markdown("**Secret Symmetric Key (256 bits / 32 bytes - KEEP PRIVATE)**")
            st.code(key_hex, language="text")
        with col_n:
            st.markdown("**Public Nonce / IV (96 bits / 12 bytes - PUBLIC & UNIQUE)**")
            st.code(nonce_hex, language="text")

        st.markdown("---")
        st.markdown("**2. Payload Input & Encryption**")

        c_msg, c_aad = st.columns(2)
        with c_msg:
            plaintext = st.text_input("Plaintext Message", value="Hello Bob", key="aes_plain")
        with c_aad:
            aad_input = st.text_input("Associated Data (AAD - Cleartext Authenticated Header)", value="Version: 2.1 | Route: 192.168.1.1", key="aes_aad")

        if st.button("Encrypt (AES-256-GCM)", type="primary"):
            enc_res = AESGCMEngine.encrypt(
                key=st.session_state.aes_key,
                plaintext=plaintext.encode('utf-8'),
                aad=aad_input.encode('utf-8'),
                nonce=st.session_state.aes_nonce
            )
            st.session_state.aes_enc = enc_res

        if "aes_enc" in st.session_state:
            res = st.session_state.aes_enc
            c_hex = res["ciphertext"].hex()
            tag_hex = res["tag"].hex()

            st.markdown("**Cryptographic Output**")
            col_out1, col_out2 = st.columns(2)
            with col_out1:
                st.markdown(f"**Ciphertext (Hex - {len(res['ciphertext'])} bytes)**")
                st.code(c_hex, language="text")
            with col_out2:
                st.markdown(f"**Authentication Tag (Hex - 16 bytes / 128 bits)**")
                st.code(tag_hex, language="text")

            st.markdown("---")
            st.markdown("**3. Decryption & Integrity Verification Experiment**")

            tamper_mode = st.radio(
                "Tamper Control",
                ["Unmodified (Valid)", "Tamper Ciphertext (Flip bit)", "Tamper Associated Data (Altered Header)"],
                horizontal=True
            )

            eval_c = bytearray(res["ciphertext"])
            eval_tag = res["tag"]
            eval_aad = res["aad"]

            if tamper_mode == "Tamper Ciphertext (Flip bit)":
                if len(eval_c) > 0:
                    eval_c[0] ^= 0x01
            elif tamper_mode == "Tamper Associated Data (Altered Header)":
                eval_aad = b"Version: 9.9 | Route: Malicious"

            try:
                decrypted_bytes = AESGCMEngine.decrypt(
                    key=st.session_state.aes_key,
                    nonce=res["nonce"],
                    ciphertext=bytes(eval_c),
                    tag=eval_tag,
                    aad=eval_aad
                )
                st.success(f"[DECRYPTION STATUS: SUCCESS & AUTHENTICATED] Decrypted: {decrypted_bytes.decode('utf-8')}")
            except InvalidTag:
                st.error("[DECRYPTION STATUS: REJECTED] Authentication tag verification failed (InvalidTag). Ciphertext or AAD was tampered with.")

            render_attacker_view(
                public_data={
                    "Nonce (IV)": nonce_hex,
                    "Transmitted Ciphertext": c_hex,
                    "Authentication Tag": tag_hex,
                    "Associated Data": res["aad"].decode('utf-8', errors='ignore')
                },
                secret_data={
                    "Symmetric Key": key_hex,
                    "Original Plaintext": plaintext
                }
            )

    with tab2:
        st.markdown("**Nonce Reuse Catastrophe Workbench**")
        st.caption("Encrypting two distinct plaintexts with the exact same (Key, Nonce) pair causes keystream cancellation: C1 ⊕ C2 = P1 ⊕ P2.")

        p1 = st.text_input("Plaintext 1 (P1)", value="Attack at dawn!", key="nr_p1")
        p2 = st.text_input("Plaintext 2 (P2)", value="Retreat at dusk!", key="nr_p2")

        cat_key = AESGCMEngine.generate_key(256)
        cat_nonce = AESGCMEngine.generate_nonce(12)

        demo = demonstrate_nonce_reuse_catastrophe(cat_key, cat_nonce, p1.encode('utf-8'), p2.encode('utf-8'))

        st.code(
            f"Ciphertext 1 (C1): {demo['c1'].hex()}\n"
            f"Ciphertext 2 (C2): {demo['c2'].hex()}\n\n"
            f"C1 ⊕ C2 (Hex):     {demo['xor_ciphertext'].hex()}\n"
            f"P1 ⊕ P2 (Hex):     {demo['xor_plaintext'].hex()}",
            language="text"
        )

        if demo["xor_matches"]:
            st.error("[SECURITY BREACH: CONFIDENTIALITY COMPROMISED] C1 ⊕ C2 exactly equals P1 ⊕ P2. The keystream is eliminated without knowing the key.")
