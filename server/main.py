from fastapi import FastAPI

app = FastAPI(title="Quantum Server", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


# Run with: uvicorn main:app --host 0.0.0.0 --port 3069
