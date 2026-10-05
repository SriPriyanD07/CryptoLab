"""
Modular Arithmetic Laboratory Workbench.
Provides interactive calculation tools for modular operations, Euclidean GCD,
Bézout coefficients, modular inversion, and binary exponentiation.
"""

import streamlit as st
import pandas as pd
from crypto.mod_math import (
    mod_add, mod_sub, mod_mul, euclidean_gcd, extended_gcd, mod_inverse, mod_pow_steps
)
from ui.components import render_header

def render_mod_math_view():
    render_header(
        title="Modular Arithmetic Workbench",
        subtitle="Finite Field Arithmetic, Bézout Identity, Inverses, and Modular Exponentiation"
    )

    tab1, tab2, tab3, tab4 = st.tabs([
        "Operations (mod n)",
        "Euclidean GCD & Bézout Identity",
        "Modular Multiplicative Inverse",
        "Square-and-Multiply Exponentiation"
    ])

    with tab1:
        c1, c2, c3 = st.columns(3)
        with c1:
            a = st.number_input("Input a", value=17, step=1, key="mod_a")
        with c2:
            b = st.number_input("Input b", value=28, step=1, key="mod_b")
        with c3:
            n = st.number_input("Modulus n", value=12, min_value=2, step=1, key="mod_n")

        st.markdown("**Computed Operations**")
        
        # Compute operations
        res_a_mod = a % n
        res_b_mod = b % n
        res_add = (a + b) % n
        res_sub = (a - b) % n
        res_mul = (a * b) % n
        res_pow = pow(a, b, n) if b >= 0 else None

        df_ops = pd.DataFrame([
            {"Operation": "a mod n", "Formula": f"{a} mod {n}", "Calculation": f"{a} % {n}", "Result": res_a_mod},
            {"Operation": "b mod n", "Formula": f"{b} mod {n}", "Calculation": f"{b} % {n}", "Result": res_b_mod},
            {"Operation": "(a + b) mod n", "Formula": f"({a} + {b}) mod {n}", "Calculation": f"{a + b} % {n}", "Result": res_add},
            {"Operation": "(a - b) mod n", "Formula": f"({a} - {b}) mod {n}", "Calculation": f"{a - b} % {n}", "Result": res_sub},
            {"Operation": "(a * b) mod n", "Formula": f"({a} * {b}) mod {n}", "Calculation": f"{a * b} % {n}", "Result": res_mul},
            {"Operation": "a^b mod n", "Formula": f"{a}^{b} mod {n}", "Calculation": f"pow({a}, {b}, {n})", "Result": res_pow if res_pow is not None else "Undefined for b < 0"}
        ])
        st.dataframe(df_ops, use_container_width=True, hide_index=True)

    with tab2:
        col_x, col_y = st.columns(2)
        with col_x:
            val_a = st.number_input("Integer a", value=252, step=1, key="gcd_a")
        with col_y:
            val_b = st.number_input("Integer b", value=105, step=1, key="gcd_b")

        gcd_val, gcd_steps = euclidean_gcd(val_a, val_b)
        ext_g, ext_x, ext_y, ext_steps = extended_gcd(val_a, val_b)

        m1, m2 = st.columns(2)
        with m1:
            st.metric("gcd(a, b)", f"{gcd_val}")
        with m2:
            st.metric("Coprime Status", "COPRIME (gcd = 1)" if gcd_val == 1 else f"NOT COPRIME (gcd = {gcd_val})")

        st.markdown("**Bézout Identity**: `a·x + b·y = gcd(a, b)`")
        st.code(f"{val_a} * ({ext_x}) + {val_b} * ({ext_y}) = {ext_g}", language="text")

        with st.expander("Euclidean Division Execution Trace"):
            st.dataframe(pd.DataFrame(gcd_steps), use_container_width=True, hide_index=True)

    with tab3:
        c_inv_a, c_inv_m = st.columns(2)
        with c_inv_a:
            inv_a = st.number_input("Integer a", value=7, step=1, key="inv_a")
        with c_inv_m:
            inv_m = st.number_input("Modulus m", value=20, min_value=2, step=1, key="inv_m")

        inv_res = mod_inverse(inv_a, inv_m)

        if inv_res["exists"]:
            st.success(f"Inverse exists: a⁻¹ mod m = {inv_res['inverse']}")
            st.code(f"Verification: ({inv_a} * {inv_res['inverse']}) mod {inv_m} = {(inv_a * inv_res['inverse']) % inv_m}", language="text")
        else:
            st.error(f"Inverse does not exist: gcd({inv_a}, {inv_m}) = {inv_res['gcd']} != 1")

    with tab4:
        ce1, ce2, ce3 = st.columns(3)
        with ce1:
            pow_b = st.number_input("Base (b)", value=5, step=1, key="pow_b")
        with ce2:
            pow_e = st.number_input("Exponent (e)", value=11, min_value=0, step=1, key="pow_e")
        with ce3:
            pow_m = st.number_input("Modulus (m)", value=14, min_value=2, step=1, key="pow_m")

        pow_res = mod_pow_steps(pow_b, pow_e, pow_m)
        st.metric("Result: b^e mod m", f"{pow_res['result']}")
        st.caption(f"Exponent {pow_e} in binary: {pow_res['binary_exp']} ({len(pow_res['binary_exp'])} bits)")

        with st.expander("Square-and-Multiply Bit-by-Bit State Trace"):
            st.dataframe(pd.DataFrame(pow_res["steps"]), use_container_width=True, hide_index=True)
