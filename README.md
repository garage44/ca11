[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# About
CA11 is a privacy-friendly, open(FOSS) WebRTC softphone and telephony network.
The CA11 softphone can connect with WebRTC-compatible PBX software like Asterisk,
to enable calls over SIP networks. User-interface abstraction for the calling flow
makes it easy to integrate other signalling protocols. Besides supporting SIP,
CA11 also comes with its own signalling protocol. The *SIG11* signalling solution
comes with some interesting characteristics:

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

    cd src/phone
    gulp build
    cd ../../
    # Run Tower service (WIP)
    node src/tower/index.js

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
    docker-compose up

    # Initialize PBX database and SIG11 pubkey (WIP)
    docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade headupgrade head
    mysql -u root -p -h 127.0.0.1 asterisk < mariadb/sig11_asterisk.sql

    # Generate two accounts (is going to be automated, WIP)
    # mysql -u root -p -D asterisk -h 127.0.0.1;
    insert into ps_aors (id, max_contacts) values (1000, 1);
    insert into ps_aors (id, max_contacts) values (2000, 1);
    insert into ps_auths (id, auth_type, password, username) values (1000, 'userpass', 1000, 1000);
    insert into ps_auths (id, auth_type, password, username) values (2000, 'userpass', 2000, 2000);
    insert into ps_endpoints (id, transport, aors, auth, context, disallow, allow, direct_media, webrtc) values (1000, 'transport-wss', '1000', '1000', 'default', 'all', 'g722', 'no', 'yes');
    insert into ps_endpoints (id, transport, aors, auth, context, disallow, allow, direct_media, webrtc) values (2000, 'transport-wss', '2000', '2000', 'default', 'all', 'g722', 'no', 'yes');
    quit;

Open https://dev.ca11.app and start a phone. SIP credentials (see mysql
statements above) have to be filled manually in the SIP settings tab for now.


# Resources
* [PWA](https://ca11.app/) - Softphone PWA
* [Documentation](https://docs.ca11.app) - Users & Developers
* [News](https://blog.ca11.app) - Project updates


