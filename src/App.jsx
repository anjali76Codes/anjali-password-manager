import { useState } from "react";
import { Toaster } from "react-hot-toast";
import LockScreen from "./components/LockScreen";
import Dashboard from "./components/Dashboard";
import "./App.css";

export default function App() {
  const [cryptoKey, setCryptoKey] = useState(null);

  const handleUnlock = (key) => {
    setCryptoKey(key);
  };

  const handleLock = () => {
    setCryptoKey(null);
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e1b2e",
            color: "#e2e0f0",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          },
          success: { iconTheme: { primary: "#8b5cf6", secondary: "#1e1b2e" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1e1b2e" } },
        }}
      />
      {cryptoKey ? (
        <Dashboard cryptoKey={cryptoKey} onLock={handleLock} />
      ) : (
        <LockScreen onUnlock={handleUnlock} />
      )}
    </>
  );
}
