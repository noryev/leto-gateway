# Leto.gg

> A caching layer built for the leto metrics engine(this repo currently is using the configuration built by NFT.Storage)

This repo was originally written by the team at NFT.Storage. Big thanks to them for making this project possible!

## Getting started

One time set up of your cloudflare worker subdomain for dev:

- `pnpm install` - Install the project dependencies from the monorepo root directory.
- `pnpm dev` - Run the worker in dev mode.

## Gateway Usage


## Environment setup

- Add secrets

  ```sh
    wrangler secret put SENTRY_DSN --env $(whoami) # Get from Sentry
    wrangler secret put LOKI_URL --env $(whoami) # Get from Loki
    wrangler secret put LOKI_TOKEN --env $(whoami) # Get from Loki
  ```

## High level architecture

`leto.gg` is serverless code running across the globe to provide exceptional performance, reliability, and scale. It is powered by Cloudflare workers running as close as possible to end users.

Thanks to the immutable nature of IPFS, a CDN cache is an excellent fit for content retrieval as a given request URL will always return the same response. Accordingly, as a first IPFS resolution layer, `leto.gg` leverages Cloudflare [Cache Zone API](https://developers.cloudflare.com/workers/runtime-apis/cache) to look up for content previously cached in Cloudflare CDN (based on geolocation of the end user).

If the content is not in the first caching layers, we will trigger a dotstorage resolution where other dotstorage products cache is checked.

In the event of content not being already cached, a race with multiple IPFS gateways is performed. As soon as one gateway successfully responds, its response is forwarded to the user and added to Cloudflare Cache.


## Rate limiting

Leto Gateway is currently rate limited at 200 requests per minute to a given IP Address. In the event of a rate limit, the IP will be blocked for 30 seconds.

## Deny List

We rely on [badbits](https://badbits.dwebops.pub/) denylist together wtth our own denylist to prevent serving malicious content to the leto.link users.

When new malicious content is discovered, it should be reported to [badbits](https://badbits.dwebops.pub/) denylist given it is shared among multiple gateways.
