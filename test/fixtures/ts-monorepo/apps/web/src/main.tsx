import { createClient } from "@acme/db";
import { Button, theme } from "@acme/ui";
import { createRoot } from "react-dom/client";

const db = createClient("postgres://localhost");

export function App() {
  return <Button label={theme.primary} onClick={() => db.close()} />;
}

createRoot(document.body).render(<App />);
