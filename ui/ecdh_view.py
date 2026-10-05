"""
Elliptic Curve Diffie-Hellman (ECDH) Laboratory Workbench.
Provides interactive key agreement over SECP256R1, HKDF key derivation,
and technical comparison between Classical DH and ECDH.
"""

import streamlit as st
import pandas as pd
from crypto.ecdh_lab import ECDHLab
from ui.components import render_header, render_security_badge, render_attacker_view

def render_ecdh_view():
    render_header(
        title="ECDH Key Exchange Workbench",
        subtitle="Elliptic Curve Diffie-Hellman over SECP256R1 (NIST P-256) with HKDF Key Derivation"
    )

    render_security_badge(is_educational=False, custom_text="OPENSSL / CRYPTOGRAPHY SECP256R1 + HKDF-SHA256")

    if "ecdh_lab" not in st.session_state:
        st.session_state.ecdh_lab = ECDHLab()

    if st.button("Generate Ephemeral Keypairs & Execute ECDH", type="primary"):
        st.session_state.ecdh_lab = ECDHLab()

    lab = st.session_state.ecdh_lab
    res = lab.run_full_ecdh_protocol()

    st.markdown("**1. Endpoint Public Points Transmitted Over Wire (SEC1 Uncompressed Format - 65 bytes)**")
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Alice Public Point Q_A (Hex)**")
        st.code(res["alice_public_bytes"].hex(), language="text")
    with c2:
        st.markdown("**Bob Public Point Q_B (Hex)**")
        st.code(res["bob_public_bytes"].hex(), language="text")

    st.markdown("---")
    st.markdown("**2. Scalar Multiplication & Shared Point Derivation**")
    st.markdown(
        """
        ```text
        Alice Computes:  S = d_A · Q_B = d_A · (d_B · G) = (d_A · d_B) · G
        Bob Computes:    S = d_B · Q_A = d_B · (d_A · G) = (d_A · d_B) · G
        ```
        """
    )

    st.markdown("**Raw ECDH Shared Secret (Point X-Coordinate - 32 bytes / 256 bits)**")
    st.code(res["raw_shared_secret_hex"], language="text")
    if res["raw_shared_secret_match"]:
        st.success("Curve point match confirmed: Alice and Bob computed the identical elliptic curve coordinate.")

    st.markdown("---")
    st.markdown("**3. Symmetric Session Key Derivation (HKDF-SHA256)**")
    st.caption("Raw curve coordinates exhibit non-uniform distribution. HKDF extracts entropy and expands into a cryptographically uniform 256-bit AES key.")

    col_k1, col_k2 = st.columns(2)
    with col_k1:
        st.markdown("**Alice Derived AES-256 Session Key**")
        st.code(res["alice_aes_key_hex"], language="text")
    with col_k2:
        st.markdown("**Bob Derived AES-256 Session Key**")
        st.code(res["bob_aes_key_hex"], language="text")

    if res["derived_aes_key_match"]:
        st.success("Session key derivation confirmed: Both endpoints hold identical 256-bit symmetric keys.")

    st.markdown("---")
    render_attacker_view(
        public_data={
            "Curve": res["curve_name"],
            "Alice Public Point Q_A": res["alice_public_bytes"].hex()[:32] + "...",
            "Bob Public Point Q_B": res["bob_public_bytes"].hex()[:32] + "..."
        },
        secret_data={
            "Alice Scalar Private Key d_A": "[256-bit scalar integer]",
            "Bob Scalar Private Key d_B": "[256-bit scalar integer]",
            "Derived AES Session Key": res["alice_aes_key_hex"]
        }
    )

    st.markdown("---")
    st.markdown("**Technical Comparison: Classical Finite-Field DH vs Modern ECDH**")
    df_comp = pd.DataFrame([
        {"Property": "Mathematical Foundation", "Classical DH (FFDH)": "Modular exponentiation in finite cyclic group (Z_p*)", "ECDH": "Point scalar multiplication on elliptic curve (y^2 = x^3 + ax + b)"},
        {"Property": "Underlying Hard Problem", "Classical DH (FFDH)": "Discrete Logarithm Problem (DLP)", "ECDH": "Elliptic Curve Discrete Logarithm Problem (ECDLP)"},
        {"Property": "Equivalent 128-bit Security Key Size", "Classical DH (FFDH)": "3072-bit modulus", "ECDH": "256-bit curve (e.g. SECP256R1 / Curve25519)"},
        {"Property": "Public Key Overhead", "Classical DH (FFDH)": "384 bytes", "ECDH": "33 to 65 bytes"},
        {"Property": "Computational Speed", "Classical DH (FFDH)": "Slow (heavy modular multiplication)", "ECDH": "Fast (compact coordinate doubling & addition)"}
    ])
    st.dataframe(df_comp, use_container_width=True, hide_index=True)
