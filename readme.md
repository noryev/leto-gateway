# Hosting a Public IPFS gateway using AWS Fargate and AWS Co-Pilot

## Setup

- Create an account on Gitpod.io

- Create Enviroment Variable Records


## Get a domain name
The domain I chose for this gateway is fenring.io

Configuration with domain will be done using AWS Route 53

If you want a subdomain gateway, you'll need to use one that's compatible with [Let's Encrypt's wildcard plugins](https://eff-certbot.readthedocs.io/en/stable/using.html#dns-plugins). Or at least use one that allows you to change its name server to Digital Ocean, which is compatible.

## Setup the server

## ipfs server configuration

[Unit]
Description=ipfs daemon
[Service]
ExecStart=/usr/local/bin/ipfs daemon — enable-gc
Restart=always
User=ubuntu
Group=ubuntu
Environment=”IPFS_PATH=/home/ubuntu/data/ipfs”
[Install]
WantedBy=multi-user.target


This project is based on a fork from Protocol Labs

## License = MIT + Apache
