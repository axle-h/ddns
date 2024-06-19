# ddns

Custom dynamic DNS with an emphasis on efficiency.

I wanted a custom dynamic DNS that:

* Is stateless
* Uses Porkbun API *respectfully*
* Does not use services like ipinfo.io

I couldn't find one so I made this. The process is:

1. WAN IP is scraped from my TP-Link router
2. Do a public DNS lookup of dynamic hostname
3. If 1. and 2. match then do nothing -> this is the most likely scenario, in which case the only internet service in use is public DNS
4. Otherwise, use Porkbun API to resolve dynamic hostname DNS -> this is possible if old public DNS record has not expired yet
5. If it *still* doesn't match then our WAN IP changed

## Install

Use Kubernetes.

1. Edit the configmap in `./k8s/configmap.yml` (add a secret if you want, I just don't let bad actors have my k8s keys)
2. Change the cron spec in `./k8s/cronjob.yml`
3. Apply
    ```shell
    kubectl create namespace ddns
    kubectl --namespace ddns apply -f ./k8s
    ```

## TP-Link

I use a TP-Link router that doesn't have an unauthenticated way of viewing the WAN address and doesn't have an API.
I really didn't fancy using something heavy like Pupeteer, so I had to resort to reverse engineering the web app.
The web app is an SPA (I think -> I've been staring at it for hours and still don't understand it) so it was just a case of watching the AJAX... right?
Nope, other than the first few requests, they're total gibberish.

It turns out that instead of using SSL, TP-Link decided to implement their own (flawed) encryption protocol on top of http.
I needed to understand this protocol to progress, so I needed to understand the client, which meant digging through minified Javascript that could have been written 25 years ago.

A miracle saved me to be honest. TP-Link have this public emulator site: https://www.tp-link.com/uk/support/emulator/.
You can select a router model to browse its UI like the real thing.
Maybe this is a leaked internal tool? Or maybe I'm the first person ever to find this useful? I can't imagine why anyone else would.
I suspect TP-Link think they're showing off some *groundbreaking* router UI or something.
In any case, the Javascript on the emulator is **not** minified and even includes developer comments (in some Chinese language no less).

I don't know what I would have done without this. I even managed to identify a third party package used for RSA encryption and found it on npm!

By the way, I tried using node:crypto to no avail.
I think either the padding scheme deviates from PKCS #1 (advertised) in some way or the cipher itself is more lenient on padding (at the expense of security).
In either case, I cannot be bothered to figure it out so I depend on a weird `jsbn` package written by some Stanford student called Tom 15 years ago.
