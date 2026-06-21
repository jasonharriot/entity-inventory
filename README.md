# entity-inventory
Create and manage unique physical entities, their relationships, properties, and status, with specialized labels printable labels.

# Prerequisites
* A server to which you have priviliged shell access

# Basic installation
These instructions assume nodejs and npm are installed.

Run the installation script:

`chmod +x install.sh`

`./install.sh`

# Reverse proxy for local access
These instructions assume Nginx is used.

Modify `/etc/nginx/sites-available/einventory.local`

```
server {
	...

	server_name einventory.local;

	proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

	location / {
		proxy_pass http://localhost:8001/;
	}

	...
}
```

`ln -s /etc/nginx/sites-available/einventory.local /etc/nginx/sites-enabled/einventory.local`

`systemctl restart nginx`