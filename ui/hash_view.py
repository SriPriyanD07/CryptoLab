"""
SHA-256 Laboratory Workbench.
Provides interactive hash computation and Avalanche Effect bit-difference analysis.
"""

import streamlit as st
import pandas as pd
from crypto.hash_lab import compute_sha256, analyze_avalanche_effect
from ui.components import render_header, render_security_badge

def render_hash_view():
    render_header(
        title="SHA-256 Workbench",
        subtitle="Cryptographic Hashing, Digest Generation, and Avalanche Effect Analysis"
    )

    render_security_badge(is_educational=False, custom_text="FIPS 180-4 SHA-256 STANDARD")

    st.caption("SHA-256 produces a fixed 256-bit digest. Small input changes produce substantially different outputs.")

    st.markdown("**Avalanche Effect Comparison Experiment**")

    col_a, col_b = st.columns(2)
    with col_a:
        in_a = st.text_input("Input Payload A", value="hello", key="hash_in_a")
    with col_b:
        in_b = st.text_input("Input Payload B", value="hellp", key="hash_in_b")

    analysis = analyze_avalanche_effect(in_a, in_b)

    c_h1, c_h2 = st.columns(2)
    with c_h1:
        st.markdown("**Digest A (Hex - 256 bits / 64 chars)**")
        st.code(analysis["hash1_hex"], language="text")
    with c_h2:
        st.markdown("**Digest B (Hex - 256 bits / 64 chars)**")
        st.code(analysis["hash2_hex"], language="text")

    st.markdown("**Bit Difference Analysis (Hamming Distance)**")
    m1, m2, m3 = st.columns(3)
    m1.metric("Differing Bits", f"{analysis['differing_bits']} / 256")
    m2.metric("Bit Flip Ratio", f"{analysis['percentage_flipped']}%")
    m3.metric("Expected Random Flipping", "~50.0%")

    st.progress(analysis['percentage_flipped'] / 100.0)

    with st.expander("Inspecting 256-Bit Binary Streams & Bit Mismatches"):
        bin1 = analysis["hash1_bin"]
        bin2 = analysis["hash2_bin"]
        diff_str = "".join(["^" if b1 != b2 else " " for b1, b2 in zip(bin1, bin2)])

        st.code(
            f"Binary A:  {bin1}\n"
            f"Binary B:  {bin2}\n"
            f"Mismatch:  {diff_str}",
            language="text"
        )

    st.markdown("---")
    st.markdown("**Single Payload Digest Inspector**")
    single_in = st.text_input("Custom Text Input", value="CryptoLab Engineering", key="hash_single_in")
    res_single = compute_sha256(single_in.encode('utf-8'))

    st.code(
        f"Length:     {res_single['bytes_len']} bytes ({res_single['bit_len']} bits)\n"
        f"Hex:        {res_single['hex']}\n"
        f"Binary:     {res_single['binary']}",
        language="text"
    )
