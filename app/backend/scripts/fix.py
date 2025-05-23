import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("/Users/aakrisht/Developer/EL/SVMvsDL/app/backend/credentials/*.json")  # Replace with your path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Fetch all documents from predictions
collection_ref = db.collection("predictions")
docs = list(collection_ref.stream())
print(f"🔍 Found {len(docs)} documents to normalize.")

updated_count = 0

for doc in docs:
    doc_data = doc.to_dict()
    updates = {}
    changed = False

    # Fix source field
    if doc_data.get("source") == "simulator":
        updates["source"] = "simulated"
        changed = True

    # Normalize accuracy/confidence
    if "confidence" in doc_data and "accuracy" not in doc_data:
        updates["accuracy"] = doc_data["confidence"]
        updates["confidence"] = firestore.DELETE_FIELD
        changed = True

    elif "confidence" in doc_data and "accuracy" in doc_data:
        updates["confidence"] = firestore.DELETE_FIELD
        changed = True

    # Apply updates
    if changed:
        doc.reference.update(updates)
        updated_count += 1

print(f"✅ Normalized {updated_count} documents in Firestore.")
