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
git checkout 16.1.1
sudo ./contrib/scripts/install_prereq install
# Needed to enable external codec selection in make menuselect
sudo pacman -S libsrtp xmlstarlet

./configure
make menuselect
# Add Codec Translators => codec_opus
# Add Core Sound Packages => CORE-SOUNDS-EN-WAV
# Add Extras Sound Packages => EXTRA-SOUNDS-EN-WAV
# Save/Exit
sudo make install
sudo useradd -d /var/lib/asterisk asterisk
# Uncomment: %wheel ALL=(ALL) ALL
sudo vim /etc/sudoers

# Add asterisk group to wheel, e.g.: wheel:x:10:root,asterisk
vim /etc/group

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

sudo su asterisk
cd /etc/asterisk
# Change unsecurepassword to a more secure password.
vim pjsip.conf

# Setup mysql
# For more info, see https://wiki.asterisk.org/wiki/display/AST/Setting+up+PJSIP+Realtime

sudo pip install alembic
cd contrib/ast-db-manage/
# Change config.ini sqlalchemy.url
alembic -c config.ini upgrade head

git clone git@github.com:MariaDB/mariadb-connector-odbc.git
cd mariadb-connector-odbc
git checkout 3.1.3
cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCONC_WITH_UNIT_TESTS=Off  -DWITH_SSL=OPENSSL -DCMAKE_INSTALL_PREFIX=/usr/local
sudo make install
vim /etc/odbcinst.ini

[MySQL]
Description = ODBC for MySQL
Driver = /usr/local/lib/libmaodbc.so
UsageCount = 2

vim /etc/odbc.ini
[asterisk]
Driver = MySQL
Description = MySQL connection to ‘asterisk’ database
Server = localhost
Port = 3306
Database = asterisk
UserName = root
Password = password
Socket = /var/run/mysqld/mysqld.sock

vim /etc/asterisk/res_odbc.conf
[asterisk]
enabled => yes
dsn => asterisk
username => root
password => password
pre-connect => yes

vim /etc/asterisk/sorcery.conf

[res_pjsip] ; Realtime PJSIP configuration wizard
endpoint=realtime,ps_endpoints
auth=realtime,ps_auths
aor=realtime,ps_aors
domain_alias=realtime,ps_domain_aliases
contact=realtime,ps_contacts

[res_pjsip_endpoint_identifier_ip]
identify=realtime,ps_endpoint_id_ips

vim /etc/asterisk/extconfig.conf

[settings]
ps_endpoints => odbc,asterisk
ps_auths => odbc,asterisk
ps_aors => odbc,asterisk
ps_domain_aliases => odbc,asterisk
ps_endpoint_id_ips => odbc,asterisk
ps_contacts => odbc,asterisk


vim /etc/asterisk/modules.conf
preload => res_odbc.so
preload => res_config_odbc.so
noload => chan_sip.so

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
