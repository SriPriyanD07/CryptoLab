"""
RSA Laboratory Workbench.
Provides interactive key generation, numerical/text modular exponentiation,
and production 2048-bit RSA-OAEP encryption/decryption.
"""

import streamlit as st
import base64
from crypto.rsa_lab import EducationalRSA, ProductionRSA
from ui.components import render_header, render_security_badge, render_attacker_view

def render_rsa_view():
    render_header(
        title="RSA Workbench",
        subtitle="Public-Key Cryptosystem via Prime Factorization and Modular Inversion"
    )

    tab_edu, tab_prod = st.tabs([
        "Educational Parameters (Mathematical Demonstration)",
        "Production RSA-OAEP (2048-bit Standard)"
    ])

    with tab_edu:
        render_security_badge(is_educational=True)

        col1, col2, col3 = st.columns(3)
        with col1:
            p = st.number_input("Prime p", value=61, step=2, key="rsa_p")
        with col2:
            q = st.number_input("Prime q", value=53, step=2, key="rsa_q")
        with col3:
            e = st.number_input("Public Exponent e", value=17, step=2, key="rsa_e")

        try:
            rsa_edu = EducationalRSA(p=p, q=q, e=e)
            params = rsa_edu.get_key_params()

            st.markdown("**Key Parameters & Mathematical Relationship**")
            k1, k2, k3, k4 = st.columns(4)
            k1.metric("Modulus n (p × q)", f"{params['n']}")
            k2.metric("Totient φ(n)", f"{params['phi']}")
            k3.metric("Public Key (n, e)", f"({params['n']}, {params['e']})")
            k4.metric("Private Key (n, d)", f"({params['n']}, {params['d']})")

            st.caption(f"Verification: e · d mod φ(n) = ({params['e']} × {params['d']}) mod {params['phi']} = {(params['e'] * params['d']) % params['phi']}")

            st.markdown("---")
            st.markdown("**Numerical Message Experiment**")
            col_m_in, col_act = st.columns([2, 1])
            with col_m_in:
                m_num = st.number_input(f"Message Integer m (must be < n={params['n']})", value=42, min_value=0, max_value=params['n']-1, step=1)
            
            c_num = rsa_edu.encrypt_number(m_num)
            dec_m_num = rsa_edu.decrypt_number(c_num)

            r1, r2, r3 = st.columns(3)
            with r1:
                st.code(f"Plaintext m:\n{m_num}", language="text")
            with r2:
                st.code(f"Ciphertext c = m^e mod n:\n{c_num}", language="text")
            with r3:
                st.code(f"Decrypted m = c^d mod n:\n{dec_m_num}", language="text")

            if dec_m_num == m_num:
                st.success(f"Decryption verified: c^d mod n = {c_num}^{params['d']} mod {params['n']} = {dec_m_num}")

            st.markdown("---")
            st.markdown("**Text Payload Experiment**")
            text_input = st.text_input("Plaintext String", value="CryptoLab 2026", key="rsa_txt")
            cipher_ints = rsa_edu.encrypt_text(text_input)
            decrypted_text = rsa_edu.decrypt_text(cipher_ints)

            t_col1, t_col2 = st.columns(2)
            with t_col1:
                st.markdown("**Encrypted Character Integers**")
                st.code(str(cipher_ints), language="text")
            with t_col2:
                st.markdown("**Decrypted String**")
                st.code(decrypted_text, language="text")

            st.markdown("---")
            render_attacker_view(
                public_data={
                    "Modulus n": params["n"],
                    "Public Exponent e": params["e"],
                    "Intercepted Numerical Ciphertext c": c_num,
                    "Intercepted Text Ciphertext Array": cipher_ints
                },
                secret_data={
                    "Factor p": params["p"],
                    "Factor q": params["q"],
                    "Totient φ(n)": params["phi"],
                    "Private Exponent d": params["d"],
                    "Recovered Integer m": dec_m_num
                }
            )

        except Exception as err:
            st.error(f"Parameter Error: {err}")

    with tab_prod:
        render_security_badge(is_educational=False, custom_text="OPENSSL / CRYPTOGRAPHY 2048-BIT RSA-OAEP")

        if "prod_rsa" not in st.session_state:
            st.session_state.prod_rsa = ProductionRSA(key_size=2048)

        if st.button("Generate New 2048-bit Keypair"):
            st.session_state.prod_rsa = ProductionRSA(key_size=2048)
            st.success("Generated new 2048-bit RSA keypair.")

        rsa_inst = st.session_state.prod_rsa

        with st.expander("Inspecting Exported PEM Keys"):
            st.text_area("Public Key (SubjectPublicKeyInfo PEM)", rsa_inst.get_public_pem(), height=110)
            st.text_area("Private Key (PKCS8 PEM)", rsa_inst.get_private_pem(), height=130)

        payload = st.text_area("Plaintext Input", value="Financial Wire Payload: Transfer USD 100,000 to Account 0x7A9B", height=70)

        if st.button("Encrypt (RSA-OAEP-SHA256)", type="primary"):
            c_bytes = rsa_inst.encrypt(payload.encode('utf-8'))
            st.session_state.prod_rsa_c = c_bytes

        if "prod_rsa_c" in st.session_state:
            c_bytes = st.session_state.prod_rsa_c
            b64_c = base64.b64encode(c_bytes).decode('utf-8')

            st.markdown("**Ciphertext Output (Base64 Encoded - 256 bytes)**")
            st.code(b64_c, language="text")

            dec_bytes = rsa_inst.decrypt(c_bytes)
            st.markdown("**Decrypted Output**")
            st.code(dec_bytes.decode('utf-8'), language="text")
