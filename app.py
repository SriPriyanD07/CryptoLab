"""
CryptoLab - Interactive Cryptography Laboratory
Laboratory Entry Point and Navigation Dispatcher.
"""

import streamlit as st

st.set_page_config(
    page_title="CryptoLab — Interactive Cryptography Laboratory",
    layout="wide",
    initial_sidebar_state="expanded"
)

from ui.components import apply_technical_styles
from ui.mod_view import render_mod_math_view
from ui.rsa_view import render_rsa_view
from ui.dh_view import render_dh_view
from ui.ecdh_view import render_ecdh_view
from ui.ecdsa_view import render_ecdsa_view
from ui.hash_view import render_hash_view
from ui.aes_view import render_aes_view
from ui.secure_channel_view import render_secure_channel_view
from ui.attacker_view import render_attacker_simulation_view

def main():
    apply_technical_styles()
    
    st.sidebar.markdown(
        """
        <div style="padding-bottom: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid #262730;">
            <div style="font-size: 1.15rem; font-weight: 700; letter-spacing: -0.01em; color: #f3f4f6;">CryptoLab</div>
            <div style="font-size: 0.75rem; color: #9ca3af; font-family: monospace;">Interactive Cryptography Laboratory</div>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    navigation_options = [
        "Modular Arithmetic",
        "RSA Workbench",
        "Diffie-Hellman",
        "ECDH Key Exchange",
        "ECDSA Signatures",
        "SHA-256 Workbench",
        "AES-GCM (AEAD)",
        "Secure Channel (Alice <-> Bob)",
        "Tampering & MitM Attack"
    ]
    
    choice = st.sidebar.radio(
        "WORKBENCH SELECTOR",
        navigation_options,
        label_visibility="visible"
    )
    
    st.sidebar.markdown("---")
    st.sidebar.caption("CryptoLab v1.2 &bull; Python Cryptography &bull; OpenSSL")
    
    if choice == "Modular Arithmetic":
        render_mod_math_view()
    elif choice == "RSA Workbench":
        render_rsa_view()
    elif choice == "Diffie-Hellman":
        render_dh_view()
    elif choice == "ECDH Key Exchange":
        render_ecdh_view()
    elif choice == "ECDSA Signatures":
        render_ecdsa_view()
    elif choice == "SHA-256 Workbench":
        render_hash_view()
    elif choice == "AES-GCM (AEAD)":
        render_aes_view()
    elif choice == "Secure Channel (Alice <-> Bob)":
        render_secure_channel_view()
    elif choice == "Tampering & MitM Attack":
        render_attacker_simulation_view()

if __name__ == "__main__":
    main()
