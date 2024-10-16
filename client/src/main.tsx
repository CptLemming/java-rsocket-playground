import { createRoot } from "react-dom/client";
import { Buffer } from 'buffer'

import App from "./App.tsx";
import './style.css'

// rsocket-core requires us to monkey patch this into browser environments
globalThis.Buffer = Buffer

createRoot(document.getElementById("root")!).render(<App />);
