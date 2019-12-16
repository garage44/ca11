[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

![ca11-12-06-19](https://user-images.githubusercontent.com/48799939/70350280-b4f66980-1866-11ea-9b43-600a5b9150c7.png)


# Resources
* [News](https://blog.ca11.app) - Project updates
* [CA11 PWA](https://ca11.app/) - A running CA11 instance
* [Documentation](https://docs.ca11.app) - Background for users & developers


# About CA11
CA11 is Free and Open-Source Software(FOSS) for WebRTC calling, messaging and file exchange.
Its purpose is to be an ubiquitous, user- and privacy-friendly alternative for telephony,
SMS and proprietary Over The Top(OTT) platforms. The project pragmatically piggybacks
on existing Web technologies(WebRTC, WebCrypto) where feasible, and focusses on
the user experience and decentralization of the signalling infrastructure.

The initial implementation of the PWA User Interface and signalling service is in JavaScript,
which makes it easy to iterate. The PWA uses a protocol-agnostic call abstraction, which makes
 it easy to deal with multiple signalling mechanisms. SIP is supported through SIP.js and a
 WebRTC-compatible SIP backend(Asterisk).

CA11 also has its own signalling service - *SIG11* - which is a straightforward way to establish
P2P DTLS-SRTP connections over an untrusted overlay network, by using assymetric encryption
in the PWA. While still being experimental, this approach has some promising characteristics:

 * [WebCrypto](https://www.w3.org/TR/WebCryptoAPI/) standard
 * ECDHE - Secure AES key exchange
 * E2E encrypted signalling & message authenticity
 * Phonenumbers lookup through public keys
 * Signalling federation - Flexible message routing
 * P2P WebRTC - Media flows directly between peers
   * Industry-grade encryption
   * High quality audio and video(OPUS/VP9)

CA11 uses the following supporting services:
* NGINX to proxy HTTP and Websocket traffic
* Asterisk PBX to support calls over SIP networks
* Coturn TURN/STUN service to negotiate P2P connection setup
* MySQL Database to store volatile PBX accounts and SIG11 pubkeys

On the roadmap, there are plans for a native implementation for open platforms like
[KDE Plasma](https://kde.org/) and [Plasma mobile](https://www.plasma-mobile.org/). Phones like the [Librem 5](https://puri.sm/products/librem-5/) and the [Pinephone](https://www.pine64.org/pinephone/) are the first
target devices that will be used to test with.


# Installation
Node.js version 13 or higher is required. This manual uses Docker to get your development 
environment working without too much hazzle. If you need more control, you could use the 
content of the *docker* directory as a start for manual installation.

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

  *This shellscript only works on Archlinux(PRs welcome!)*

      sudo ./ca_system.sh

* Add local hostname lookup for the default domains:

      sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts

* Initialize PBX database

  *(!)Database docker doesn't have a persistent storage volume yet*

      cd ca11/docker
      docker-compose up
      docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head
      mysql -u root -p -h 127.0.0.1 asterisk < mariadb/sig11_asterisk.sql  # default pw is 'ca11ftw'
  
* Start the SIG11 tower service

      node packages/tower/src/index.js

Make sure you restart your browser, in order for the SSL certificate to refresh. 
Open https://dev.ca11.app and start a phone. Call one of the SIP testnumbers. 


## Troubleshooting
*  **No audio device found.**

   Sorry, CA11 requires a webcam currently.

* **SIG11 calls don't work**

   At the moment, the SIG11 protocol is not ready for usage yet.