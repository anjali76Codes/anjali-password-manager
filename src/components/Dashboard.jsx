import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import PasswordForm from "./PasswordForm";
import PasswordCard from "./PasswordCard";
import EditModal from "./EditModal";
import {
  HiLockOpen,
  HiShieldCheck,
  HiMagnifyingGlass,
} from "react-icons/hi2";

export default function Dashboard({ cryptoKey, onLock }) {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editEntry, setEditEntry] = useState(null);

  const fetchPasswords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "passwords"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPasswords(data);
    } catch (err) {
      console.error("Failed to fetch passwords:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  const filtered = passwords.filter(
    (p) =>
      p.site.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <HiShieldCheck className="header-logo" />
          <h1>SecureVault</h1>
        </div>
        <button onClick={onLock} className="lock-vault-btn">
          <HiLockOpen />
          Lock Vault
        </button>
      </header>

      <main className="dashboard-main">
        <PasswordForm cryptoKey={cryptoKey} onAdded={fetchPasswords} />

        <div className="passwords-section">
          <div className="section-header">
            <h2>Saved Credentials ({passwords.length})</h2>
            <div className="search-box">
              <HiMagnifyingGlass className="search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by site or username..."
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner large" />
              <p>Decrypting vault...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <HiShieldCheck className="empty-icon" />
              <p>
                {search
                  ? "No matching credentials found"
                  : "No passwords saved yet. Add your first one above!"}
              </p>
            </div>
          ) : (
            <div className="passwords-grid">
              {filtered.map((entry) => (
                <PasswordCard
                  key={entry.id}
                  entry={entry}
                  cryptoKey={cryptoKey}
                  onDelete={fetchPasswords}
                  onEdit={setEditEntry}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {editEntry && (
        <EditModal
          entry={editEntry}
          cryptoKey={cryptoKey}
          onClose={() => setEditEntry(null)}
          onUpdated={fetchPasswords}
        />
      )}
    </div>
  );
}
