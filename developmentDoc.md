# Caching Layer Notes/No-Brainers

## Gateway Information from Chris @ Web3.Storage.

ie: https://w3s.link/ipfs/bafybeid4gwmvbza257a7rx52bheeplwlaogshu4rgse3eaudfkfm7tx2my/hi-gateway.txt

Subdomain style URLs
A "subdomain style" gateway URL puts the CID into the host portion of the URL, as a subdomain of the gateway host, like this:

https://bafkreied5tvfci25k5td56w4zgj3owxypjgvmpwj5n7cvzgp5t4ittatfy.ipfs.w3s.link

If the CID points to a directory listing, you can use the path portion of the URL to specify the filename:

https://bafybeid4gwmvbza257a7rx52bheeplwlaogshu4rgse3eaudfkfm7tx2my.ipfs.w3s.link/hi-gateway.txt

This is the preferred style for serving web assets over HTTP gateways, because web browsers provide security isolation on a per-domain basis. Using the subdomain style, every CID gets its own "namespace" for things like cookies and local storage, which isolates things from other web content stored on IPFS.

## Review Cloudflare configuration and edit files to leto.gg instead of ...

we definately might be sticking with the Cloudflare configuration simply due to the pricing/costs equation. Also the configuration is already completed.
