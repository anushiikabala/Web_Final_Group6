from pymongo import MongoClient
import gridfs

client = MongoClient("mongodb://localhost:27017/")
db = client["LabInsight"]

users_col = db["users"]
profiles_col = db["profiles"]
reports = db["reports"]


# ---------- USER FUNCTIONS ----------
def create_user(user):
    return users_col.insert_one(user)

def find_user(email):
    return users_col.find_one({"email": email})


# ---------- PROFILE FUNCTIONS ----------
def create_profile(profile):
    return profiles_col.insert_one(profile)

def find_profile(email):
    return profiles_col.find_one({"email": email})

def update_profile(email, data):
    data.pop("_id", None)  # ✅ REMOVE MongoDB _id before update

    return profiles_col.update_one(
        {"email": email},
        {"$set": data},
        upsert=True
    )

# ---------- PASSWORD UPDATE ----------
def update_password(email, new_password):
    return users_col.update_one(
        {"email": email},
        {"$set": {"password": new_password}}
    )
fs = gridfs.GridFS(db)

def save_pdf(file, filename, email):
    pdf_id = fs.put(file, filename=filename, user=email)
    return str(pdf_id)

def get_user_reports(email):
    return list(db.fs.files.find({"user": email}))

