# CryptoLab — Interactive Cryptography Laboratory

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-SubtleCrypto-4f46e5?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Pytest](https://img.shields.io/badge/Tests-24%2F24%20Passed-brightgreen?style=flat-square&logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> **CryptoLab** is an interactive, technical laboratory workbench engineered for security professionals, cryptography engineers, and researchers. Experiment directly with cryptographic primitives, inspect internal mathematical states and unencrypted wire frames, and observe cryptographic invariants and failure modes under active adversary attack.

---

## 🔬 Core Product Philosophy

CryptoLab is **not** an online textbook, a generic admin dashboard, or a chatbot. It is a **hands-on security engineering workbench** founded on an interactive empirical feedback loop:

$$\text{Input} \longrightarrow \text{Cryptographic Operation} \longrightarrow \text{Internal State Inspection} \longrightarrow \text{Wire Frame Observation} \longrightarrow \text{Adversary Tampering / Verification}$$

Every module allows users to **execute**, **inspect**, **mutate**, and **break** cryptographic constructions in real time.

---

## 🏗️ Architecture & Dual-Engine Design

CryptoLab is built on a high-precision dual-engine architecture:

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CryptoLab Architecture                │
                                  └────────────────────────────────────────────────────────┘
                                                              │
                    ┌─────────────────────────────────────────┴─────────────────────────────────────────┐
                    ▼                                                                                   ▼
   ┌─────────────────────────────────┐                                                 ┌─────────────────────────────────┐
   │     Frontend Research Suite     │                                                 │    Backend Reference Engine     │
   │  (React 19 + TypeScript + Vite) │                                                 │     (Python 3.13 + PyCA)        │
   ├─────────────────────────────────┤                                                 ├─────────────────────────────────┤
   │ • Web Crypto API (SubtleCrypto) │                                                 │ • OpenSSL FIPS-compliant backend │
   │ • Custom BigInt Modular Engine  │                                                 │ • PyCA `cryptography` library   │
   │ • Real-time bit-level mutators  │                                                 │ • 24 Automated Pytest Suite     │
   │ • Wire protocol event stream    │                                                 │ • Full edge-case verification   │
   └─────────────────────────────────┘                                                 └─────────────────────────────────┘
```

1. **Client-Side High-Throughput Laboratory**:
   - **Hardware-Accelerated Web Crypto API**: Native `SubtleCrypto` execution for AES-256-GCM, ECDH (NIST P-256), ECDSA (SECP256R1 / SHA-256), and SHA-256.
   - **Arbitrary-Precision BigInt Engine**: Custom, dependency-free implementations of Euclidean division, Bézout coefficients, modular multiplicative inverse, and Square-and-Multiply binary exponentiation.
   - **Wire Protocol Visualizer**: Dedicated terminal event logs capturing frames transmitted between endpoints.

2. **Backend Reference Implementation**:
   - Python reference implementation in `crypto/` and `simulations/` leveraging standard **PyCA `cryptography`**.
   - Comprehensive test suite in `tests/` verifying mathematical parity, RFC specifications, and attack rejections.

---

## 🧪 Interactive Laboratory Workbenches

CryptoLab is organized into 10 dedicated workbenches:

### 00. Architecture Overview & Primitive Registry
- Real-time diagnostic telemetry: Web Crypto API availability, user agent security flags, and crypto hardware capabilities.
- Structural registry classifying primitives into **Foundations**, **Symmetric Cryptography**, **Asymmetric Cryptography**, **Signatures**, and **Protocols**.

### 01. Modular Arithmetic & Finite Fields ($\mathbb{Z}_n$)
- **Core Operations**: Addition, subtraction, multiplication, and modular exponentiation over arbitrary integers ($a \pm b \pmod n$, $a \cdot b \pmod n$, $a^b \pmod n$).
- **Euclidean Division Trace**: Step-by-step trace showing quotients, remainders, and Bézout identity verification:
  $$a \cdot x + b \cdot y = \gcd(a, b)$$
- **Modular Inverses**: Compute $a^{-1} \pmod n$ using the Extended Euclidean Algorithm, highlighting coprime requirements ($\gcd(a, n) = 1$).
- **Square-and-Multiply Trace**: Real-time bit-by-bit execution trace showing binary exponent scanning, intermediate square operations, and conditional multiply steps.

### 02. Diffie-Hellman Key Exchange (FFDH)
- **Parameter Negotiation**: Select prime modulus $p$ and generator $g$ with group validation.
- **Key Derivation**: Endpoint private exponent generation ($a, b$) and public key computation ($A = g^a \pmod p$, $B = g^b \pmod p$).
- **Shared Secret Equality**: Independent derivation verifying:
  $$S = B^a \pmod p = A^b \pmod p = g^{ab} \pmod p$$
- **Private State vs Wire Separation**: Explicitly juxtaposes what Alice and Bob know privately vs what an eavesdropper intercepts off the public wire ($p, g, A, B$).

### 03. RSA Cryptosystem
- **Parameter Generation**: Select prime pairs $(p, q)$ to compute modulus $n = p \cdot q$ and Euler's totient $\phi(n) = (p-1)(q-1)$.
- **Trapdoor Permutation**: Select public exponent $e$ ($\gcd(e, \phi(n)) = 1$) and derive private exponent $d \equiv e^{-1} \pmod{\phi(n)}$.
- **Text & Numerical Cipher**: Perform modular exponentiation encryption $c = m^e \pmod n$ and decryption $m = c^d \pmod n$.
- **Production Standard**: Export 2048-bit RSA-OAEP keys in standard PEM format.

### 04. Elliptic Curve Diffie-Hellman (ECDH)
- **Curve Selection**: Implements **NIST P-256 (SECP256R1)**.
- **Point Multiplication**: Private scalar generation $d$ and point multiplication $Q = d \cdot G$ yielding raw 65-byte uncompressed public points ($0x04 \parallel X \parallel Y$).
- **Raw Secret to Session Key**: Extracts the 256-bit raw $X$-coordinate shared secret point and feeds it through **HKDF-SHA256** to derive a symmetric key.
- **Comparative Analysis**: Live benchmarking comparing Classical FFDH (2048-bit) against ECDH P-256 (256-bit) in key size, bandwidth, and computational overhead.

### 05. ECDSA Digital Signatures
- **Asymmetric Integrity**: Sign arbitrary message payloads using private EC keys over SECP256R1 with SHA-256.
- **ASN.1 DER Export**: Real-time generation and hex inspection of standard ASN.1 DER $(r, s)$ signature envelopes.
- **Live Signature Verification**: Cryptographic validation with public key verification.
- **Tampering Testbed**: Modify payload characters in real time to observe instant mathematical signature rejection.

### 06. SHA-256 & Avalanche Effect
- **Cryptographic Diffusion**: Side-by-side comparison of Input A vs Input B.
- **Hamming Distance Calculator**: Exact bitwise comparison of the 256-bit hash outputs.
- **Binary Difference Grid**: 256-cell visual alignment map highlighting exactly which bits flipped, proving that a 1-bit input variation flips $\approx 50\%$ of the output bits.

### 07. AES-256-GCM (Authenticated Encryption)
- **AEAD Construction**: Galois/Counter Mode providing both confidentiality (CTR mode) and authenticity/integrity (GHASH).
- **Three-Part Decomposition**: Explicit separation of:
  - **256-bit Secret Key** ($K$)
  - **96-bit Public Nonce** ($IV$) — *never reuse with the same key!*
  - **128-bit Authentication Tag** ($T$)
- **Associated Data (AAD)**: Encrypt payloads with cleartext headers authenticated under the tag.
- **Nonce Reuse Catastrophe**: Interactive simulation showing how reusing a nonce across two plaintexts leaks the XOR difference:
  $$C_1 \oplus C_2 = P_1 \oplus P_2$$

### 08. Secure Channel Protocol (Flagship Demo)
- **End-to-End Modern Pipeline**: Complete TLS-like session integration:
  $$\text{Ephemeral ECDH (P-256)} \longrightarrow \text{HKDF-SHA256} \longrightarrow \text{AES-256-GCM}$$
- **Protocol Simulation**: Full interactive message exchange between **Alice**, the **Physical Network Wire**, and **Bob**.
- **Wire Interception**: Toggle eavesdropping and packet inspection to view raw transit frames:
  ```json
  {
    "ephemeral_public_key": "04a1f8...",
    "nonce": "3f9c...",
    "aad": "Protocol: CryptoLab-v1.0 | Sender: Alice",
    "ciphertext": "8e41...",
    "tag": "d92a..."
  }
  ```
- **In-Transit Attack Toggle**: Simulate active man-in-the-middle bit flipping before delivery to Bob, observing Bob's immediate cryptographic rejection.

### 09. Active Tampering & Man-in-the-Middle Attack Studio
- **Dedicated Adversary Workbench**: Intercept packets in-flight and execute three attack vectors:
  1. **Ciphertext Bit-Flipping**: Flip bits at user-defined byte offsets.
  2. **Cleartext AAD Header Forging**: Mutate unencrypted metadata headers (e.g. routing commands or clearance levels).
  3. **Tag Corruption**: Invalidate the 128-bit GHASH authentication tag.
- **Mathematical Defense Verification**: Demonstrates why recipients reject tampered frames **prior** to exposing unauthenticated plaintext, eliminating padding oracle and malleable ciphertext vulnerabilities.

---

## 📂 Project Structure

```
CryptoLab/
├── frontend/                               # React + TypeScript Web Laboratory
│   ├── src/
│   │   ├── components/                     # Reusable laboratory UI primitives
│   │   │   ├── layout/                     # Sidebar, TopBar
│   │   │   ├── terminal/                   # EventLog monospace protocol stream
│   │   │   └── ui/                         # Card, Badge, CodeBlock
│   │   ├── features/                       # Interactive Cryptography Workbenches
│   │   │   ├── overview/                   # 00. Architecture Overview
│   │   │   ├── modularArithmetic/          # 01. Modular Arithmetic & Euclidean Traces
│   │   │   ├── diffieHellman/              # 02. Classical Diffie-Hellman Exchange
│   │   │   ├── rsa/                        # 03. RSA Keygen, ModPow & RSA-OAEP
│   │   │   ├── ecdh/                       # 04. ECDH (P-256) & HKDF Key Derivation
│   │   │   ├── ecdsa/                      # 05. ECDSA Signatures & Verification
│   │   │   ├── sha256/                     # 06. SHA-256 Avalanche Analysis
│   │   │   ├── aesGcm/                     # 07. AES-256-GCM & Nonce Reuse
│   │   │   ├── secureChannel/              # 08. Flagship Secure Channel Protocol
│   │   │   └── tampering/                  # 09. Active Adversary MitM Attack Studio
│   │   ├── lib/crypto/                     # Cryptographic engines
│   │   │   ├── modMath.ts                  # BigInt arithmetic, GCD, ModPow, Inverse
│   │   │   ├── rsa.ts                      # Educational RSA mathematical model
│   │   │   ├── diffieHellman.ts            # Client-side DH state machine
│   │   │   └── webCrypto.ts                # Web Crypto API wrapper (AES-GCM, ECDH, ECDSA)
│   │   ├── App.tsx                         # Core laboratory workbench shell
│   │   ├── main.tsx                        # Application mount
│   │   └── index.css                       # Technical dark theme styling
│   ├── package.json                        # Dependencies and scripts
│   ├── tsconfig.json                       # Strict TypeScript configuration
│   └── vite.config.ts                      # Vite build configuration
├── crypto/                                 # Python reference implementation (PyCA)
│   ├── mod_math.py                         # Extended Euclidean, ModPow, GCD
│   ├── rsa_lab.py                          # RSA educational & 2048-bit OAEP
│   ├── dh_lab.py                           # Classical FFDH & RFC 3526 MODP
│   ├── ecdh_lab.py                         # NIST P-256 & HKDF derivation
│   ├── ecdsa_lab.py                        # SECP256R1 signing & DER export
│   ├── aes_lab.py                          # AES-256-GCM AEAD & nonce catastrophe
│   └── hash_lab.py                         # SHA-256 & bitwise avalanche analysis
├── simulations/                            # Python secure channel simulation
│   └── secure_channel.py                   # Alice <-> Wire <-> Bob simulator
├── tests/                                  # Comprehensive automated test suite
│   ├── test_mod_math.py                    # Modular arithmetic verification
│   ├── test_rsa.py                         # RSA mathematical & OAEP tests
│   ├── test_dh.py                          # Diffie-Hellman exchange tests
│   ├── test_ecdh.py                        # ECDH shared secret tests
│   ├── test_ecdsa.py                       # ECDSA signature verification tests
│   ├── test_hash.py                        # SHA-256 & avalanche tests
│   ├── test_aes.py                         # AES-GCM & nonce reuse tests
│   └── test_secure_channel.py              # End-to-end protocol & attack tests
├── .gitignore                              # Git exclusion rules
├── requirements.txt                        # Python dependencies
└── README.md                               # Project documentation
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0+ (v20+ recommended)
- **Python**: v3.10+ (for backend test suite)

---

### 1. Launch the React Workbench (Frontend)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

To create an optimized, type-checked production build:
```bash
npm run build
npm run preview
```

---

### 2. Run the Backend Test Suite (Python)

```bash
# Return to repository root
cd ..

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run all 24 unit tests
pytest tests/ -v
```

---

## 🧪 Test Suite Verification Matrix

All 24 automated unit tests pass cleanly:

```
============================= test session starts =============================
platform win32 -- Python 3.13.0, pytest-9.1.1 -- plugins: anyio-4.15.1
collected 24 items

tests/test_aes.py::test_aes_gcm_encrypt_decrypt                    PASSED [  4%]
tests/test_aes.py::test_aes_gcm_tampered_ciphertext_fails          PASSED [  8%]
tests/test_aes.py::test_aes_gcm_tampered_aad_fails                 PASSED [ 12%]
tests/test_aes.py::test_nonce_reuse_catastrophe                    PASSED [ 16%]
tests/test_dh.py::test_educational_dh_matching_secret              PASSED [ 20%]
tests/test_dh.py::test_production_dh_exchange                      PASSED [ 25%]
tests/test_ecdh.py::test_ecdh_key_exchange                         PASSED [ 29%]
tests/test_ecdsa.py::test_ecdsa_sign_verify_valid                  PASSED [ 33%]
tests/test_ecdsa.py::test_ecdsa_tampered_message_fails             PASSED [ 37%]
tests/test_ecdsa.py::test_ecdsa_wrong_public_key_fails             PASSED [ 41%]
tests/test_hash.py::test_sha256_deterministic                      PASSED [ 45%]
tests/test_hash.py::test_avalanche_effect                          PASSED [ 50%]
tests/test_mod_math.py::test_basic_mod_ops                         PASSED [ 54%]
tests/test_mod_math.py::test_euclidean_gcd                         PASSED [ 58%]
tests/test_mod_math.py::test_extended_gcd                          PASSED [ 62%]
tests/test_mod_math.py::test_mod_inverse                           PASSED [ 66%]
tests/test_mod_math.py::test_mod_pow_steps                         PASSED [ 70%]
tests/test_rsa.py::test_educational_rsa_math                       PASSED [ 75%]
tests/test_rsa.py::test_educational_rsa_encrypt_decrypt_number     PASSED [ 79%]
tests/test_rsa.py::test_educational_rsa_encrypt_decrypt_text       PASSED [ 83%]
tests/test_rsa.py::test_production_rsa                             PASSED [ 87%]
tests/test_secure_channel.py::test_secure_channel_end_to_end       PASSED [ 91%]
tests/test_secure_channel.py::test_tampered_ciphertext_rejection   PASSED [ 95%]
tests/test_secure_channel.py::test_tampered_aad_rejection          PASSED [100%]

======================= 24 passed, 1 warning in 22.10s ========================
```

---

## 🔒 Security Principles Demonstrated

1. **Authenticated Encryption (AEAD)**: Traditional unauthenticated ciphers (e.g. CBC without HMAC) are vulnerable to padding oracle attacks and bit-flipping malleability. AES-GCM guarantees that any modification to ciphertext or associated data causes total decryption failure.
2. **Nonce Uniqueness**: Nonce reuse under AES-GCM completely compromises the GHASH authentication key and reveals plaintext differences ($C_1 \oplus C_2 = P_1 \oplus P_2$).
3. **Forward Secrecy**: The secure channel protocol uses **ephemeral** ECDH keys per session. Compromise of long-term identity keys does not compromise past session traffic.
4. **Separation of Concerns**: ECDH handles key agreement; ECDSA handles identity and authenticity; AES-256-GCM handles bulk payload encryption.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

Developed by **[Sri Priyan D](https://github.com/SriPriyanD07)**.
* Repository: [https://github.com/SriPriyanD07/CryptoLab](https://github.com/SriPriyanD07/CryptoLab)
