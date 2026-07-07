# BharatMART - Firebase Setup Guide

## ✅ Phase 1 Complete - What's Wired Up

- **Auth**: Google Sign-In, Phone OTP, Email/Password (via Firebase Auth)
- **Firestore**: Products (16), Categories (3), Users, Carts, Orders, Notifications — all real-time via `onSnapshot`
- **Storage**: Helper functions ready in `/app/lib/storage.ts`
- **Buyer Dashboard**: Live orders, cart, spend total, sign-out
- **MongoDB**: Kept as fallback (existing API routes untouched)

---

## 🔐 Deploy Firestore Security Rules

Go to **Firebase Console → Firestore Database → Rules tab** → paste this → click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function myUid() { return request.auth.uid; }
    function getRole() {
      return get(/databases/$(database)/documents/users/$(myUid())).data.role;
    }
    function isAdmin() {
      return isSignedIn() && (getRole() == 'admin' || getRole() == 'superadmin');
    }
    function isSeller() {
      return isSignedIn() && (getRole() == 'seller' || isAdmin());
    }

    // Users - own profile + admins
    match /users/{uid} {
      allow read: if isSignedIn() && (myUid() == uid || isAdmin());
      allow create: if isSignedIn() && myUid() == uid;
      allow update: if isSignedIn() && (myUid() == uid || isAdmin());
      allow delete: if isAdmin();
    }

    // Products - public read (approved only); sellers/admins write
    match /products/{pid} {
      allow read: if resource.data.status == 'approved' || isSeller();
      allow create: if isSeller();
      allow update, delete: if isSeller() && (resource.data.supplierId == myUid() || isAdmin());
    }

    // Categories - public read; admins write
    match /categories/{cid} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Carts - owner only
    match /carts/{uid} {
      allow read, write: if isSignedIn() && myUid() == uid;
    }

    // Orders - buyer + sellers involved + admins
    match /orders/{oid} {
      allow read: if isSignedIn() && (resource.data.userId == myUid() || isAdmin() || isSeller());
      allow create: if isSignedIn() && request.resource.data.userId == myUid();
      allow update: if isSignedIn() && (isAdmin() || isSeller());
    }

    // Notifications
    match /notifications/{nid} {
      allow read: if isSignedIn() && resource.data.userId == myUid();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.userId == myUid();
    }

    // RFQ, Reviews
    match /rfqs/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (resource.data.userId == myUid() || isAdmin());
    }
    match /reviews/{id} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.userId == myUid();
      allow update, delete: if isSignedIn() && (resource.data.userId == myUid() || isAdmin());
    }
  }
}
```

---

## 📦 Deploy Storage Security Rules

Go to **Firebase Console → Storage → Rules tab** → paste this → click **Publish**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /categories/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 3 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /sellers/{sellerId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == sellerId
        && request.resource.size < 5 * 1024 * 1024;
    }

    match /users/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🧪 Testing checklist

1. **Homepage**: Products load from Firestore (real-time). Category counts live-computed.
2. **Sign In modal** offers Google / Phone OTP / Email — all real Firebase Auth.
3. **After signup**: User profile auto-saved to `users/{uid}` in Firestore with `role: 'buyer'`.
4. **Add to Cart** (while logged in): Writes to `carts/{uid}` in Firestore — updates instantly across tabs (real-time).
5. **Checkout**: Creates `orders/{orderId}` doc + `notifications` doc.
6. **Order tracking** page: Live-updates via `onSnapshot`.
7. **Dashboard** (Account button in mobile bottom nav or navigate to `?view=dashboard`): Live orders + spend total + Sign Out.

---

## 🔑 Admin SDK Setup (for Phase 2)

When ready to build seller/admin dashboards with role-based auth, provide:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bhartmart-17158.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
```

Get them from Firebase Console → Project Settings → Service Accounts → **Generate new private key**.

---

## 📁 Files Created

```
/app/lib/firebase.ts             ← Client SDK init
/app/lib/firebaseAdmin.ts        ← Server SDK (admin) 
/app/lib/firestore.ts            ← All Firestore hooks (real-time)
/app/lib/storage.ts              ← Storage upload helpers
/app/lib/types.ts                ← Domain types
/app/lib/seedData.ts             ← 16 products + 3 categories
/app/lib/security-rules.ts       ← Rules docs
/app/contexts/AuthContext.tsx    ← useAuth() hook
/app/components/FirebaseLoginModal.tsx
/app/components/BuyerDashboard.tsx
/app/app/api/firebase-seed/route.ts    (idempotent)
/app/tsconfig.json + next-env.d.ts
```

---

## 🚀 Next Session Roadmap

1. **Seller Dashboard** — add/edit/delete products with Firebase Storage image uploads
2. **Admin Panel** — approve products, manage users/sellers/categories, analytics
3. **Role management** — set custom claims via Admin SDK for seller/admin/superadmin roles
4. **Full TS conversion** of `page.js` → `page.tsx` with strict typing
5. **Real-time chat** (buyer ↔ supplier), **RFQ system**, **Reviews**
6. **Payment integration** — Razorpay / PhonePe / Cashfree
