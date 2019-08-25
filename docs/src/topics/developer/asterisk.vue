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

# Test Asterisk in the foreground
asterisk -cvvvvv
# Everything fine? Start Asterisk in the background
asterisk
</code>
</pre>

</component>
