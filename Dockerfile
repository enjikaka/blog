FROM node:20 as builder

WORKDIR /usr/src/app

COPY . .
ENV CI=1
RUN npm ci
RUN npm run build

FROM joseluisq/static-web-server:2.32-alpine
COPY --from=builder /usr/src/app/_site public
ENV SERVER_PORT=5000
EXPOSE 5000
