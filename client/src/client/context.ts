import { createContext, useContext } from "react";
import { RSocket } from "rsocket-core";

const rSocketContext = createContext<RSocket | null>(null);

export const Provider = rSocketContext.Provider;

export const useClient = () => {
  const context = useContext(rSocketContext);

  return context!;
};
