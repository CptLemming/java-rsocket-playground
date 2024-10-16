import './style.css'
import {
  RSocket,
  RSocketConnector
} from "rsocket-core";
import { WebsocketClientTransport } from "rsocket-websocket-client";
import { Buffer } from 'buffer'
import { encodeAndAddWellKnownMetadata, encodeRoute, WellKnownMimeType } from 'rsocket-composite-metadata';
// @ts-ignore
globalThis.Buffer = Buffer

function makeConnector() {
  return new RSocketConnector({
    setup: {
      // dataMimeType: "application/json",
      metadataMimeType: WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
    },
    transport: new WebsocketClientTransport({
      url: "ws://localhost:7000/rsocket",
      wsCreator: (url) => new WebSocket(url) as any,
    }),
  });
}

async function main() {
  console.log('main');
  const connector = makeConnector();
  console.log('connector');

  const rsocket = await connector.connect();
  console.log('rsocket');

  // await new Promise((resolve, reject) => {
  //   console.log('start:counter');
  //   getCounterStream(rsocket, resolve, reject);
  // });
  // console.log('end:counter');

  // await new Promise((resolve, reject) => {
  //   console.log('start:send');
  //   getSendMessage(rsocket, resolve, reject);
  // });
  // console.log('end:send');

  // await new Promise((resolve, reject) => {
  //   console.log('start:warning');
  //   sendWarning(rsocket, resolve, reject);
  // });
  // console.log('end:warning');

  await new Promise((resolve, reject) => {
    console.log('start:channel');
    getChannel(rsocket, resolve, reject);
  });
  console.log('end:channel');
}

function sendWarning(rsocket: RSocket, resolve: (a: any) => void, reject: (a: any) => void) {
  const routeMetadata = encodeRoute("Warning");
  const metadata = encodeAndAddWellKnownMetadata(
    Buffer.alloc(0),
    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
    routeMetadata
  );

  const req = rsocket.requestResponse({
    data: Buffer.from("Important Warning"),
    metadata,
  }, {
    onError: e => {
      reject(e);
    },
    onNext: (payload, isComplete) => {
      console.log('next', payload, isComplete);
      const msg = new TextDecoder().decode(payload.data);
      console.log('msg', msg);
    },
    onComplete: () => {
      console.log('complete');
      resolve(null);
    },
    onExtension: () => {},
  })
}

function getSendMessage(rsocket: RSocket, resolve: (a: any) => void, reject: (a: any) => void) {
  const routeMetadata = encodeRoute("MyDestination");
  const metadata = encodeAndAddWellKnownMetadata(
    Buffer.alloc(0),
    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
    routeMetadata
  );

  const req = rsocket.requestResponse({
    data: Buffer.from("Request-Response test"),
    metadata,
  }, {
    onError: e => {
      reject(e);
    },
    onNext: (payload, isComplete) => {
      console.log('next', payload, isComplete);
      const msg = new TextDecoder().decode(payload.data);
      console.log('msg', msg);
    },
    onComplete: () => {
      console.log('complete');
      resolve(null);
    },
    onExtension: () => {},
  })
}

function getCounterStream(rsocket: RSocket, resolve: (a: any) => void, reject: (a: any) => void) {
  const routeMetadata = encodeRoute("Counter");
  const metadata = encodeAndAddWellKnownMetadata(
    Buffer.alloc(0),
    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
    routeMetadata
  );

  const req = rsocket.requestStream({
    data: null,
    metadata,
  }, 42, {
    onError: e => {
      reject(e);
    },
    onNext: (payload, isComplete) => {
      console.log('next', payload, isComplete);
      const msg = new TextDecoder().decode(payload.data);
      console.log('msg', msg);
    },
    onComplete: () => {
      console.log('complete');
      resolve(null);
    },
    onExtension: () => {},
  })
}

function getChannel(rsocket: RSocket, resolve: (a: any) => void, reject: (a: any) => void) {
  const routeMetadata = encodeRoute("channel");
  const metadata = encodeAndAddWellKnownMetadata(
    Buffer.alloc(0),
    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
    routeMetadata
  );

  let iter = 0;
  const items = ["a", "b", "c", "d", "e"];

  const req = rsocket.requestChannel({
    data: Buffer.from(items[0]),
    metadata,
  }, 2, false, {
    request: (requestN) => {
      console.log('channel:request', requestN);
      console.log('next', iter, items[iter]);

      for (let i = 0; i < requestN; i++) {
        iter += 1;

        if (iter >= items.length) {
          break;
        }

        console.log('req', items[iter]);
        req.onNext({
          data: Buffer.from(items[iter]),
          metadata,
        }, false);
      }
    },
    cancel: () => {
      console.log('channel:cancel');
    },
    onError: e => {
      reject(e);
    },
    onNext: (payload, isComplete) => {
      console.log('incoming', payload, isComplete);
      const msg = new TextDecoder().decode(payload.data);
      console.log('msg', msg);

      req.request(1);
    },
    onComplete: () => {
      console.log('complete');
      resolve(null);
    },
    onExtension: () => {},
  });

  setTimeout(() => {
    console.log('send:delay')
    req.onNext({
      data: Buffer.from("out"),
      metadata,
    }, false);
  }, 1000);
}

main()
  .then(() => console.log('done'))
  .catch(error => {
    console.error(error);
  }).finally(() => {
    console.log('closed');
  })
