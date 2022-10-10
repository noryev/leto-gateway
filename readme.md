# Hosting a public IPFS gateway

This guide assumes that you've used `ssh` before. If not, then you *must* read [How to Set Up SSH Keys](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04).

I'm also going to assume you've used `ipfs` before. If not, then take some time to discover IPFS with [IPFS Desktop](https://github.com/ipfs/ipfs-desktop), [IPFS Companion](https://github.com/ipfs/ipfs-companion) and [`go-ipfs`](https://github.com/ipfs/go-ipfs)!

## Get a host

A public IPFS gateway can be hosted at home or on the cloud.

If you want to host at home, be aware that it will costs electricity and bandwidth. You can host it on an upside-down laptop running Ubuntu Server or even on a [Raspberry Pi](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/?variant=raspberry-pi-4-model-b-8gb).

## Get a domain name

If you want a subdomain gateway, you'll need to use one that's compatible with [Let's Encrypt's wildcard plugins](https://eff-certbot.readthedocs.io/en/stable/using.html#dns-plugins). Or at least use one that allows you to change its name server to Digital Ocean, which is compatible.

Personally, I used Google Domains, but it's a bit expensive. Plus, it's not compatible with Let's Encrypt wildcards, so I had to move over the management of my domain to Digital Ocean. There are free alternatives like [freenom](https://freenom.com) if you're not looking for a fancy name.

## Setup the server

