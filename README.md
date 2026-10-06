# CryptoLab

### Interactive Cryptography Laboratory & Research Workstation

CryptoLab is an interactive laboratory and research workstation environment engineered for experimenting with and understanding cryptographic primitives, key agreement, authenticated encryption, digital signatures, and protocol-level security behavior.

CryptoLab is designed as a hands-on technical workbench where security engineers, researchers, and students can observe intermediate mathematical states, inspect transmitted wire parameters, simulate in-flight tampering, and analyze cryptographic failure conditions under active adversary models.

---

## Overview

Modern cryptographic protocols rely on the composition of distinct mathematical and algorithmic primitives. While individual algorithms (such as block ciphers, hash functions, and elliptic curve operations) are well-defined, understanding their composition, state transitions, failure invariants, and wire exposure is essential for rigorous security engineering.

CryptoLab provides an interactive workstation interface where users can:
- **Experiment with algorithms**: Directly execute classical and modern cryptographic constructions with user-supplied inputs and parameters.
- **Inspect intermediate cryptographic state**: Examine internal values (e.g. Bézout coefficients, intermediate square-and-multiply states, elliptic curve coordinates, uncompressed public points, and HKDF PRK/OKM steps).
- **Observe protocol flows**: Trace multi-party message exchanges across initiator, recipient, and untrusted network wire boundaries.
- **Inspect transmitted information**: Contrast sensitive local secrets against parameters visible to an eavesdropper on a public channel.
- **Simulate active tampering**: Intentionally mutate ciphertext bits, forge cleartext associated data (AAD), or corrupt initialization vectors in transit.
- **Observe authentication failures**: Inspect why authenticated encryption schemes reject tampered frames prior to releasing unauthenticated plaintext.
- **Understand composition relationships**: Observe how raw key agreement (ECDH) feeds into pseudorandom key derivation (HKDF) to establish authenticated transport sessions (AES-GCM).

---

## Features

CryptoLab contains 9 dedicated laboratory workbenches covering foundational mathematics, asymmetric key agreement, digital signatures, hashing, authenticated encryption, and full transport pipelines:

### Modular Arithmetic
* **Residue Operations**: Basic finite ring arithmetic over $\mathbb{Z}_n$ ($a \pm b \pmod n$, $a \cdot b \pmod n$, $a^b \pmod n$).
* **Euclidean Algorithm**: Greatest Common Divisor ($\gcd(a, b)$) calculation via Euclidean division.
* **Extended Euclidean Algorithm**: Derivation of Bézout coefficients $x, y$ satisfying $a \cdot x + b \cdot y = \gcd(a, b)$.
* **Modular Multiplicative Inverse**: Verification and derivation of $a^{-1} \pmod n$, highlighting the coprimality condition $\gcd(a, n) = 1$.
* **Square-and-Multiply Exponentiation Trace**: Step-by-step binary exponent scan demonstrating intermediate squaring and conditional multiplication operations with pre- and post-state tracking.

### RSA Cryptosystem
* **Educational RSA Mathematics**: Asymmetric trapdoor permutation based on the integer factorization problem and Euler's totient function $\phi(n) = (p-1)(q-1)$.
* **Key Generation Concepts**: Selection of prime factors $(p, q)$, modulus $n = p \cdot q$, public exponent $e$, and private trapdoor exponent $d \equiv e^{-1} \pmod{\phi(n)}$.
* **Numerical & Text Encryption**: Demonstration of raw textbook RSA transformations ($c = m^e \pmod n$, $m = c^d \pmod n$) alongside character-encoded string encryption.
* **Production Deployment Note**: Educational RSA deliberately exposes textbook mathematics for transparency. Production RSA requires standardized padding schemes (such as RSA-OAEP for encryption or RSA-PSS for signatures) and key sizes of 2048 bits or higher to prevent algebraic and chosen-ciphertext attacks.

### Diffie-Hellman Key Agreement (FFDH)
* **Finite-Field Key Negotiation**: Symmetric key negotiation over unencrypted channels via discrete logarithm hardness in a cyclic group (RFC 3526).
* **Public & Private Parameters**: Negotiation of prime modulus $p$ and generator $g$, private exponents $a$ and $b$, and public values $A = g^a \pmod p$ and $B = g^b \pmod p$.
* **Shared Secret Derivation**: Verification of shared secret convergence $S = B^a \pmod p = A^b \pmod p = g^{ab} \pmod p$.
* **Wire Protocol & Attacker Perspective**: Visual separation of local confidential state (private exponents) versus values exposed on the wire ($p, g, A, B$) observable by a passive sniffer.

