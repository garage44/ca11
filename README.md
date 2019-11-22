[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Install
    git clone git@github.com:garage11/ca11.git
    cd ca11
    cp .ca11rc.example .ca11rc
    cd docker
    # Generate dev.ca11.app certificate and Garage11 CA for
    # local SSL without browser warnings.
    cd docker/nginx/ssl
    ./ca_cert.sh dev.ca11.app
    ./ca_cert.sh sip.dev.ca11.app
    ./ca_cert.sh sig11.dev.ca11.app
    # Manually import development CA (Archlinux only)
    sudo ./ca_system.sh
    # Enable hostname lookup
    echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
    echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
    echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts
    # Start supporting services: Asterisk, Nginx, MariaDB
    docker-compose up

    yarn
    gulp build develop


# Resources
* [PWA](https://ca11.app/) - Softphone PWA
* [Documentation](https://docs.ca11.app) - Users & Developers
* [News](https://blog.ca11.app) - Project updates


# About
CA11 introduces free, open and privacy-friendly Web Telephony. CA11 is backwards
compatible with SIP networks, but comes with its own free decentralized signalling
network for P2P telephony: SIG11. P2P telephony with WebRTC and SIG11 has some
major advantages over using centralized telephony:

* Privacy: all WebRTC calls are P2P and securely encrypted (DTLS-SRTP)
* Trust: Public key crypto verifies caller & callee identity
* Quality: High quality audio(OPUS) and video(VP9)
* Costs: Free for users, low costs for SIG11 network operators
* Scalability: Low-cost simple relay signalling services instead of large media pipes
* Customizable: Plugin-based, themable phone
* Integrations: Combines perfectly with other communication software, like web-based CRM software
* Freedom: Open network, no accounts, select your own number on the fly
* Features: Everything a regular phone does + Web + WebRTC Audio/Video/Data
* Ubiquitous: Runs on web; PWA experience everywhere Chrom(ium/e) runs

