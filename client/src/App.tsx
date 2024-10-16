import React, { useEffect, useRef, useState } from "react";
import { RSocket } from "rsocket-core";

import "./App.css"
import { createClient } from "./client/utils";
import { Provider } from "./client/context";
import EqPage from "./pages/eq";
import { useRouter } from "./utils";

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const clientRef = useRef<RSocket | null>(null);
  const { path, push } = useRouter();

  useEffect(() => {
    (async () => {
      const client = await createClient();

      clientRef.current = client;
      setIsReady(true);
    })();
  }, []);

  if (!isReady) {
    return <div>Connecting...</div>;
  }

  if (!clientRef.current) {
    return <div>Oops</div>;
  }

  return (
    <Provider value={clientRef.current}>
      <main>
        <nav>
          <button onClick={() => push("input")}>Input</button>
          <button onClick={() => push("eq")}>EQ</button>
        </nav>

        <section>
          {path === "" && <div>Select a page</div>}
          {path === "eq" && <EqPage />}
        </section>
      </main>
    </Provider>
  )
};

export default App;
