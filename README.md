# Spring RSocket RPC example

A Spring application with an RSocket endpoint (websocket).

API endpoints are implemented as `*.proto` files. Code generation then creates servers & services
for both Java & JavaScript.

## Links

- [Spring RSockets](https://docs.spring.io/spring-framework/reference/rsocket.html)
- [RSocket "docs"](https://rsocket.io/)
- [Protobuf (v3)](https://protobuf.dev/programming-guides/proto3/)

## Generate proto messages

```sh
./gradlew clean generateProto
```

```sh
cd client && yarn pbjs -t static-module -w es6 -o ./src/generated/eq.js ../app/src/main/proto/eq.proto ../app/src/main/proto/mutation.proto
cd client && yarn pbts -o ./src/generated/eq.d.ts ./src/generated/eq.js
```
