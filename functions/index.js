const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const { defineString } = require("firebase-functions/params");
const { error: logError } = require("firebase-functions/logger");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

const bootstrapAdminEmail = defineString("ADMIN_BOOTSTRAP_EMAIL");
const allowedRoles = new Set(["pending", "customer", "driver"]);

exports.bootstrapFirstAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in before setting up the administrator account.");
  }

  const email = request.auth.token.email?.toLowerCase();
  if (!email || email !== bootstrapAdminEmail.value().trim().toLowerCase()) {
    throw new HttpsError("permission-denied", "This account is not authorized for first-admin setup.");
  }

  const uid = request.auth.uid;
  const auth = getAuth();
  const user = await auth.getUser(uid);
  if (!user.emailVerified || user.email?.toLowerCase() !== bootstrapAdminEmail.value().trim().toLowerCase()) {
    throw new HttpsError("failed-precondition", "The account must use and verify the configured administrator email.");
  }

  const db = getFirestore();
  const profileRef = db.collection("profiles").doc(uid);
  const bootstrapRef = db.collection("system").doc("roleBootstrap");
  const transactionResult = await db.runTransaction(async (transaction) => {
    const [bootstrapSnapshot, profileSnapshot] = await Promise.all([
      transaction.get(bootstrapRef),
      transaction.get(profileRef),
    ]);

    if (!profileSnapshot.exists) {
      throw new HttpsError("failed-precondition", "Create your account profile before administrator setup.");
    }

    if (bootstrapSnapshot.exists && bootstrapSnapshot.data().adminUid !== uid) {
      throw new HttpsError("failed-precondition", "The first administrator has already been set up.");
    }

    transaction.set(bootstrapRef, {
      adminUid: uid,
      completedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(profileRef, {
      role: "admin",
      updated_at: FieldValue.serverTimestamp(),
    });
    return profileSnapshot.data();
  });

  const currentUser = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...currentUser.customClaims, role: "admin" });
  return { role: "admin", email: transactionResult.email };
});

exports.assignProfileRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in before assigning account roles.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only administrators can assign account roles.");
  }

  const targetUid = request.data?.targetUid;
  const role = request.data?.role;
  if (typeof targetUid !== "string" || !targetUid || !allowedRoles.has(role)) {
    throw new HttpsError("invalid-argument", "Provide an account and a valid customer, driver, or pending role.");
  }

  const auth = getAuth();
  const targetUser = await auth.getUser(targetUid);
  if (role !== "pending" && !targetUser.emailVerified) {
    throw new HttpsError("failed-precondition", "The account must verify its email before it can be assigned.");
  }

  const db = getFirestore();
  const profileRef = db.collection("profiles").doc(targetUid);
  const profileSnapshot = await profileRef.get();
  if (!profileSnapshot.exists || profileSnapshot.data().role === "admin") {
    throw new HttpsError("failed-precondition", "This account does not exist or cannot be reassigned.");
  }

  const previousClaims = targetUser.customClaims ?? {};
  const nextClaims = { ...previousClaims, role };
  await auth.setCustomUserClaims(targetUid, nextClaims);

  try {
    await profileRef.update({
      role,
      email_verified: targetUser.emailVerified,
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logError("Failed to persist profile role update; restoring claims.", error);
    await auth.setCustomUserClaims(targetUid, previousClaims);
    throw new HttpsError("internal", "The role change could not be saved. Please try again.");
  }

  return { uid: targetUid, role };
});
