FROM node:20 as builder

WORKDIR /usr/src/app

COPY . .
ENV CI=1
RUN npm ci
RUN npm run build

FROM karlsson/deno-file-server
COPY --from=builder /usr/src/app/_site /usr/app/src
EXPOSE 8000
