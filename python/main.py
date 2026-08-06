from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, MetaData, String, Table, create_engine, func, select


db_dir = Path(__file__).parent / "db"
db_dir.mkdir(exist_ok=True)
engine = create_engine(f"sqlite:///{db_dir / 'development.sqlite3'}")
metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("email", String, nullable=False),
    Column("created_at", DateTime, nullable=False, server_default=func.current_timestamp()),
    Column("updated_at", DateTime, nullable=False, server_default=func.current_timestamp(), onupdate=func.current_timestamp()),
)
messages = Table(
    "messages",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id"), nullable=False, index=True),
    Column("content", String, nullable=False),
    Column("read", Boolean, nullable=False, server_default="0"),
    Column("created_at", DateTime, nullable=False, server_default=func.current_timestamp()),
    Column("updated_at", DateTime, nullable=False, server_default=func.current_timestamp(), onupdate=func.current_timestamp()),
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/admin_api/users")
def list_users():
    with engine.connect() as connection:
        return [dict(row) for row in connection.execute(select(users.c.id, users.c.email)).mappings()]


@app.post("/admin_api/messages")
def create_message(email: str = Form(...), content: str = Form(...)):
    with engine.begin() as connection:
        user_id = connection.scalar(select(users.c.id).where(users.c.email == email).limit(1))
        if user_id is None:
            return JSONResponse({"error": "User not found"}, status_code=404)
        result = connection.execute(messages.insert().values(user_id=user_id, content=content))
        message_id = result.inserted_primary_key[0]
    return {"message": {"id": message_id, "user_id": user_id, "content": content, "read": False}}


@app.post("/customer_api/ping")
def ping(email: str = Form(...)):
    with engine.begin() as connection:
        user_id = connection.scalar(select(users.c.id).where(users.c.email == email).limit(1))
        if user_id is None:
            user_id = connection.execute(users.insert().values(email=email)).inserted_primary_key[0]
        rows = connection.execute(
            select(messages.c.id, messages.c.content).where(
                messages.c.user_id == user_id, messages.c.read.is_(False)
            )
        ).mappings()
        return [dict(row) for row in rows]


@app.post("/customer_api/read")
def mark_read(message_id: int = Form(...)):
    with engine.begin() as connection:
        connection.execute(messages.update().where(messages.c.id == message_id).values(read=True))
    return None
