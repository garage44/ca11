# CA11 - Web Telephony

**(!) This project is still in its infancy; don't expect a smooth experience just yet.**

<https://ca11.app>

[![Build status](https://github.com/garage11/ca11/workflows/test/badge.svg)](https://github.com/garage11/ca11/actions?query=workflow%3Atest)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**[CA11](https://github.com/garage11/ca11)** started in 2019 with the
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

      git clone git@github.com:garage11/ca11.git
      cd ca11
      yarn
      cp .ca11rc.example .ca11rc

- Generate a TLS certificate & Certificate Authority (CA) for development

  > This is to enable TLS on locally defined domains without annoying the browser.
  > The CA install script (ca_cert.sh) only works on Archlinux at the moment.
  > Other operating systems require manual CA installation. Restart the browser
  > to refresh the TLS certificate.

      cd docker/nginx/ssl
      ./ca_cert.sh dev.ca11.app
      ./ca_cert.sh sip.dev.ca11.app
      ./ca_cert.sh sig11.dev.ca11.app
      sudo ./ca_system.sh
      cd -

- Add Hostname lookups for the development domains:

      sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts

- Setup the Asterisk database

      docker-compose -f docker/docker-compose.yml up
      docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head
      psql -U postgres -h 127.0.0.1 asterisk < docker/postgres/sig11_asterisk.sql
      # Default password is "ca11ftw"
      # CTRL-C Stop all Docker services

## Development

- Start the development stack

      docker-compose -f docker/docker-compose.yml up
      # optionally use nodemon for auto-reload
      node packages/sig11/server.js
      ./cli.js watch

- Open a browser to the [softphone url](https://dev.ca11.app)

  > Use the [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) to autoreload on file-change.
- Verify the SIP stack by calling **1111** using the SIP protocol
- Start a second webphone from another browser with a fake WebRTC video stream:

      chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=~/.chromium-tmp

## License

The CA11 [webphone](/packages/webphone/LICENSE) package is a MIT-licensed descendant
of the [Vialer-js](https://github.com/vialer/vialer-js) project. The [SIP](https://github.com/garage11/ca11/blob/master/packages/sip/LICENSE)/[SIG11](https://github.com/garage11/ca11/blob/master/packages/sig11/LICENSE)/[Theme](https://github.com/garage11/ca11/blob/master/packages/webphone-theme/LICENSE) packages are [public domain](https://unlicense.org/) and don't have usage restrictions. The theme contains some artwork with deviating liberal licenses; [sound files](https://github.com/garage11/ca11/blob/master/packages/webphone-theme/audio/LICENSE) and [background images](https://github.com/garage11/ca11/blob/master/packages/webphone-theme/img/LICENSE).
