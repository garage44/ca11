# CA11

## WebRTC Telephony

<https://ca11.app>

[![Build status](https://github.com/garage11/ca11/workflows/test/badge.svg)](https://github.com/garage11/ca11/actions?query=workflow%3Atest)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**[CA11](https://github.com/garage11/ca11)** was started in 2019 with the
purpose to make telephony more like the Web; accessible and without a
need for accounts. CA11 is a WebRTC softphone with flexible support for
multiple signalling protocols. It implements the existing **SIP** protocol
and a customized **SIG11** signalling. SIP is oriented towards centralized
calling using a PBX; SIG11 focusses on P2P calling. CA11 aims to focus on
the following themes:

- Privacy - Calls and Signalling messages must be E2E encrypted where possible
- Accessibility - SIG11 features an open signalling network as a service
- Costs - Bringing down hosting costs by decentralizing media flows
- Compatibility - Calling over existing telephony networks (SIP)

## Requirements

- Chrom(e/ium) browser
- Node.js 13+ (Native ESM)
- Docker (or install manually using Docker as reference)

## Installation

- Checkout the project & install dependencies:

      git clone git@github.com:garage11/ca11.git
      cd ca11
      yarn
      cp .ca11rc.example .ca11rc
      yarn bootstrap
      ./cli.js watch

- Generate a developer certificate & CA to use SSL without warnings on a local domain:

      cd ca11/docker/nginx/ssl
      ./ca_cert.sh dev.ca11.app
      ./ca_cert.sh sip.dev.ca11.app
      ./ca_cert.sh sig11.dev.ca11.app

- (!) Manually import the development CA

      sudo ./ca_system.sh

> This shell-script for importing the CA into the system only works on Archlinux at the moment.

- Add local hostname lookup for the default domains:

      sudo echo "127.0.0.1 dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sip.dev.ca11.app" >> /etc/hosts
      sudo echo "127.0.0.1 sig11.dev.ca11.app" >> /etc/hosts

- Setup Asterisk database

      cd ca11/docker
      docker-compose up
      docker exec -w /root/asterisk/contrib/ast-db-manage -it asterisk alembic -c config.ini upgrade head
      psql -U asterisk -h 127.0.0.1 asterisk < postgres/sig11_asterisk.sql  # default pw is 'ca11ftw'

- Start the signalling service

      node packages/sig11/service.js

Restart the browser for the SSL certificate to be picked up and start the [softphone](https://dev.ca11.app).

## Verification

- Call one of the SIP testnumbers in Contacts to verify the SIP stack functionality.
