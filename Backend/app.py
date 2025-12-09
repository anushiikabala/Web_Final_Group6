from flask import Flask
from flask_cors import CORS

from routes.upload import upload_bp
from routes.auth import auth
from routes.profile import profile_bp
from routes.chat import chat_bp
from routes.admin import admin_bp
from routes.admin_dashboard import admin_dashboard_bp



from routes.admin_reports import admin_reports_bp
from dotenv import load_dotenv
load_dotenv()   # <-- LOAD THE .env FILE


app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}},methods=["GET", "POST", "PUT", "DELETE"])


app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(profile_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(admin_bp, url_prefix="/admin")

app.register_blueprint(admin_reports_bp,url_prefix="/admin")
app.register_blueprint(admin_dashboard_bp,url_prefix="/admin")

if __name__ == "__main__":
    app.run(debug=True)
