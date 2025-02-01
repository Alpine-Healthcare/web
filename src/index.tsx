import ReactDOM from "react-dom/client";

import buffer from "buffer";
window.Buffer = buffer.Buffer
import "./styles.css";
import Root from "./views/Root";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <Root />
);
