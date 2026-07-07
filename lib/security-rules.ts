// Firestore & Storage Security Rules for BharatMART
// DEPLOY: Firebase Console → Firestore → Rules tab → paste → Publish
// AND: Firebase Console → Storage → Rules tab → paste storage rules → Publish

// ============ FIRESTORE RULES ============
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     function isSignedIn() { return request.auth != null; }
//     function myUid() { return request.auth.uid; }
//     function getRole() { return get(/databases/$(database)/documents/users/$(myUid())).data.role; }
//     function isAdmin() { return isSignedIn() && (getRole() == 'admin' || getRole() == 'superadmin'); }
//     function isSeller() { return isSignedIn() && (getRole() == 'seller' || isAdmin()); }
//
//     // Users: signed-in users can read/write their own profile; admins can read all
//     match /users/{uid} {
//       allow read: if isSignedIn() && (myUid() == uid || isAdmin());
//       allow create: if isSignedIn() && myUid() == uid;
//       allow update: if isSignedIn() && (myUid() == uid || isAdmin());
//       allow delete: if isAdmin();
//     }
//
//     // Products: public read (approved only); sellers write their own; admins moderate
//     match /products/{pid} {
//       allow read: if resource.data.status == 'approved' || isSeller();
//       allow create: if isSeller();
//       allow update, delete: if isSeller() && (resource.data.supplierId == myUid() || isAdmin());
//     }
//
//     // Categories: public read; only admins write
//     match /categories/{cid} {
//       allow read: if true;
//       allow write: if isAdmin();
//     }
//
//     // Carts: only the owner can read/write their own cart
//     match /carts/{uid} {
//       allow read, write: if isSignedIn() && myUid() == uid;
//     }
//
//     // Orders: buyers see own orders; sellers see orders for their products; admins see all
//     match /orders/{oid} {
//       allow read: if isSignedIn() && (resource.data.userId == myUid() || isAdmin() || isSeller());
//       allow create: if isSignedIn() && request.resource.data.userId == myUid();
//       allow update: if isSignedIn() && (isAdmin() || isSeller());
//     }
//
//     // Notifications: user reads own; server (admin SDK) writes
//     match /notifications/{nid} {
//       allow read: if isSignedIn() && resource.data.userId == myUid();
//       allow create: if isSignedIn(); // simplified for MVP - tighten later
//       allow update, delete: if isSignedIn() && resource.data.userId == myUid();
//     }
//
//     // RFQ, Reviews: public read; signed in create
//     match /rfqs/{id} {
//       allow read: if isSignedIn();
//       allow create: if isSignedIn();
//       allow update, delete: if isSignedIn() && (resource.data.userId == myUid() || isAdmin());
//     }
//     match /reviews/{id} {
//       allow read: if true;
//       allow create: if isSignedIn() && request.resource.data.userId == myUid();
//       allow update, delete: if isSignedIn() && (resource.data.userId == myUid() || isAdmin());
//     }
//   }
// }

// ============ STORAGE RULES ============
// rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {
//     // Product images (max 5MB, images only)
//     match /products/{allPaths=**} {
//       allow read: if true;
//       allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
//     }
//     // Category images
//     match /categories/{allPaths=**} {
//       allow read: if true;
//       allow write: if request.auth != null && request.resource.size < 3 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
//     }
//     // Seller logos and business docs
//     match /sellers/{sellerId}/{allPaths=**} {
//       allow read: if true;
//       allow write: if request.auth != null && request.auth.uid == sellerId && request.resource.size < 5 * 1024 * 1024;
//     }
//     // User profile pictures
//     match /users/{uid}/{allPaths=**} {
//       allow read: if true;
//       allow write: if request.auth != null && request.auth.uid == uid && request.resource.size < 2 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
//     }
//   }
// }
export const dummy = true; // placeholder to make this a valid module
