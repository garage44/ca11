<component class="c-page">
    <h1>Setup NGINX proxy</h1>
    <p>
        How to setup NGINX as proxy for the CA11 frontend,
        a SIG11 node and an Asterisk SIP service:
    </p>

<p>
Generate a CA:
</p>
<pre v-highlightjs>
<code class="bash">
openssl genrsa -des3 -out dev-ca.key 2048
openssl req -x509 -new -nodes -key dev-ca.key -sha256 -days 1825 -out dev-ca.pem
</code>
</pre>

<p>
Add authority to chrome://settings/certificates and generate domain certifcates for:
<ul>
    <li>dev.ca11.app</li>
    <li>sip.dev.ca11.app</li>
    <li>sig11.dev.ca11.app</li>
</ul>

<pre v-highlightjs>
<code class="bash">
openssl genrsa -out dev.ca11.app.key 2048
openssl req -new -key dev.ca11.app.key -out dev.ca11.app.csr

vim dev.ca11.app.ext

authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = dev.ca11.app

openssl x509 -req -in dev.ca11.app.csr -CA dev-ca.pem -CAkey dev-ca.key -CAcreateserial -out dev.ca11.app.crt -days 1825 -sha256 -extfile dev.ca11.app.ext
</code>
</pre>

Create the nginx config:
<pre v-highlightjs>
<code class="bash">
vim /etc/nginx/sites-available/dev.ca11.app
ln -s /etc/nginx/sites-available/dev.ca11.app /etc/nginx/sites-enabled/dev.ca11.app
</code>
</pre>
</p>
</component>