### Elliptic Curve Diffie-Hellman (ECDH)
* **NIST P-256 (SECP256R1) Curve**: Key agreement over Weierstrass prime field curves.
* **Public Key Exchange**: Ephemeral private scalar generation ($d_A, d_B$) and point scalar multiplication ($Q_A = d_A \cdot G$, $Q_B = d_B \cdot G$) yielding raw 65-byte uncompressed points (`04 || X || Y`).
* **Shared Secret Derivation**: Convergence on identical 256-bit curve points $S = d_A \cdot Q_B = d_B \cdot Q_A$.
* **HKDF-SHA256 Session Keying**: Extraction and expansion of the raw shared $X$-coordinate into a cryptographically strong 256-bit symmetric session key.
* **3D Convergence Visualization**: Spatial representation of dual scalar multiplication converging to a unified point.

### ECDSA Digital Signatures
* **Asymmetric Non-Repudiation**: Digital signature generation and verification using NIST P-256 and SHA-256 (FIPS 186-4).
* **Signing & Verification Pipeline**: Message digest hashing, private scalar signing generating $(r, s)$ signature pairs, and mathematical verification against signer public key.
* **Message Tampering Testbed**: Real-time payload mutation demonstrating immediate signature verification failure upon any single-character alteration.
* **Important Cryptographic Distinction**: **ECDSA provides digital signatures and authentication.** It does **not** encrypt messages or provide confidentiality.

### SHA-256 Cryptographic Hash & Avalanche
* **One-Way Digest Generation**: Deterministic 256-bit output computation via Merkle–Damgård compression (FIPS 180-4).
* **Avalanche Effect Analysis**: Side-by-side comparison of baseline input $A$ versus modified input $B$ (e.g. single-character or single-bit variations).
* **Bit Diffusion Metrics**: Real-time Hamming distance calculation and percentage of inverted output bits ($\approx 50\%$ under the Strict Avalanche Criterion).
* **256-Bit Stream Difference Map**: Cell-by-cell visual alignment map displaying exactly which bits flipped between digests.
* **Important Cryptographic Distinction**: **SHA-256 is a one-way cryptographic hash function.** It is **not** encryption and cannot be decrypted.

### AES-256-GCM Authenticated Encryption
* **Authenticated Encryption with Associated Data (AEAD)**: Simultaneous confidentiality via CTR-mode stream encryption and integrity/authenticity via 128-bit GHASH polynomial evaluation (NIST SP 800-38D).
* **Payload & Metadata Decomposition**: Explicit handling of 256-bit symmetric key, unique 96-bit initialization vector (nonce), ciphertext, and authenticated associated data (AAD).
* **Integrity Verification & Rejection**: Real-time simulation demonstrating that ciphertext bit flips or AAD header alterations result in immediate authentication rejection.
* **Nonce-Reuse Catastrophe Demonstration**: Educational simulation illustrating how reusing a nonce under the same key completely destroys GHASH authenticity and leaks plaintext XOR differences:
  $$C_1 \oplus C_2 = P_1 \oplus P_2$$
* **Important Cryptographic Distinction**: **AES-GCM provides authenticated encryption.** Unauthenticated ciphers (e.g. raw CBC without HMAC) do not protect against malleability or active modification.

### Secure Channel Protocol Pipeline
* **End-to-End Modern Transport Pipeline**: Integration of individual primitives into a unified, TLS-like communication architecture:
  $$\text{Ephemeral ECDH (P-256)} \longrightarrow \text{HKDF-SHA256} \longrightarrow \text{AES-256-GCM} \longrightarrow \text{Authenticated Transport}$$
* **State Machine & Wire Transit**: Multi-stage handshake tracking initiator keypair generation, public key exchange over the wire, recipient key derivation, and AEAD encrypted transmission.
* **Interception & Tampering Experiments**: Allows active in-flight injection of bit flips or header alterations to observe end-to-end transport failure.

