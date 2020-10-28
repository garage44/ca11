server {
  listen 443 ssl;
  server_name sfu.dev.ca11.app;

  access_log /var/log/nginx/sfu.dev.ca11.app.access.log;
  error_log /var/log/nginx/sfu.dev.ca11.app.error.log;

  ssl_certificate /etc/nginx/ssl/sfu.dev.ca11.app.crt;
  ssl_certificate_key /etc/nginx/ssl/sfu.dev.ca11.app.key;

  location / {
    proxy_pass http://sfu:7000/;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_read_timeout 86400;
  }
}