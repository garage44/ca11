# CA11

## WebRTC Telephony

<https://ca11.app>

[![Build status](https://github.com/garage11/ca11/workflows/test/badge.svg)](https://github.com/garage11/ca11/actions?query=workflow%3Atest)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**[CA11](https://github.com/garage11/ca11)** was started in 2019 with the
purpose to make telephony more like the Web; accessible and without a
need for accounts or subscriptions. CA11 is basically a WebRTC softphone
with flexible support for multiple signalling protocols. It implements the
existing **SIP** protocol and a custom protocol called **SIG11**. SIP is
oriented towards calling with an intermediary PBX(Asterisk); SIG11 is
developed to accomodate P2P calling. The CA11 project focusses on
the following topics:

- Privacy - Calls (**SIP**/**SIG11**) and Signalling(**SIG11**) are E2E encrypted
- Accessibility - Open accountless signalling service(**SIG11**)
- Costs - Decentralize media flow(**SIG11**)
- Compatibility - Use existing telephony networks (**SIP**)

## Requirements

- Chromium 74 or later (requires experimental import maps)
- Node.js 13+ (requires ES-Module support)
- Docker - or install manually using Docker directives as reference

## Installation

- Clone the project & install its dependencies:

      git clone git@github.com:garage11/ca11.git
      cd ca11
      yarn
      cp .ca11rc.example .ca11rc
      yarn bootstrap
      ./cli.js watch

- Generate a developer SSL certificate & CA to use SSL without warnings on a local domain:

      cd ca11/docker/nginx/ssl
      ./ca_cert.sh dev.ca11.app
      ./ca_cert.sh sip.dev.ca11.app
      ./ca_cert.sh sig11.dev.ca11.app

- (!) Manually import the development CA

      sudo ./ca_system.sh

> The CA installation shell-script only works on Archlinux at the moment.
> Other operating systems require manual installation. Restart the browser
> for the SSL certificate to be picked up.

- Add local hostname lookup for the default domains:

      sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts

- Setup Asterisk database

      cd ca11/docker
      docker-compose up
      docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head
      psql -U asterisk -h 127.0.0.1 asterisk < postgres/sig11_asterisk.sql  # default pw is 'ca11ftw'

## Usage

- Start SIG11 service

      node packages/sig11/server.js

- Open a browser tab to the [softphone](https://dev.ca11.app)
- Call one of the SIP testnumbers in Contacts to verify the SIP stack functionality
- Call one browser from the other. Start another browser with a fake WebRTC stream
  in order to make a call from one computer:

      chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features  --user-data-dir=~/.chromium-tmp
