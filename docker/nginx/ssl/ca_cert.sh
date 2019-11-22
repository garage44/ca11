#!/bin/bash
if [ -z "$1" ]; then
    echo -e "\nPlease call '$0 <domain-name>' to run this command!\n"
    exit 1
fi

PW=dummypw
CA=garage11.ca
SUBJ="/C=NL/ST=City/L=Groningen/O=Garage11/OU=R&D/CN=$1"
SUBJCA="/C=NL/ST=City/L=Groningen/O=Garage11/OU=R&D/CN=Garage11 CA"

if [ ! -f "$CA.key" ]; then
    echo "certificate authority not found; creating new one"
    openssl genrsa -des3 -passout "pass:$PW" -out "$CA.key" 2048
    openssl req -x509 -new -nodes -key "$CA.key" -passin "pass:$PW" -sha256 -days 1825 -out "$CA.pem" -subj "$SUBJCA"
    openssl x509 -outform der -in "$CA.pem" -out "$CA.crt"
fi

echo "creating certificate for $1"
openssl genrsa -out "$1.key" 2048
openssl req -new -key "$1.key" -out "$1.csr" -subj "$SUBJ"
echo "authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $1" >> "$1.ext"
openssl x509 -req -in "$1.csr" -passin "pass:$PW" -CA "$CA.pem" -CAkey "$CA.key" -CAcreateserial -out "$1.crt" -days 1825 -sha256 -extfile "$1.ext"
