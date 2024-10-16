import { WellKnownMimeType } from "rsocket-composite-metadata";
import { RSocketConnector } from "rsocket-core";
import { WebsocketClientTransport } from "rsocket-websocket-client";

/**
 * Create rsocket transport over websockets
 */
export const createTransport = () => {
  return new RSocketConnector({
    setup: {
      metadataMimeType: WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
    },
    transport: new WebsocketClientTransport({
      url: "ws://localhost:7000/rsocket",
      wsCreator: (url) => new WebSocket(url) as any,
    }),
  });
}

/**
 * Create an rsocket client
 */
export const createClient = async () => {
  const transport = createTransport();

  const rSocket = await transport.connect();

  return rSocket;
};
