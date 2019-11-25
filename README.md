[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# About
CA11 is a privacy-friendly, open solution(FOSS) for WebRTC-based telephony.
It integrates modern PBX software, so it can be used to make calls
with over existing telephony(SIP) networks. Call abstraction allows
other signalling protocols to use the same call flow. CA11 comes with
its own signalling protocol(*SIG11*), which has some interesting
characteristics:

* Assymetric encryption & identity
  * Each phone generates its own ECDH(E) identity
  * Uses [WebCrypto](https://www.w3.org/TR/WebCryptoAPI/) standards
  * Phonenumbers don't have to be unique; public keys are the real identifiers
  * Secure AES key negotation over an untrusted network (Diffie-Hellman)
  * Flexible routing & federation
  * Open signalling network
  * Volatile accounts
  * Select your phonenumber on the fly

* P2P Media - Media flows directly between peers
  * Enhanced privacy; all calls are E2E encrypted
  * Highest quality audio(OPUS) and video(VP9)
  * Low cost - no large media pipes to maintain

CA11 is web-based:
* Ubiquitous; PWA experience everywhere Chrom(ium/e) runs
* Lots of features: Everything a regular phone does + Web + WebRTC Audio/Video/Data
* Combines perfectly with other communication software, like web-based CRM software


# Install
    git clone git@github.com:garage11/ca11.git
    cd ca11
    yarn
    cp .ca11rc.example .ca11rc
    # Build the WebRTC Phone:
    yarn build

    # Setup supporting services...
    cd docker
    # Generate developer certificates and CA to use
    # SSL locally without browser warnings:
    cd docker/nginx/ssl
    ./ca_cert.sh dev.ca11.app
    ./ca_cert.sh sip.dev.ca11.app
    ./ca_cert.sh sig11.dev.ca11.app
    # Manually import development CA (Archlinux only)
    sudo ./ca_system.sh
    # Local hostname lookup for our domains:
    echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
    echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
    echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts
    # Start supporting services:
    docker-compose up

    # Initialize PBX database
    docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head

    gulp build develop


# Resources
* [PWA](https://ca11.app/) - Softphone PWA
* [Documentation](https://docs.ca11.app) - Users & Developers
* [News](https://blog.ca11.app) - Project updates


