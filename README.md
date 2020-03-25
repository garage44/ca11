[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# About CA11

CA11 is free, open-source WebRTC communication software. The Vue-powered
webphone implements two separate VoIP signalling techniques for calling: SIP & SIG11.
The [dockerized](https://github.com/garage11/ca11/blob/master/docker/docker-compose.yml)
VoIP stack includes NGINX, Asterisk, coturn and PostgreSQL.

Calling through SIP is centralized, but comes with a rich ecosystem of functionality
and interconnectivity. SIG11 is a decentralized, E2E-encrypted techniqu to signalling
that aims to make accountless calling effortless. An instance of CA11 is
running [here](https://ca11.app/) as a public service.

Some project characteristics:

* Self-contained SPA
* Optimized Vue.js stack (no SFC)
* ES-module based (Node 13+)
* SIG11 identities - ECDHE/AES-GCM (WebCrypto)
* Encrypted local storage/state (PBKDF2/WebCrypto)
* SCSS + Flexbox layout

# Install

## Requirements

* Chrom(e/ium) browser
* Node.js 13+ (Native ESM)
* Docker (or install manually using Docker as reference)

## Procedure

* Clone the project & install dependencies:

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

* Start the signalling service

      node packages/sig11/service.js

* Restart the browser for the SSL certificate to be picked up
* Open [the webapp](https://dev.ca11.app) to start your webphone

Call one of the SIP testnumbers in contacts to verify that your SIP stack
works as expected.
