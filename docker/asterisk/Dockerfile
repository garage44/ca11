# vim:set ft=dockerfile:
FROM archlinux

MAINTAINER Jeroen van Veen <jvanveen@protonmail.com>

RUN echo Server = http://ftp.nluug.nl/os/Linux/distr/archlinux/\$repo/os/\$arch > /etc/pacman.d/mirrorlist

RUN pacman -Syu --noconfirm
RUN pacman -S git inetutils awk cmake openssh diffutils --noconfirm

RUN cd $HOME &&\
 git clone https://github.com/asterisk/asterisk.git &&\
 cd asterisk &&\
 git checkout 17.0.0 &&\
 contrib/scripts/install_prereq install

RUN cd $HOME/asterisk && \
 ./configure && \
 make menuselect.makeopts && \
 menuselect/menuselect \
 --enable codec_opus \
 --enable CORE-SOUNDS-EN-WAV \
 --enable EXTRA-SOUNDS-EN-WAV \
 menuselect.makeopts

RUN cd $HOME/asterisk && \
 make install

EXPOSE 5060/udp 5060/tcp
CMD /usr/bin/asterisk -W -vvvf -n
