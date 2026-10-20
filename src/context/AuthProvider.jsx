import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const signOut = useCallback(async () => {
    if (!auth) return { error: new Error("Firebase is not configured.") };
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  useEffect(() => {
    if (!auth) return undefined;

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      setAuthError("");
      setProfile(null);
      setProfileError("");
      setProfileLoading(Boolean(nextUser));
    }, (error) => {
      console.error("Failed to restore Firebase session", error);
      setAuthError("We couldn't restore your session. Please sign in again.");
      setLoading(false);
      setProfileLoading(false);
    });
  }, []);

  const userId = user?.uid;

  useEffect(() => {
    if (!userId || !db) return undefined;

    return onSnapshot(doc(db, "profiles", userId), (snapshot) => {
      if (!snapshot.exists()) {
        setProfile(null);
        setProfileError("We couldn't find your account profile. Please contact support.");
      } else {
        setProfile({ id: snapshot.id, ...snapshot.data() });
        setProfileError("");
      }
      setProfileLoading(false);
    }, (error) => {
      console.error("Failed to load Firebase profile", error);
      setProfileError("We couldn't load your account role. Please refresh or contact support.");
      setProfileLoading(false);
    });
  }, [userId]);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    profile,
    role: profile?.role ?? null,
    profileLoading,
    profileError,
    isConfigured: isFirebaseConfigured,
    signOut,
  }), [user, loading, authError, profile, profileLoading, profileError, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
