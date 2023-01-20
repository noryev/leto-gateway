# Leto.gg(gateway.leto.gg) THIS IS ALL FUCKING WORTHLESS I MIGHT AS WELL DELETE THIS WHOLE FUCKING REPO

> A caching layer built for the leto metrics engine(this repo currently is using the configuration built by NFT.Storage)

This repo was originally written by the team at NFT.Storage. Big thanks to them for making this project possible!

## Getting started

One time set up of your cloudflare worker subdomain for dev:

- `pnpm install` - Install the project dependencies from the monorepo root directory.
- `pnpm dev` - Run the worker in dev mode.

## Gateway Usage

Leto Gateway provides IPFS path style resolutions `https://leto.gg/ipfs/{cid}` as follows:

```
> curl https://leto.gg/ipfs/bafkreidyeivj7adnnac6ljvzj2e3rd5xdw3revw4da7mx2ckrstapoupoq
Hello leto! 😎
> curl https://leto.gg/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX
...
```

In practice, when Leto Gateway receives a IPFS path style request, it will redirect to a subdomain style resolution maintaining compliance with the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy). The canonical form of access `https://{CID}.ipfs.leto.gg/{optional path to resource}` causes the browser to interpret each returned file as being from a different origin.

```
> curl https://bafkreidyeivj7adnnac6ljvzj2e3rd5xdw3revw4da7mx2ckrstapoupoq.ipfs.leto.gg
Hello leto! 😎
```

Please note that subdomain resolution is only supported with [CIDv1](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats) in case-insensitive encoding such as Base32 or Base36. When using IPFS path resolution, the requested CID will be converted before the redirect.

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


## Deny List

We rely on [badbits](https://badbits.dwebops.pub/) denylist together wtth our own denylist to prevent serving malicious content to the leto.link users.

When new malicious content is discovered, it should be reported to [badbits](https://badbits.dwebops.pub/) denylist given it is shared among multiple gateways.

The configuration above is still in progress, currently we have a standard ipfs Gateway at gateway.leto.gg and its handling our preliminary testing for now until the production 2 way gateway is running. 
- Current Usage Stats(Jan 19th 2023)![Screenshot 2023-01-19 at 3 46 47 AM](https://user-images.githubusercontent.com/30084404/213410162-77c48f3e-db55-4c6a-9cae-0ae5bbd5ae8b.png)


