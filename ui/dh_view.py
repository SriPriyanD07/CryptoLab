"""
Diffie-Hellman Key Exchange Workbench.
Interactive visual protocol exchange over insecure network with Attacker View.
"""

import streamlit as st
import binascii
from crypto.dh_lab import EducationalDH, ProductionDH
from ui.components import render_header, render_security_badge, render_attacker_view

def render_dh_view():
    render_header(
        title="Diffie-Hellman Key Exchange Workbench",
        subtitle="Symmetric Key Establishment over Insecure Channels via Discrete Logarithm Hardness"
    )

    tab_edu, tab_prod = st.tabs([
        "Educational Parameters (Mathematical Exchange)",
        "Production 2048-bit MODP Group (RFC 3526)"
    ])

    with tab_edu:
        render_security_badge(is_educational=True)

        st.markdown("**1. Agreed Public Parameters**")
        cp, cg = st.columns(2)
        with cp:
            p_val = st.number_input("Public Prime Modulus (p)", value=23, min_value=3, step=1, key="dh_p")
        with cg:
            g_val = st.number_input("Public Generator Base (g)", value=5, min_value=2, step=1, key="dh_g")

        st.markdown("---")
        st.markdown("**2. Endpoint Local Secrets & Public Key Computation**")

        col_alice, col_bob = st.columns(2)
        with col_alice:
            st.markdown("**Alice Endpoint**")
            a_secret = st.number_input("Alice Private Exponent (a)", value=6, min_value=1, step=1, key="dh_a")
            pub_A = pow(g_val, a_secret, p_val)
            st.code(f"Private State: a = {a_secret}\nPublic Key:    A = g^a mod p = {g_val}^{a_secret} mod {p_val} = {pub_A}", language="text")

        with col_bob:
            st.markdown("**Bob Endpoint**")
            b_secret = st.number_input("Bob Private Exponent (b)", value=15, min_value=1, step=1, key="dh_b")
            pub_B = pow(g_val, b_secret, p_val)
            st.code(f"Private State: b = {b_secret}\nPublic Key:    B = g^b mod p = {g_val}^{b_secret} mod {p_val} = {pub_B}", language="text")

        st.markdown("---")
        st.markdown("**3. Network Transmission & Independent Secret Derivation**")

        st.markdown(
            f"""
            ```text
            Alice (Local)                      Unencrypted Network                        Bob (Local)
            ─────────────                      ───────────────────                        ───────────
            Private a = {a_secret}                                                               Private b = {b_secret}
            Public  A = {pub_A}  ────────────── Transmit A = {pub_A} ──────────────►  Receives A = {pub_A}
            Receives B = {pub_B}  ◄───────────── Transmit B = {pub_B} ──────────────  Public  B = {pub_B}
            ```
            """
        )

        s_alice = pow(pub_B, a_secret, p_val)
        s_bob = pow(pub_A, b_secret, p_val)

        res_col1, res_col2 = st.columns(2)
        with res_col1:
            st.markdown("**Alice Derives Shared Secret**")
            st.code(f"S_Alice = B^a mod p\n        = {pub_B}^{a_secret} mod {p_val}\n        = {s_alice}", language="text")

        with res_col2:
            st.markdown("**Bob Derives Shared Secret**")
            st.code(f"S_Bob   = A^b mod p\n        = {pub_A}^{b_secret} mod {p_val}\n        = {s_bob}", language="text")

        if s_alice == s_bob:
            st.success(f"Key Agreement Verified: S_Alice == S_Bob == g^(ab) mod p == {s_alice}")

        st.markdown("---")
        render_attacker_view(
            public_data={
                "Prime Modulus p": p_val,
                "Generator Base g": g_val,
                "Transmitted Key A": pub_A,
                "Transmitted Key B": pub_B
            },
            secret_data={
                "Alice Private a": a_secret,
                "Bob Private b": b_secret,
                "Derived Shared Secret": s_alice
            }
        )

    with tab_prod:
        render_security_badge(is_educational=False, custom_text="RFC 3526 2048-BIT FINITE-FIELD DH")

        if st.button("Execute 2048-bit DH Key Exchange", type="primary"):
            with st.spinner("Generating 2048-bit parameters and computing modular exponentiations..."):
                dh_prod = ProductionDH()
                s_alice_b, s_bob_b = dh_prod.exchange()

                hex_alice = binascii.hexlify(s_alice_b).decode('utf-8')
                hex_bob = binascii.hexlify(s_bob_b).decode('utf-8')

                st.markdown("**Shared Secret Byte Representation (256 bytes / 2048 bits)**")
                st.code(f"Alice Secret (Hex):\n{hex_alice}\n\nBob Secret (Hex):\n{hex_bob}", language="text")

                if s_alice_b == s_bob_b:
                    st.success("Shared secret match confirmed: Alice and Bob derived identical 2048-bit keys.")
