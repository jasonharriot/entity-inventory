# entity-inventory
Create and manage information for unique physical entities with specialized labels


`sudo apt install -y nodejs npm nginx`

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`

Logout and log back in.

`nvm install 22`

`nvm use 22`


Edit /etc/nginx/sites-enabled/default:

```server {
	listen 80 default_server;
	listen [::]:80 default_server;

	server_name einventory.local;

	location / {
		proxy_set_header X-Real-IP $remote_addr;
		proxy_pass http://localhost:8001/;
	}
}```