### Tampering Studio & Active Adversary Simulation
* **Active Dolev-Yao Adversary Testbed**: Intercept transmitted wire frames in a simulated hostile transport channel.
* **Mutation Vectors**:
  - **Ciphertext Modification**: Invert specific ciphertext bits to observe authentication rejection.
  - **AAD Header Forgery**: Mutate cleartext routing metadata or clearance headers.
  - **Nonce/IV Corruption**: Corrupt initialization vector bits.
* **Plaintext Release Blocking**: Illustrates the fundamental AEAD security contract: when authentication fails, the receiver drops the payload and blocks plaintext release entirely.

---

## Research Workstation Interface

The workstation user interface is organized into a cohesive, graphite-themed security research environment with dedicated visual primitives:

* **3D Cryptographic Architecture (Overview)**: First-class isometric visualization displaying the 6-layer dependency stack ($L_0$ Algebraic Foundations $\to L_5$ Secure Transport) floating directly in the workspace with interactive Z-depth layer selection and pointer parallax.
* **3D Protocol Convergence (ECDH)**: Spatial depth stage showing initiator/recipient scalar multiplication and shared secret point convergence.
* **3D Packet Transport Channel (Secure Channel)**: Horizontal perspective corridor tracking in-transit AEAD frames between transmitter enclave and receiver boundary.
* **3D Active Adversary Rig (Tampering Studio)**: Spatial interception tap displaying real-time wire mutation and receiver GHASH evaluation.
* **Cryptographic Status Rail**: Persistent invariant badges displaying algorithm status, parameter coprimality, and handshake progression.
* **CryptoInspector**: Technical parameter drawer detailing key sizes, curves, hexadecimal representations, and confidentiality status.
* **Attacker View (Wire Sniffer)**: Explicitly delineates observable wire parameters versus confidential local endpoint state.
* **Protocol Trace**: Monospace audit log tracking timestamped cryptographic events with execution status.

---

## Architecture

The project maintains a clean separation between the interactive frontend workstation and reference backend cryptographic engines:

```
CryptoLab/
├── crypto/                         # Python reference cryptographic implementations
│   ├── mod_math.py                 # Extended Euclidean, GCD, modular inverse
│   ├── rsa_lab.py                  # Educational RSA & 2048-bit OAEP
│   ├── dh_lab.py                   # Classical FFDH & RFC 3526 MODP
│   ├── ecdh_lab.py                 # NIST P-256 key agreement & HKDF derivation
│   ├── ecdsa_lab.py                # SECP256R1 signing & verification
│   ├── hash_lab.py                 # SHA-256 hashing & avalanche metrics
│   └── aes_lab.py                  # AES-256-GCM & nonce reuse analysis
├── simulations/                    # Python protocol simulations
│   └── secure_channel.py           # End-to-end secure channel pipeline simulation
├── tests/                          # Automated Pytest test suite (24 unit tests)
│   ├── test_mod_math.py            # Finite field arithmetic tests
│   ├── test_rsa.py                 # RSA mathematical & OAEP tests
│   ├── test_dh.py                  # Diffie-Hellman exchange tests
│   ├── test_ecdh.py                # ECDH shared secret tests
│   ├── test_ecdsa.py               # ECDSA signature verification tests
│   ├── test_hash.py                # SHA-256 determinism & avalanche tests
│   ├── test_aes.py                 # AES-GCM encryption & tampering tests
│   └── test_secure_channel.py      # End-to-end transport & MitM tests
├── frontend/                       # Interactive React + TypeScript workstation
│   ├── src/
│   │   ├── components/             # Reusable workstation UI & visualization primitives
│   │   │   ├── layout/             # Sidebar, TopBar
│   │   │   ├── terminal/           # ProtocolTrace & EventLog audit streams
│   │   │   ├── ui/                 # Card, Badge, CodeBlock
│   │   │   ├── visualization/      # 3D spatial rigs (Architecture, ECDH, Channel, Attack)
│   │   │   └── workstation/        # SecurityStatus, CryptoInspector, AttackerView
│   │   ├── features/               # Dedicated laboratory workbenches
│   │   │   ├── overview/           # 3D architecture & module registry
│   │   │   ├── modularArithmetic/  # Residue operations & Euclidean traces
│   │   │   ├── rsa/                # Asymmetric factorization & trapdoors
│   │   │   ├── diffieHellman/      # Discrete log key exchange
│   │   │   ├── ecdh/               # P-256 point multiplication & convergence
│   │   │   ├── ecdsa/              # Digital signatures & verification
│   │   │   ├── sha256/             # Cryptographic hash & diffusion
│   │   │   ├── aesGcm/             # Authenticated encryption & nonce reuse
│   │   │   ├── secureChannel/      # End-to-end pipeline simulation
│   │   │   └── tampering/          # Active adversary mutation studio
│   │   ├── lib/crypto/             # Client-side cryptographic engines
│   │   │   ├── modMath.ts          # Arbitrary-precision BigInt arithmetic
│   │   │   ├── rsa.ts              # Mathematical RSA model
│   │   │   ├── diffieHellman.ts    # FFDH state machine
│   │   │   └── webCrypto.ts        # Web Crypto API wrapper (SubtleCrypto)
│   │   ├── App.tsx                 # Workstation shell & navigation
│   │   ├── main.tsx                # React DOM entry point
│   │   └── index.css               # Industrial workstation theme & 3D CSS
│   ├── package.json                # Dependencies & npm scripts
│   ├── tsconfig.json               # Strict TypeScript configuration
│   └── vite.config.ts              # Vite bundling configuration
├── app.py                          # Streamlit application entry point
├── requirements.txt                # Python backend dependencies
├── .gitignore                      # Git exclusion rules
└── README.md                       # Workstation documentation
```

