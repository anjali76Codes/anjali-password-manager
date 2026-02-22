import { useState } from "react";
import { HiLockClosed, HiShieldCheck } from "react-icons/hi2";
import toast from "react-hot-toast";
import { deriveKey, encryptPassword, decryptPassword } from "../crypto";

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter the master password");
      return;
    }

    setLoading(true);
    try {
      const masterPass = import.meta.env.VITE_MASTER_PASSWORD_HASH;
      const key = await deriveKey(password);

      // Verify the master password by encrypting and decrypting a test value
      const testPlain = "vault-unlock-test";
      const { encryptedPassword, iv } = await encryptPassword(testPlain, key);
      const decrypted = await decryptPassword(encryptedPassword, iv, key);

      if (password === masterPass && decrypted === testPlain) {
        toast.success("Vault unlocked successfully!");
        onUnlock(key);
      } else {
        toast.error("Incorrect master password");
      }
    } catch {
      toast.error("Incorrect master password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-container">
        <div className="lock-icon-wrapper">
          <div className="lock-icon-bg">
            <HiLockClosed className="lock-icon" />
          </div>
        </div>

        <h1 className="lock-title">Vault Locked</h1>
        <p className="lock-subtitle">
          Enter your master password to access the vault
        </p>

        <form onSubmit={handleUnlock} className="lock-form">
          <div className="input-group">
            <HiShieldCheck className="input-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Master Password"
              className="lock-input"
              autoFocus
            />
          </div>

          <button type="submit" className="unlock-btn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <HiLockClosed />
                Unlock Vault
              </>
            )}
          </button>
        </form>

        <p className="lock-footer">
          AES-256-GCM Encrypted &bull; Client-Side Only
        </p>
      </div>
    </div>
  );
}
