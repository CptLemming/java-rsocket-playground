# Server

## Generate proto messages

```sh
./gradlew clean generateProto
```

```sh
cd client && yarn pbjs -t static-module -w es6 -o ./src/generated/compiled.js ../app/src/main/proto/api.proto
cd client && yarn pbts -o ./src/generated/compiled.d.ts ./src/generated/compiled.js
```
