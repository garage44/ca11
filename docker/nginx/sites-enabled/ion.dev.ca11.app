server {
  listen 443 ssl;
  server_name ion.dev.ca11.app;

  access_log /var/log/nginx/ion.dev.ca11.app.access.log;
  error_log /var/log/nginx/ion.dev.ca11.app.error.log;

  ssl_certificate /etc/nginx/ssl/ion.dev.ca11.app.crt;
  ssl_certificate_key /etc/nginx/ssl/ion.dev.ca11.app.key;

  location / {
    proxy_pass http://ion.dev.ca11.app:7000/;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_read_timeout 86400;
  }
}