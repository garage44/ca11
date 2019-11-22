server {
  listen 443 ssl http2 default_server;
  server_name dev.ca11.app;
  index index.html;
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;

  ssl_certificate /etc/nginx/ssl/dev.ca11.app.crt;
  ssl_certificate_key /etc/nginx/ssl/dev.ca11.app.key;

  location / {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_read_timeout 86400;
  }
}