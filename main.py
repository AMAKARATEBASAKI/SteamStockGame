import httpx
from fastapi import HTTPException, status, FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()

# serve frontend from src/
SRC_DIR = Path(__file__).parent / "src"
SRC_DIR.mkdir(exist_ok=True)

# 修正点: 静的は /static にマウント（"/" にマウントすると他のルートがマスクされる）
app.mount("/static", StaticFiles(directory=str(SRC_DIR)), name="static")

# ルートで index.html を明示的に返す
@app.get("/")
async def root():
    return FileResponse(SRC_DIR / "index.html")

async def request():
    async with httpx.AsyncClient() as client:
        response: httpx.Response = await client.get("https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=2246340")
        if response.status_code != httpx.codes.OK:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE)
        return response.json()
    
@app.get('/playercount')
async def bench_httpx():
    return await request()