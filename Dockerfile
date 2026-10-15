FROM node:26-alpine3.22 as builder

WORKDIR /usr/src/app

COPY . .
ENV CI=1
RUN npm ci
RUN npm run build

FROM busybox:stable-musl AS runtime

WORKDIR /www
COPY --from=builder /usr/src/app/_site .
COPY httpd.conf /etc/httpd.conf

USER 1000:1000
EXPOSE 8000
CMD ["httpd", "-f", "-p", "8000", "-h", "/www"]
