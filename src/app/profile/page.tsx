"use client";

import { useState } from "react";
import { Camera, Check, Edit3, HeartHandshake, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { useCommunity } from "@/components/CommunityProvider";

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const { myEvents, joins, isAccountDataLoading, accountDataError, refreshAccountData } = useCommunity();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [error, setError] = useState("");

  const hostedCount = myEvents.length;
  const joinedCount = joins.filter((join) => join.userId === user?.id).length;

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Your name can’t be empty.");
      return;
    }
    if (photoUrl.trim()) {
      try {
        const url = new URL(photoUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
      } catch {
        setError("Enter a valid image URL, or leave this blank.");
        return;
      }
    }
    try {
      await updateProfile({ name: name.trim(), photoUrl: photoUrl.trim() || undefined });
      setError("");
      setEditing(false);
      toast.success("Your profile looks lovely.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to update your profile.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="cc-profile-layout">
      <aside className="cc-profile-hero">
        <div className="cc-profile-photo-wrap">
          {user?.photoUrl ? (
            <img className="cc-profile-photo" src={user.photoUrl} alt={user.name} />
          ) : (
            <span className="cc-profile-photo" style={{ display: "grid", placeItems: "center", background: "var(--lime-soft)", color: "var(--forest)", fontSize: 33, fontWeight: 800 }}>{user?.name?.charAt(0)}</span>
          )}
          <span style={{ position: "absolute", right: 0, bottom: 1, display: "grid", width: 29, height: 29, placeItems: "center", border: "3px solid var(--surface)", borderRadius: "50%", background: "var(--lime)", color: "#17231c" }}><Camera size={13} /></span>
        </div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <span className="cc-profile-badge"><HeartHandshake size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} /> Community member</span>
        <div className="cc-profile-stats">
          <div><strong>{isAccountDataLoading ? "…" : accountDataError ? "—" : joinedCount}</strong><span>Events joined</span></div>
          <div><strong>{isAccountDataLoading ? "…" : accountDataError ? "—" : hostedCount}</strong><span>Events hosted</span></div>
        </div>
        {accountDataError && <div style={{ marginTop: 14 }}><p className="cc-form-error" role="alert">{accountDataError}</p><button type="button" className="cc-button-secondary cc-button-small" onClick={() => void refreshAccountData()}>Retry account data</button></div>}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 16, color: "var(--muted)", fontSize: 10 }}><MapPin size={12} /> Making a difference nearby</span>
      </aside>

      <section className="cc-profile-form">
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 14 }}>
          <div>
            <h2>Your details</h2>
            <p>Keep your community profile up to date.</p>
          </div>
          {!editing && (
            <button type="button" className="cc-button-secondary cc-button-small" onClick={() => { setName(user?.name || ""); setPhotoUrl(user?.photoUrl || ""); setEditing(true); }}>
              <Edit3 size={14} /> Edit profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="cc-form-fields" style={{ gridTemplateColumns: "1fr" }}>
            <div className="cc-field"><label htmlFor="profile-name">Full name</label><input id="profile-name" autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} /></div>
            <div className="cc-field"><label htmlFor="profile-email">Email address</label><input id="profile-email" value={user?.email || ""} readOnly /></div>
            <div className="cc-field"><label htmlFor="profile-photo">Profile photo URL</label><input id="profile-photo" type="url" value={photoUrl} onChange={(event) => { setPhotoUrl(event.target.value); setError(""); }} placeholder="https://..." /></div>
            {error && <span className="cc-form-error">{error}</span>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 3 }}>
              <button type="submit" className="cc-button cc-button-small"><Check size={14} /> Save changes</button>
              <button type="button" className="cc-button-secondary cc-button-small" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
            </div>
          </form>
        ) : (
          <dl style={{ display: "grid", gap: 17, margin: "25px 0 0" }}>
            <div><dt style={{ color: "var(--subtle)", fontSize: 10, fontWeight: 700 }}>FULL NAME</dt><dd style={{ margin: "5px 0 0", fontSize: 13 }}>{user?.name}</dd></div>
            <div><dt style={{ color: "var(--subtle)", fontSize: 10, fontWeight: 700 }}>EMAIL ADDRESS</dt><dd style={{ margin: "5px 0 0", fontSize: 13 }}>{user?.email}</dd></div>
            <div><dt style={{ color: "var(--subtle)", fontSize: 10, fontWeight: 700 }}>MEMBER SINCE</dt><dd style={{ margin: "5px 0 0", fontSize: 13 }}>A community member</dd></div>
          </dl>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <main className="cc-page">
        <div className="cc-container">
          <header style={{ marginBottom: 28 }}>
            <span className="cc-eyebrow">A little about you</span>
            <h1 className="cc-heading">Your community<br />profile.</h1>
          </header>
          <ProfileContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}
