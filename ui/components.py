"""
Technical UI components and styling utilities for CryptoLab.
Provides a clean, dense engineering interface with zero decorative noise.
"""

import streamlit as st
from typing import Dict, Any

def apply_technical_styles():
    """Injects minimalist, technical CSS styling for CryptoLab."""
    st.markdown(
        """
        <style>
        /* Typography & spacing */
        .block-container {
            padding-top: 1.5rem;
            padding-bottom: 2rem;
            max-width: 1200px;
        }
        h1, h2, h3, h4 {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        /* Technical status badges */
        .tech-badge-edu {
            display: inline-block;
            font-family: monospace;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 3px;
            background-color: #3b2803;
            color: #fbbf24;
            border: 1px solid #78350f;
            margin-bottom: 0.75rem;
            letter-spacing: 0.05em;
        }
        .tech-badge-prod {
            display: inline-block;
            font-family: monospace;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 3px;
            background-color: #064e3b;
            color: #34d399;
            border: 1px solid #047857;
            margin-bottom: 0.75rem;
            letter-spacing: 0.05em;
        }
        .tech-card {
            background-color: #0e1117;
            border: 1px solid #262730;
            border-radius: 4px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        /* Wire table styling */
        .wire-header {
            font-family: monospace;
            font-size: 0.85rem;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

def render_header(title: str, subtitle: str):
    """Renders clean, technical header without gradients or decorative emojis."""
    st.markdown(
        f"""
        <div style="border-bottom: 1px solid #262730; padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
            <div style="font-size: 1.6rem; font-weight: 700; color: #f3f4f6; letter-spacing: -0.01em;">{title}</div>
            <div style="font-size: 0.9rem; color: #9ca3af; margin-top: 0.2rem; font-family: -apple-system, BlinkMacSystemFont, monospace;">{subtitle}</div>
        </div>
        """,
        unsafe_allow_html=True
    )

def render_security_badge(is_educational: bool = True, custom_text: str = ""):
    """Renders restrained technical status tag."""
    if is_educational:
        st.markdown(
            '<div class="tech-badge-edu">[EDUCATIONAL DEMONSTRATION &bull; INSECURE PARAMETERS &bull; NOT FOR PRODUCTION]</div>',
            unsafe_allow_html=True
        )
    else:
        text = custom_text if custom_text else "CRYPTOGRAPHY LIBRARY BACKEND"
        st.markdown(
            f'<div class="tech-badge-prod">[PRODUCTION IMPLEMENTATION &bull; {text.upper()}]</div>',
            unsafe_allow_html=True
        )

def render_attacker_view(public_data: Dict[str, Any], secret_data: Dict[str, Any]):
    """Renders clean side-by-side technical table comparing Wire Intercept vs Endpoint Secrets."""
    col1, col2 = st.columns(2)
    with col1:
        st.markdown('<div class="wire-header">Network Wire Capture (Public / Adversary Visible)</div>', unsafe_allow_html=True)
        for k, v in public_data.items():
            st.code(f"{k}: {v}", language="text")
            
    with col2:
        st.markdown('<div class="wire-header">Endpoint Local State (Private / Secret Memory)</div>', unsafe_allow_html=True)
        for k, v in secret_data.items():
            st.code(f"{k}: {v}", language="text")
