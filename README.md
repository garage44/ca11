[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# About CA11

* Open and Free [WebRTC Telephony Service](https://ca11.app/)
* Open-source stack for WebRTC-based telephony

  * General-purpose JavaScript softphone
    * Flexible reactive Vue VDOM & state
    * Modern ESM stack (Snowpack)
    * PBKDF2-encrypted sessions
    * Optimized (S)CSS (flexbox/CSS-variables)
    * Protocol-agnostic (call abstraction)

  * Serverside WebRTC telephony
    * Pre-configured Asterisk PBX
    * SIP-over-Websockets (SIP.js)
    * Call features
      * Call transfer
      * On-hold
      * DTMF
      * (Video) conference

  * P2P WebRTC telephony
    * SIG11 signalling/routing protocol
      * Standards-based cryptography ([WebCrypto](https://www.w3.org/TR/WebCryptoAPI/))
      * Phonenumbers based on Public-keys
      * Secure AES key exchange (ECDHE)
      * E2E encrypted signalling
    * E2E-encrypted WebRTC media (DTLS-SRTP)
    * High quality audio and video(OPUS/VP9)

# Install

## Requirements

* Chrom(e/ium) browser
* Node.js 13 or higher
* Docker

> Use the content of the *docker* directory in case you want to install manually.

## Procedure

* Clone the project and install dependencies:

      git clone git@github.com:garage11/ca11.git
      cd ca11
      yarn
      cp .ca11rc.example .ca11rc
      yarn bootstrap
      ./cli.js watch

* Generate a developer certificate & CA to use SSL without warnings on a local domain:

      cd ca11/docker/nginx/ssl
      ./ca_cert.sh dev.ca11.app
      ./ca_cert.sh sip.dev.ca11.app
      ./ca_cert.sh sig11.dev.ca11.app

* (!) Manually import the development CA

      sudo ./ca_system.sh

  > This shell-script for importing the CA into the system only works on Archlinux at the moment.

* Add local hostname lookup for the default domains:

      sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts

* Setup Asterisk database

      cd ca11/docker
      docker-compose up
      docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head
      psql -U asterisk -h 127.0.0.1 asterisk < postgres/sig11_asterisk.sql  # default pw is 'ca11ftw'

* Start the SIG11 tower service

      node packages/tower/src/index.js

* Restart the browser for the SSL certificate to be picked up
* Open https://dev.ca11.app and start your phone

* Call one of the SIP testnumbers in contacts to verify that the stack works as expected.
