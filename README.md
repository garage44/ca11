# CA11 - Web Telephony

**(!) This project is in its infancy; don't expect a smooth experience yet.**

<https://ca11.app>

[![Build status](https://github.com/open-voip-alliance/ca11/workflows/test/badge.svg)](https://github.com/open-voip-alliance/ca11/actions?query=workflow%3Atest)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**[CA11](https://github.com/open-voip-alliance/ca11)** started in 2019 with the
purpose to make telephony more like the Web; accessible and without the
need for accounts or subscriptions. CA11 consists of a WebRTC softphone
with flexible support for multiple signalling protocols. It currently
implements the **SIP** protocol and a custom protocol called **SIG11**.
SIP is oriented towards calling with an intermediary PBX(Asterisk);
SIG11 is developed to accomodate P2P calling. The CA11 project generally
focusses on the following themes:

- Privacy - Calls (**SIP**/**SIG11**) and Signalling (**SIG11**) should be E2E encrypted
- Accessibility - Open accountless signalling service (**SIG11**)
- Synergy - Integrate with existing telephony systems (**SIP**)
- Costs - Decentralized media (**SIG11**)

## Requirements

- Unix-like operating system
- Docker (or install manually using Docker as reference)
- Node.js 13+ (requires native JavaScript module support)
- Chromium 74 or later (requires experimental import maps support during development)

## Install

- Clone the project & install its dependencies:

  ```bash
  git clone git@github.com:open-voip-alliance/ca11.git
  cd ca11
  yarn
  ```

- Generate a TLS certificate & Certificate Authority (CA) for development

  > This is to enable TLS on locally defined domains without annoying the browser.
  > The CA install script (ca_system.sh) only works on Archlinux at the moment.
  > Other operating systems require manual CA installation. Restart the browser
  > to refresh the TLS certificate.

  ```bash
  cd docker/nginx/ssl
  ./ca_cert.sh dev.ca11.app
  ./ca_cert.sh sip.dev.ca11.app
  ./ca_cert.sh sig11.dev.ca11.app
  ./ca_cert.sh sfu.dev.ca11.app
  sudo ./ca_system.sh
  cd -
  ```

- Add Hostname lookups for the development domains:

  ```bash
  sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
  sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
  sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts
  sudo echo "127.0.0.1 sfu.dev.ca11.app" >> /etc/hosts

  cp docker/.env.example .env
  vim docker/.env
  # Use "bridge" config for MacOS/Windows and "host" for Linux
  #  COMPOSE_FILE=docker-compose.yml:docker-compose.bridge.yml

  # Add hostname lookups in case of "host":
  sudo echo "127.0.0.1 asterisk" >> /etc/hosts
  sudo echo "127.0.0.1 coturn" >> /etc/hosts
  sudo echo "127.0.0.1 postgresql" >> /etc/hosts
  sudo echo "127.0.0.1 sfu" >> /etc/hosts
   ```

- Setup Docker services

  ```bash
  # Alternatively, use yarn backend:host when on Linux.
  yarn backend:bridge
  # Open another shell...
  docker exec -w /root/asterisk/contrib/ast-db-manage -it ca11_asterisk alembic -c config.ini upgrade head
  # Default password is "ca11ftw"
  psql -U postgres -h 127.0.0.1 asterisk < docker/postgres/sig11_asterisk.sql
  # CTRL-C Stop all Docker services
  ```

## Development

- Setup custom config files to test with:

  ```bash
  cp sig11/.sig11rc.defaults .sig11rc
  cp webphone/.webphonerc.defaults .webphonerc
  ```

- Start the development stack

  ```bash
  yarn backend:bridge
  node sig11/server.js # or use nodemon
  yarn frontend
  ```

- Open a browser to the [softphone url](https://dev.ca11.app)

  > For autoreload, use the
  [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
- Verify the SIP stack by calling **1111** using the SIP protocol
- Start a second webphone from another browser with a fake WebRTC video stream:

  ```bash
  chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=~/.chromium-tmp
  ```
