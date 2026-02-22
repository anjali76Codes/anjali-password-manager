import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { encryptPassword, decryptPassword } from "../crypto";
import { HiXMark, HiGlobeAlt, HiUser, HiKey, HiEye, HiEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function EditModal({ entry, cryptoKey, onClose, onUpdated }) {
  const [site, setSite] = useState(entry.site);
  const [username, setUsername] = useState(entry.username);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const decrypt = async () => {
      try {
        const plain = await decryptPassword(
          entry.encryptedPassword,
          entry.iv,
          cryptoKey
        );
        setPassword(plain);
      } catch {
        toast.error("Failed to decrypt for editing");
      }
    };
    decrypt();
  }, [entry, cryptoKey]);

  const handleUpdate = async (e) => {
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

      await updateDoc(doc(db, "passwords", entry.id), {
        site: site.trim(),
        username: username.trim(),
        encryptedPassword,
        iv,
      });

      toast.success("Updated successfully!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Credential</h2>
          <button onClick={onClose} className="close-btn">
            <HiXMark />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="modal-form">
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

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? <span className="spinner" /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
