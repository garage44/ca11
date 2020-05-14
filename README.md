# CA11 - Free WebRTC Telephony

[![Build status](https://github.com/garage11/ca11/workflows/test/badge.svg)](https://github.com/garage11/ca11/actions?query=workflow%3Atest)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

The [CA11 project](https://github.com/garage11/ca11) started in 2019 with the
purpose to make telephony more like the Web itself; accessible and without a
need for accounts. In short, the CA11 project is a P2P webphone that comes
with an open accountless signalling network. It aims to address the
following issues:

- Privacy; all calls and signalling messages are E2E encrypted
- Accessibility; open network, all it takes is to open the webphone and start calling
- Costs; operating a signalling service is extremely cheap; no centralized media pipes required
- Compatibility; CA11 can use existing telephony signalling (SIP)

## Install

### Requirements

- Chrom(e/ium) browser
- Node.js 13+ (Native ESM)
- Docker (or install manually using Docker as reference)

### Steps

- Clone the project & install dependencies:

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

Restart the browser for the SSL certificate to be picked up and open
[the webphone](https://dev.ca11.app). Call one of the SIP testnumbers
in contacts to verify that the SIP stack works as expected.
