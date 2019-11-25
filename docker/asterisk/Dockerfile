# vim:set ft=dockerfile:
FROM archlinux

MAINTAINER Jeroen van Veen <jvanveen@protonmail.com>

RUN echo Server = http://ftp.nluug.nl/os/Linux/distr/archlinux/\$repo/os/\$arch > /etc/pacman.d/mirrorlist
RUN pacman -Syu --noconfirm
RUN pacman -S git vim inetutils awk cmake openssh diffutils python-mysqlclient python-alembic --noconfirm

RUN cd $HOME &&\
 git clone https://github.com/asterisk/asterisk.git &&\
 cd asterisk &&\
 git checkout 17.0.0 &&\
 contrib/scripts/install_prereq install

RUN cd $HOME/asterisk &&\
 ./configure &&\
 make menuselect.makeopts &&\
 menuselect/menuselect \
 --enable codec_opus \
 --enable CORE-SOUNDS-EN-WAV \
 --enable EXTRA-SOUNDS-EN-WAV \
 menuselect.makeopts

RUN cd $HOME/asterisk && \
 make install

RUN cd $HOME &&\
 git clone https://github.com/MariaDB/mariadb-connector-odbc.git &&\
 cd mariadb-connector-odbc &&\
 git checkout 3.1.3 &&\
 cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCONC_WITH_UNIT_TESTS=Off  -DWITH_SSL=OPENSSL -DCMAKE_INSTALL_PREFIX=/usr/local &&\
 make install

CMD /usr/bin/asterisk -W -vvvf -n
