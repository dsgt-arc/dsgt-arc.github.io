ARG HUGO_VERSION=0.125.7
FROM debian:bookworm-slim

ARG HUGO_VERSION
ARG TARGETARCH

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git \
    && rm -rf /var/lib/apt/lists/*

RUN case "${TARGETARCH}" in \
        amd64) HUGO_ARCH="64bit" ;; \
        arm64) HUGO_ARCH="ARM64" ;; \
        *) echo "Unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
    && curl -fsSL -o /tmp/hugo.tar.gz "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${HUGO_ARCH}.tar.gz" \
    && tar -xzf /tmp/hugo.tar.gz -C /usr/local/bin hugo \
    && chmod +x /usr/local/bin/hugo \
    && rm /tmp/hugo.tar.gz \
    && hugo version

WORKDIR /src

ENV HUGO_CACHEDIR=/tmp/hugo_cache

COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
