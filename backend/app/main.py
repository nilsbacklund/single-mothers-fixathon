from fastapi import FastAPI
from app.api.chat import router

app = FastAPI(title="Hulpwijzer API")
app.include_router(router)
