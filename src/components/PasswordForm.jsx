import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { encryptPassword } from "../crypto";
import { HiPlus, HiGlobeAlt, HiUser, HiKey, HiEye, HiEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function PasswordForm({ cryptoKey, onAdded }) {
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required");
      return;
    }

    setSaving(true);
    try {
      const { encryptedPassword, iv } = await encryptPassword(
        password,
        cryptoKey
      );

      await addDoc(collection(db, "passwords"), {
        site: site.trim(),
        username: username.trim(),
        encryptedPassword,
        iv,
        createdAt: new Date().toISOString(),
      });

      toast.success("Password saved securely!");
      setSite("");
      setUsername("");
      setPassword("");
      onAdded();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <h2 className="form-title">
        <HiPlus /> Add New Password
      </h2>

      <div className="form-grid">
        <div className="input-group">
          <HiGlobeAlt className="input-icon" />
          <input
            type="text"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="Website (optional)"
            className="form-input"
          />
        </div>

        <div className="input-group">
          <HiUser className="input-icon" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username or Email"
            className="form-input"
          />
        </div>

        <div className="input-group">
          <HiKey className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="form-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="icon-btn password-toggle-btn"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <HiEyeSlash /> : <HiEye />}
          </button>
        </div>
      </div>

      <button type="submit" className="save-btn" disabled={saving}>
        {saving ? <span className="spinner" /> : <><HiPlus /> Save Password</>}
      </button>
    </form>
  );
}
