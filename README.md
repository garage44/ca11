# CA11

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

> Why do we need accounts and subscriptions for digital communication,
> when we have the internet and P2P communication technology?

The [CA11 project](https://github.com/garage11/ca11) was started in 2019 with the purpose to make telephony more like the internet itself; accessible and without the need for accounts.

As of 2020, the communication landscape is largly comprised of VoIP providers and over-the-top communication solutions. VoIP providers tend to offer reliable services, but deal with high operation costs, legislations, privacy issues (no e2e encryption, lawful interception) and fail to innovate. Over-the-top providers (Hangouts, Whatsapp, Skype, ...) are quite innovative, but data-mine and track their users as a business model.

The CA11 project has a different approach:

- It makes (existing) communication technology cheap to operate
- It makes communication accessible for users by dropping the need for accounts and by using the web

A thin account-less(public-key crypto), federated signalling network connects WebRTC webphones together. To make use of existing telephony networks, CA11 also supports SIP calling over WebRTC.

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
