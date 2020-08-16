server {
  listen 443 ssl http2 default_server;
  server_name dev.ca11.app;
  access_log /var/log/nginx/dev.ca11.app.access.log;
  error_log /var/log/nginx/dev.ca11.app.error.log;

  ssl_certificate /etc/nginx/ssl/dev.ca11.app.crt;
  ssl_certificate_key /etc/nginx/ssl/dev.ca11.app.key;

  location / {
    autoindex on;
    root /usr/share/nginx/html/;
    index index.html;
  }

  location /lib {
    root /usr/share/nginx/html/;
  }

  location /sig11 {
    root /usr/share/nginx/html/;
  }

  location /sip {
    root /usr/share/nginx/html/;
  }
}