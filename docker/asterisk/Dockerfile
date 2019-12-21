# vim:set ft=dockerfile:
FROM archlinux

MAINTAINER Jeroen van Veen <jvanveen@protonmail.com>

RUN echo Server = http://ftp.nluug.nl/os/Linux/distr/archlinux/\$repo/os/\$arch > /etc/pacman.d/mirrorlist
RUN pacman -Sy
RUN pacman -S git vim inetutils awk openssh diffutils python-psycopg2 python-alembic --noconfirm

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
 wget https://ftp.postgresql.org/pub/odbc/versions/src/psqlodbc-12.00.0000.tar.gz &&\
 tar xfz psqlodbc-12.00.0000.tar.gz &&\
 cd psqlodbc-12.00.0000 &&\
 ./configure &&\
 make install

CMD /usr/bin/asterisk -W -vvvf -n
