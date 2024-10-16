import { RSocket } from "rsocket-core";
import { api } from "../../generated/eq";
import { encodeAndAddWellKnownMetadata, encodeRoute, WellKnownMimeType } from "rsocket-composite-metadata";

/**
 * Fetch list of EQ bands as a stream
 * 
 * This is a reactive stream. We request 1x message at a time
 * and use backpressure of the upstream endpoint.
 */
export async function getEqBands(rsocket: RSocket, onNext: (a: api.protobuf.eq.BandsResponse) => void, onError: (a: any) => void) {
  const client = api.protobuf.eq.EqBands.create((req, data, onCallback) => {
    const routeMetadata = encodeRoute(`api.protobuf.eq.EqBands.${req.name}`);
    const metadata = encodeAndAddWellKnownMetadata(
      Buffer.alloc(0),
      WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
      routeMetadata
    );

    const stream = rsocket.requestStream({
      data: Buffer.from(data),
      metadata,
    }, 1, {
      onError: e => {
        console.error('getEqBands:error', e);
        onCallback(e);
      },
      onNext: (payload, isComplete) => {
        if (isComplete) {
          onCallback(null, null);
        } else {
          onCallback(null, payload.data);
          stream.request(1);
        }
      },
      onComplete: () => {
        console.warn('getEqBands:complete');
        onCallback(null, null);
      },
      onExtension: () => {},
    });
  });

  client.getBands(api.protobuf.eq.BandsRequest.create(), (err, msg) => {
    if (err != null) {
      onError(err);
    } else if (msg != null) {
      onNext(msg);
    }
  });
}

/**
 * Update an EQ band, returning the result
 * 
 * Updating a band will cause the EqBands endpoint to re-send all the bands again
 */
export async function updateEqBand(band: api.protobuf.eq.BandIdent, rsocket: RSocket, resolve: (a: any) => void, reject: (a: any) => void) {
  const client = api.protobuf.eq.EqBands.create((req, data, onDone) => {
    const routeMetadata = encodeRoute(`api.protobuf.eq.EqBands.${req.name}`);
    const metadata = encodeAndAddWellKnownMetadata(
      Buffer.alloc(0),
      WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
      routeMetadata
    );

    rsocket.requestResponse({
      data: Buffer.from(data),
      metadata,
    }, {
      onError: e => {
        console.error(e);
        onDone(e);
        reject(e);
      },
      onNext: (payload, isComplete) => {
        onDone(null, payload.data);

        if (isComplete) {
          resolve(null);
        }
      },
      onComplete: () => {
        onDone(null, null);
        resolve(null);
      },
      onExtension: () => {},
    });
  });

  return await client.updateBand(band);
}
