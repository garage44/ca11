# Add CA to system:
CA=garage11.ca
# Archlinux
if [ -f "/etc/arch-release" ]; then
   echo "[Archlinux] installing $CA.crt..."
   cp "$CA.crt"  /etc/ca-certificates/trust-source/anchors
   trust extract-compat
   update-ca-trust
fi

