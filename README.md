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

      git clone git@github.com:open-voip-alliance/ca11.git
      cd ca11
      yarn

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

      cp docker/.env.example .env
      vim docker/.env
      # Use "host" for Linux, "bridge" for MacOS & Windows

      # Add hostname lookups in case of "host":
      sudo echo "127.0.0.1 asterisk" >> /etc/hosts
      sudo echo "127.0.0.1 coturn" >> /etc/hosts
      sudo echo "127.0.0.1 postgresql" >> /etc/hosts

- Setup Docker services
      docker-compose -f docker/docker-compose.yml up
      # Open another shell...
      docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head
      # Default password is "ca11ftw"
      psql -U postgres -h 127.0.0.1 asterisk < docker/postgres/sig11_asterisk.sql
      # CTRL-C Stop all Docker services

## Development

- Setup custom config files to test with:

      cp sig11/.sig11rc.defaults .sig11rc
      cp webphone/.webphonerc.defaults .webphonerc

- Start the development stack

      docker-compose -f docker/docker-compose.yml up
      node sig11/server.js # or use nodemon
      ./cli.js watch

- Open a browser to the [softphone url](https://dev.ca11.app)

  > Use the [livereload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) to autoreload on file-change.
- Verify the SIP stack by calling **1111** using the SIP protocol
- Start a second webphone from another browser with a fake WebRTC video stream:

      chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=~/.chromium-tmp

## License

The CA11 [webphone](/webphone/LICENSE) package is a MIT-licensed descendant
of the [Vialer-js](https://github.com/vialer/vialer-js) project. The [SIP](https://github.com/open-voip-alliance/ca11/blob/master/sip/LICENSE)/[SIG11](https://github.com/open-voip-alliance/ca11/blob/master/sig11/LICENSE)/[Theme](https://github.com/open-voip-alliance/ca11/blob/master/theme/LICENSE) packages are [public domain](https://unlicense.org/) and don't have usage restrictions. The theme contains some artwork with deviating liberal licenses; [sound files](https://github.com/open-voip-alliance/ca11/blob/master/theme/audio/LICENSE) and [background images](https://github.com/open-voip-alliance/ca11/blob/master/theme/img/LICENSE).
