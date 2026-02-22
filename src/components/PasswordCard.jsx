import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { decryptPassword } from "../crypto";
import {
  HiEye,
  HiEyeSlash,
  HiClipboardDocument,
  HiPencilSquare,
  HiTrash,
  HiGlobeAlt,
  HiUser,
} from "react-icons/hi2";
import toast from "react-hot-toast";

export default function PasswordCard({ entry, cryptoKey, onDelete, onEdit }) {
  const [visible, setVisible] = useState(false);
  const [decrypted, setDecrypted] = useState("");
  const [deleting, setDeleting] = useState(false);

  const toggleVisibility = async () => {
    if (visible) {
      setVisible(false);
      setDecrypted("");
      return;
    }
    try {
      const plain = await decryptPassword(
        entry.encryptedPassword,
        entry.iv,
        cryptoKey
      );
      setDecrypted(plain);
      setVisible(true);
    } catch {
      toast.error("Failed to decrypt password");
    }
  };

  const copyPassword = async () => {
    try {
      const plain = visible
        ? decrypted
        : await decryptPassword(entry.encryptedPassword, entry.iv, cryptoKey);
      await navigator.clipboard.writeText(plain);
      toast.success("Password copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete credentials for ${entry.site}?`)) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "passwords", entry.id));
      toast.success("Deleted successfully");
      onDelete();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`password-card ${deleting ? "deleting" : ""}`}>
      <div className="card-header">
        <div className="card-site">
          <HiGlobeAlt className="card-icon" />
          <span>{entry.site}</span>
        </div>
        <div className="card-actions">
          <button
            onClick={() => onEdit(entry)}
            className="action-btn edit"
            title="Edit"
          >
            <HiPencilSquare />
          </button>
          <button
            onClick={handleDelete}
            className="action-btn delete"
            title="Delete"
            disabled={deleting}
          >
            <HiTrash />
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="card-field">
          <HiUser className="field-icon" />
          <span className="field-value">{entry.username}</span>
        </div>

        <div className="card-field">
          <div className="password-row">
            <span className="field-value mono">
              {visible ? decrypted : "••••••••••••"}
            </span>
            <div className="password-actions">
              <button
                onClick={toggleVisibility}
                className="icon-btn"
                title={visible ? "Hide" : "Show"}
              >
                {visible ? <HiEyeSlash /> : <HiEye />}
              </button>
              <button onClick={copyPassword} className="icon-btn" title="Copy">
                <HiClipboardDocument />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
