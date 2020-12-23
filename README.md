NOTE: THIS PRODUCT IS NO LONGER MAINTAINED.

# CA11 - Multi-Protocol Webphone

[![Build status](https://github.com/open-voip-alliance/ca11/workflows/test/badge.svg)](https://github.com/open-voip-alliance/ca11/actions?query=workflow%3Atest)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**[CA11](https://github.com/open-voip-alliance/ca11)** is about to make
telephony more like the Web; accessible, open and without requiring accounts
or subscriptions. The frontend is a flexible signalling-agnostic WebRTC
webphone and supports the following signalling backends:

* **SIP** - Centralized WebRTC calls using [Asterisk](https://www.asterisk.org/) PBX
* **ION** - Centralized [custom SFU](https://github.com/open-voip-alliance/ca11) signalling (E2EE)
* **S11** - Decentralized WebRTC calls using WebCrypto ECDH (E2EE)


## Requirements

* Unix-like operating system
* Docker (or install manually using Docker as reference)
* Node.js 13+ (requires native JavaScript module support)
* Chromium 87 or later

## Install

* Clone the project & install npm dependencies:

  ```bash
  git clone git@github.com:open-voip-alliance/ca11.git
  cd ca11
  yarn
  ```

* Generate a TLS certificate & Certificate Authority (CA) for development

  > This is to enable TLS on locally defined domains without annoying the browser.
  > The CA install script (ca_system.sh) only works on Archlinux at the moment.
  > Other operating systems require manual CA installation. Restart the browser
  > to refresh the TLS certificate.

  ```bash
  cd docker/nginx/ssl
  ./ca_cert.sh dev.ca11.app
  ./ca_cert.sh sip.dev.ca11.app
  ./ca_cert.sh sig11.dev.ca11.app
  ./ca_cert.sh ion.dev.ca11.app
  sudo ./ca_system.sh
  cd -
  ```

* Add Hostname lookups for the development domains:

  ```bash
  sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
  sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
  sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts
  sudo echo "127.0.0.1 ion.dev.ca11.app" >> /etc/hosts

  cp docker/.env.example docker/.env

  # Add hostname lookups in case of linux (Docker host networking):
  sudo echo "127.0.0.1 asterisk" >> /etc/hosts
  sudo echo "127.0.0.1 coturn" >> /etc/hosts
  sudo echo "127.0.0.1 postgresql" >> /etc/hosts
  sudo echo "127.0.0.1 ion" >> /etc/hosts
   ```

* Setup Docker services

  ```bash
  # Use 'yarn backend:bridge' instead on MacOS/Windows
  yarn backend
  # Open another shell and initialize the Asterisk database
  docker exec -w /root/asterisk/contrib/ast-db-manage -it ca11_asterisk alembic -c config.ini upgrade head
  # Add experimental sig11/asterisk binding table; default password is "ca11ftw"
  psql -U postgres -h 127.0.0.1 asterisk < docker/postgres/sig11_asterisk.sql
  # CTRL-C Stop all Docker services
  ```

## Development

* Setup custom config files to test with:

  ```bash
  cp sig11/.sig11rc.defaults .sig11rc
  cp webphone/.webphonerc.defaults .webphonerc
  ```

* Start the development stack

  ```bash
  yarn backend
  node sig11/server.js # or use nodemon
  yarn frontend
  ```

* Open **chrome://flags** in Chromium and enable *Experimental Web Platform features* (import maps)
* Restart the browser and open the [url](https://dev.ca11.app) to the softphone

  > For autoreload, use the
  [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
* Verify the SIP stack by calling **1111** using the SIP protocol
* Start a second webphone from another browser with a fake WebRTC video stream:

  ```bash
  chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=~/.chromium-tmp
  ```
