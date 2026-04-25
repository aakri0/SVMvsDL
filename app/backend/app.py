# app/backend/app.py

import os
from datetime import datetime, timezone

from flask import Flask
from flask_cors import CORS

from app.backend.routes.predict import predict_route


def _parse_origins(raw: str | None) -> list[str] | str:
    """Return a list of allowed origins, or the literal '*' for explicit opt-in."""
    if not raw:
        return ["http://localhost:8080", "http://127.0.0.1:8080"]
    if raw.strip() == "*":
        return "*"
    return [o.strip() for o in raw.split(",") if o.strip()]


def create_app() -> Flask:
    app = Flask(__name__)

    cors_origins = _parse_origins(os.environ.get("CORS_ORIGINS"))
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    app.register_blueprint(predict_route, url_prefix="/api")

    @app.route("/health")
    def health():
        return {"status": "ok"}, 200

    @app.route("/test-firestore")
    def test_firestore():
        # Smoke-test endpoint; disabled in production by default.
        if os.environ.get("ENABLE_FIRESTORE_TEST") != "1":
            return {"error": "disabled"}, 404
        from app.backend.firebase_client import get_db
        get_db().collection("predictions").document("connection_test").set({
            "user_id": "test_user",
            "activity": "Test Activity",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sensor_data": {"x": 0.0, "y": 0.0, "z": 0.0},
        })
        return {"status": "ok"}, 200

    return app


app = create_app()


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG") == "1"
    port = int(os.environ.get("PORT", "5001"))
    host = os.environ.get("HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=debug)
