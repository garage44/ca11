[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

![ca11-12-06-19](https://user-images.githubusercontent.com/48799939/70350280-b4f66980-1866-11ea-9b43-600a5b9150c7.png)

* [CA11](https://ca11.app/) - Reference CA11 PWA / Tower
* [News](https://blog.ca11.app) - Project updates
* [Docs](https://docs.ca11.app) - User & developer docs


# About CA11
CA11 is open-source software for WebRTC-based calling, messaging and file exchange.
The main purpose of CA11 is to provide an accessible and transparent communication
infrastructure, without the need for centralized platforms. CA11 tries to unite with
other efforts that bring transparency and privacy to mobile communication. This means
that it doesn't try to fit into the existing mobile ecosystem, but instead aspires to
create synergy with other open mobile projects like [Plasma mobile](https://www.plasma-mobile.org/),
the [Librem 5](https://puri.sm/products/librem-5/) and the [Pinephone](https://www.pine64.org/pinephone/).

The project pragmatically piggybacks on existing Web technologies(WebRTC, WebCrypto)
where feasible, and focusses instead on user experience and decentralization of the
signalling infrastructure. The reference implementation of the User Interface and
signalling service are webbased and in JavaScript, which keeps it lightweight to
devleop. The PWA uses a protocol-agnostic call abstraction that can deal with multiple
signalling mechanisms. SIP is supported through SIP.js and a WebRTC-compatible SIP backend(Asterisk).

CA11 also comes with its own signalling service(*SIG11*), which uses assymetric encryption
to establish P2P DTLS-SRTP connections over an untrusted overlay network. While still being
extremely experimental, this approach has some promising characteristics:

 * Uses standardized cryptography ([WebCrypto](https://www.w3.org/TR/WebCryptoAPI/))
   * ECDHE - Secure AES key exchange
   * E2E encrypted signalling & message authenticity
 * Flexible client-side message routing
 * Phonenumber lookup through public keys
 * P2P WebRTC
   * Media flows directly between peers
   * High quality audio and video(OPUS/VP9)
   * Standardized, industry-grade E2E encryption

CA11 comes with a Docker setup that launches the following supporting services:
* NGINX to proxy HTTP and Websocket traffic
* [Asterisk](https://www.asterisk.org/) to make calls over SIP networks
* [Coturn](https://github.com/coturn/coturn) TURN/STUN service to negotiate P2P connections
* [PostgreSQL](https://www.postgresql.org/) Database to persist Tower/SIP interaction


# Installation
Node.js version 13 or higher is required. This manual uses Docker to setup a development
environment. Use the content of the *docker* directory as a starting point for a manual
installation.

* Clone the project and install dependencies

      npm i -g gulp yarn
      git clone git@github.com:garage11/ca11.git
      cd ca11
      yarn
      cp .ca11rc.example .ca11rc
      yarn bootstrap
      yarn build

* Generate developer certificates and a Certificate Authority to use SSL on a local domain:

      cd ca11/docker/nginx/ssl
      ./ca_cert.sh dev.ca11.app
      ./ca_cert.sh sip.dev.ca11.app
      ./ca_cert.sh sig11.dev.ca11.app

* Manually import the development CA

      sudo ./ca_system.sh

  *This shellscript only works on Archlinux at the moment. PRs welcome!*

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

Make sure you restart your browser, in order for the SSL certificate to refresh.
Open https://dev.ca11.app and start your phone. Call one of the SIP testnumbers
in contacts to see if the stack works as expected.


## Troubleshooting
*  **No audio device found.**

   Sorry, CA11 requires a webcam currently.

* **SIG11 calls don't work**

   At the moment, the SIG11 protocol is not ready for usage yet.