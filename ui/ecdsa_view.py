"""
ECDSA Digital Signatures Laboratory Workbench.
Provides interactive signing, DER signature inspection, and message tampering verification.
"""

import streamlit as st
import base64
from crypto.ecdsa_lab import ECDSALab
from ui.components import render_header, render_security_badge, render_attacker_view

def render_ecdsa_view():
    render_header(
        title="ECDSA Signatures Workbench",
        subtitle="Digital Signatures, Integrity Verification, and Origin Authentication over SECP256R1"
    )

    render_security_badge(is_educational=False, custom_text="OPENSSL / CRYPTOGRAPHY SECP256R1 + SHA-256")

    st.markdown(
        """
        ```text
        ECDH  → Key Agreement (Alice and Bob establish a shared secret)
        ECDSA → Digital Signatures (Alice signs with private key; anyone verifies with public key)
        ```
        """
    )

    if "ecdsa_lab" not in st.session_state:
        st.session_state.ecdsa_lab = ECDSALab()

    col_btn, col_info = st.columns([1, 3])
    with col_btn:
        if st.button("Generate New Signing Keypair"):
            st.session_state.ecdsa_lab = ECDSALab()
            st.success("New SECP256R1 keypair generated.")

    lab = st.session_state.ecdsa_lab

    with st.expander("Inspecting Signer Public Key (SubjectPublicKeyInfo PEM)"):
        st.text_area("Public Key PEM", lab.get_public_pem(), height=110)

    st.markdown("---")
    st.markdown("**1. Message Signing**")

    sign_msg = st.text_input("Original Message to Sign", value="Transfer ₹100 to Alice", key="ecdsa_msg_in")

    if "ecdsa_sig" not in st.session_state or st.session_state.get("last_signed_msg") != sign_msg:
        st.session_state.ecdsa_sig = lab.sign(sign_msg.encode('utf-8'))
        st.session_state.last_signed_msg = sign_msg

    sig_bytes = st.session_state.ecdsa_sig
    b64_sig = base64.b64encode(sig_bytes).decode('utf-8')
    hex_sig = sig_bytes.hex()

    c_sig1, c_sig2 = st.columns(2)
    with c_sig1:
        st.markdown("**Generated ASN.1 DER Signature (Hex - 70-72 bytes)**")
        st.code(hex_sig, language="text")
    with c_sig2:
        st.markdown("**Signature (Base64 Encoded)**")
        st.code(b64_sig, language="text")

    st.markdown("---")
    st.markdown("**2. Verification & Live Tampering Experiment**")
    st.caption("Alter the text below to simulate an active attacker modifying the payload in transit.")

    eval_msg = st.text_input("Message Received at Verifier", value=sign_msg, key="ecdsa_msg_eval")

    is_valid = lab.verify(sig_bytes, eval_msg.encode('utf-8'))

    if is_valid:
        st.success("[VERIFICATION STATUS: VALID] Signature matches message and public key. Authenticity and integrity intact.")
    else:
        st.error("[VERIFICATION STATUS: INVALID] Verification failed. Message content was modified or key mismatched.")

    st.markdown("---")
    render_attacker_view(
        public_data={
            "Intercepted Message": eval_msg,
            "DER Signature (Hex)": hex_sig[:32] + "...",
            "Signer Public Key": lab.get_public_pem()[:32] + "..."
        },
        secret_data={
            "Signer Private Scalar": "[256-bit scalar integer]",
            "Per-Signature Nonce k": "[Random scalar - MUST NEVER BE REUSED]"
        }
    )
