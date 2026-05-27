FROM node:26-alpine3.22 as builder

WORKDIR /usr/src/app

COPY . .
ENV CI=1
RUN npm ci
RUN npm run build

FROM denoland/deno:alpine-2.8.1 AS runtime

WORKDIR /usr/app

RUN deno install --allow-net --allow-read --allow-sys --global jsr:@std/http/file-server
COPY --from=builder /usr/src/app/_site ./_site

EXPOSE 8000
CMD ["file-server", "./_site", "--port", "8000"]
