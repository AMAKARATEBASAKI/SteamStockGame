import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# フロント用に CORS 許可（仮提出なので全許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STEAM_API = (
    "https://api.steampowered.com/"
    "ISteamUserStats/GetNumberOfCurrentPlayers/v1/"
)

@app.get("/playercount/{appid}")
async def get_player_count(appid: int):
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(STEAM_API, params={"appid": appid})
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail="Steam API error")
        data = r.json()
        return {
            "appid": appid,
            "player_count": data["response"]["player_count"]
        }