### Cryptographic Separation of Concerns

* **Frontend Workstation**: Runs standard, hardware-accelerated **Web Crypto API (`window.crypto.subtle`)** for NIST P-256 ECDH, ECDSA signatures, AES-256-GCM, and SHA-256. Foundational ring arithmetic and educational RSA utilize a custom, zero-dependency **BigInt** engine.
* **Python Engine**: Provides reference implementations utilizing **PyCA `cryptography`** backed by OpenSSL, along with a standalone simulation engine in `simulations/`.
* **Automated Tests**: Pytest suite validates all mathematical operations, RFC specifications, attack rejections, and failure conditions.

---

## Cryptographic Model & Primitive Composition

### Primitive Roles

```
RSA               ───>  Public-Key Cryptography (Trapdoor Permutation)
DH / ECDH         ───>  Key Agreement (Shared Secret Negotiation)
HKDF              ───>  Key Derivation (Pseudorandom Session Keying)
AES-GCM           ───>  Authenticated Encryption with Associated Data (AEAD)
SHA-256           ───>  Cryptographic Hash Function (One-Way Digest)
ECDSA             ───>  Digital Signatures (Non-Repudiation & Authenticity)
```

### Secure Channel Composition Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Initiator (Alice)                        │
└─────────────────────────────────────────────────────────────┘
                               │
               [Ephemeral P-256 Keypair]
                               │
            Raw Public Point Q_A over the wire
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Key Agreement (ECDH)                     │
│                  S = d_A · Q_B = d_B · Q_A                  │
└─────────────────────────────────────────────────────────────┘
                               │
                      Raw Shared Secret S
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Key Derivation (HKDF-SHA256)                │
│             K = HKDF-Expand(HKDF-Extract(S))                │
└─────────────────────────────────────────────────────────────┘
                               │
                  256-bit Symmetric Session Key K
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Authenticated Encryption (AES-GCM)              │
│       Ciphertext, Nonce, 128-bit GHASH Tag, Header AAD      │
└─────────────────────────────────────────────────────────────┘
                               │
                 Transmitted over Network Wire
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Recipient (Bob)                          │
│               GHASH Tag Match Verification                  │
│             Success: Plaintext Delivered                    │
│             Failure: Immediate Abort & Drop                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Experiments

CryptoLab allows researchers and engineers to empirically observe:
* **Wire Visibility**: Exactly which parameters are exposed on an untrusted network wire (e.g. public keys, nonces, cleartext AAD headers, ciphertexts, and authentication tags) versus what remains confidential to endpoints (private keys, raw shared secrets, symmetric session keys, and plaintexts).
* **Ciphertext Bit Flipping**: How modifying even a single bit in an encrypted payload causes GHASH polynomial verification to fail and prevents plaintext delivery.
* **AAD Header Tampering**: How altering unencrypted associated metadata (such as routing IDs or permissions) invalidates the authentication tag despite the ciphertext remaining untouched.
* **Nonce Integrity**: How modifying initialization vectors causes tag verification mismatch.
* **Plaintext Release Prevention**: How recipient implementations that enforce authenticated encryption abort immediately upon tag mismatch, protecting downstream applications from unauthenticated data.

