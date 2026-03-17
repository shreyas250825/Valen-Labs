import os
from functools import lru_cache

import firebase_admin
from firebase_admin import auth, credentials


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing env var: {name}")
    return value


@lru_cache(maxsize=1)
def init_firebase():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    project_id = required_env("FIREBASE_PROJECT_ID")
    client_email = required_env("FIREBASE_CLIENT_EMAIL")
    private_key = required_env("FIREBASE_PRIVATE_KEY").replace("\\n", "\n")

    cred = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": project_id,
            "client_email": client_email,
            "private_key": private_key,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )
    return firebase_admin.initialize_app(cred)


def verify_bearer_token(authorization_header: str) -> dict:
    if not authorization_header:
        raise ValueError("Missing Authorization header")

    if not authorization_header.lower().startswith("bearer "):
        raise ValueError("Authorization must be Bearer <token>")

    token = authorization_header.split(" ", 1)[1].strip()
    init_firebase()
    return auth.verify_id_token(token)

