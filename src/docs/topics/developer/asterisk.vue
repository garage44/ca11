<component class="c-page">
    <h1>Use your own PBX</h1>
    <p>
        CA11's SIP integration is developed and tested with Asterisk 16, which
        supports SFU video conferencing and WebRTC. Compiling and setup
        of the Asterisk PBX can be a bit daunting. CA11 comes with a
        <a href="https://github.com/garage11/ca11-asterisk">example configuration</a>
        that is known to work. Following these instructions should get you
        up and running relatively fast:
    </p>

<pre v-highlightjs>
<code class="bash"># Asterisk installation (Archlinux)
git clone git@github.com:asterisk/asterisk.git
cd asterisk
git checkout 17.0.0
sudo ./contrib/scripts/install_prereq install
# libsrtp & xmlstarlet are needed to enable external codec
# selection in make menuselect. inetutils for the `hostname`
# command in ast_tls_cert
sudo pacman -S libsrtp xmlstarlet inetutils cmake

./configure
make menuselect
# Add Codec Translators => codec_opus
# Add Core Sound Packages => CORE-SOUNDS-EN-WAV
# Add Extras Sound Packages => EXTRA-SOUNDS-EN-WAV
# Save/Exit
sudo make install
sudo useradd -d /var/lib/asterisk asterisk

sudo vim /etc/sudoers
# Uncomment: %wheel ALL=(ALL) ALL

# Add asterisk group to wheel, e.g.: wheel:x:10:root,asterisk
sudo vim /etc/group

Generate TLS/DTLS keys for WebRTC support
# Replace the IP with your own IP or domain name
# Use a dummy pw when asked for it:
sudo mkdir /etc/asterisk/keys
sudo ./contrib/scripts/ast_tls_cert -C [IP] -O "ca11" -d /etc/asterisk/keys
# Enter the certificate password (x4)
cd ..
git clone git@github.com:garage11/ca11-asterisk.git
cd ca11-asterisk
sudo cp * /etc/asterisk

# Assign ownership to our asterisk user
sudo chown -R asterisk:asterisk /etc/asterisk/
sudo chown -R asterisk:asterisk /var/lib/asterisk/
sudo chown -R asterisk:asterisk /var/spool/asterisk/
sudo chown -R asterisk:asterisk /var/log/asterisk/
sudo chown -R asterisk:asterisk /var/run/asterisk/



# Setup mysql. Make sure you have a running MariaDB/MySQL instance.
# For more background info, see https://wiki.asterisk.org/wiki/display/AST/Setting+up+PJSIP+Realtime

git clone https://github.com/MariaDB/mariadb-connector-odbc.git
cd mariadb-connector-odbc
git checkout 3.1.3
cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCONC_WITH_UNIT_TESTS=Off  -DWITH_SSL=OPENSSL -DCMAKE_INSTALL_PREFIX=/usr/local
sudo make install
sudo vim /etc/odbcinst.ini

[MySQL]
Description = ODBC for MySQL
Driver = /usr/local/lib/libmaodbc.so
UsageCount = 2

sudo vim /etc/odbc.ini
[asterisk]
Driver = MySQL
Description = MySQL connection to ‘asterisk’ database
Server = localhost
Port = 3306
Database = asterisk
UserName = root
Password = password
Socket = /var/run/mysqld/mysqld.sock

sudo vim /etc/asterisk/res_odbc.conf
[asterisk]
enabled => yes
dsn => asterisk
username => root
password => password
pre-connect => yes

sudo vim /etc/asterisk/sorcery.conf

[res_pjsip] ; Realtime PJSIP configuration wizard
endpoint=realtime,ps_endpoints
auth=realtime,ps_auths
aor=realtime,ps_aors
domain_alias=realtime,ps_domain_aliases
contact=realtime,ps_contacts

[res_pjsip_endpoint_identifier_ip]
identify=realtime,ps_endpoint_id_ips

sudo vim /etc/asterisk/extconfig.conf

[settings]
ps_endpoints => odbc,asterisk
ps_auths => odbc,asterisk
ps_aors => odbc,asterisk
ps_domain_aliases => odbc,asterisk
ps_endpoint_id_ips => odbc,asterisk
ps_contacts => odbc,asterisk


sudo vim /etc/asterisk/modules.conf
preload => res_odbc.so
preload => res_config_odbc.so
noload => chan_sip.so

sudo pip install alembic
cd contrib/ast-db-manage/
cp config.ini.sample config.ini
# Change sqlalchemy.url connection string in config.ini

# mysql -u root -p;
# > create database asterisk;

alembic -c config.ini upgrade head

# mysql -u root -p -D asterisk;
mysql> insert into ps_aors (id, max_contacts) values (1000, 1);
mysql> insert into ps_aors (id, max_contacts) values (2000, 1);
mysql> insert into ps_auths (id, auth_type, password, username) values (1000, 'userpass', 1000, 1000);
mysql> insert into ps_auths (id, auth_type, password, username) values (2000, 'userpass', 2000, 2000);
mysql> insert into ps_endpoints (id, transport, aors, auth, context, disallow, allow, direct_media) values (1000, 'transport-wss', '1000', '1000', 'default', 'all', 'g722', 'no');
mysql> insert into ps_endpoints (id, transport, aors, auth, context, disallow, allow, direct_media) values (2000, 'transport-wss', '2000', '2000', 'default', 'all', 'g722', 'no');
mysql> quit;

# Test Asterisk in the foreground
asterisk -cvvvvv
# Everything fine? Start Asterisk in the background
asterisk
</code>
</pre>

</component>




sudo su asterisk
cd /etc/asterisk
# Change unsecurepassword to a more secure password.
vim pjsip.conf