---

## Tech Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.8` | Component-based workstation interface |
| **Language** | TypeScript | `~6.0.2` | Strict type safety and cryptographic parameter modeling |
| **Build Tool** | Vite | `^8.3.0` | Ultra-fast client compilation and development server |
| **Styling** | Tailwind CSS | `^4.3.3` | Industrial graphite theme, layout grids, and CSS 3D transforms |
| **Icons** | Lucide React | `^1.52.0` | Monospace and technical interface iconography |
| **Client Cryptography** | Web Crypto API | Standard | Native browser `SubtleCrypto` (AES-GCM, ECDH, ECDSA, SHA-256) |
| **Mathematical Engine** | Native BigInt | Standard | Arbitrary-precision finite ring and textbook RSA operations |
| **Backend Reference** | Python | `3.10+` / `3.13` | Reference cryptographic implementations and protocol simulations |
| **Cryptographic Library** | PyCA `cryptography` | `>=42.0.0` | Standard OpenSSL-backed cryptographic algorithms |
| **Test Framework** | Pytest | `>=7.4.0` | Automated cryptographic unit and regression tests |

---

## Run Locally

### 1. Frontend Workstation

Ensure **Node.js** (v18+ recommended) is installed.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

### 2. Python Reference Environment

Ensure **Python** (v3.10+) is installed.

```bash
# From the repository root, create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the automated test suite
pytest tests/ -v
```

---

## Build & Verification

### Production Frontend Build

To execute type-checking and create an optimized production bundle:

```bash
cd frontend
npm run build
```

Build status: **PASS (0 Errors, TypeScript `tsc -b` + Vite)**.

### Cryptographic Test Suite Verification

Run the automated Pytest suite from the repository root:

```bash
pytest tests/ -v
```

Verified test status: **24 / 24 tests passing (100%)**:

```
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

======================== 24 passed, 1 warning in 0.71s ========================
```

---

## Important Security Note

**CryptoLab is an educational and research-oriented laboratory.**

Certain modules intentionally utilize small or simplified parameters (such as small prime moduli in Diffie-Hellman and RSA, or unpadded textbook RSA exponentiation) so that internal mathematical behaviors, Bézout coefficients, and intermediate residues can be calculated and inspected interactively in real time.

**These simplified demonstrations must NOT be used in production environments.**

For production software:
* Always use established, peer-reviewed cryptographic libraries (such as OpenSSL, BoringSSL, PyCA `cryptography`, or the Web Crypto API).
* Use standardized protocols (such as TLS 1.3, SSHv2, or WireGuard) rather than custom protocol pipelines.
* Use standardized parameter sizes (RSA $\ge 2048$ bits, NIST P-256 or Curve25519 for elliptic curves, AES-256 for symmetric encryption).
* Always apply secure padding modes (e.g. RSA-OAEP for encryption, RSA-PSS for signatures).
* Never reuse a nonce with the same key in authenticated encryption modes like AES-GCM.
* Adhere to current cryptographic standards and guidance from NIST, BSI, and the IETF.

---

## Project Status

CryptoLab is an active experimental and research project. All 9 laboratory workbenches (Modular Arithmetic, RSA, Diffie-Hellman, ECDH, ECDSA, SHA-256, AES-256-GCM, Secure Channel, and Tampering Studio) are implemented, operational, and covered by automated test verification. The project is intended for research, education, and protocol experimentation and does not claim production deployment readiness.

---

## Development Principles

* **Separation of Concerns**: Cryptographic algorithm implementations remain clean and decoupled from presentation and UI rendering code.
* **Empirical Integrity**: Workstation visualizations and inspectors reflect actual cryptographic calculations and intermediate mathematical states, avoiding simulated or fictitious values.
* **Automated Verification**: Test suites verify mathematical correctness, RFC compliance, and expected security failure behaviors on every release.
* **Technically Defensible Claims**: Security documentation and workstation commentary maintain precise, technically accurate terminology without exaggerated security claims.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author

Developed by **[Sri Priyan D](https://github.com/SriPriyanD07)**.
* GitHub Repository: [https://github.com/SriPriyanD07/CryptoLab](https://github.com/SriPriyanD07/CryptoLab)
