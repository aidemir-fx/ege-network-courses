from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated
from urllib.parse import urlsplit, urlunsplit

import m3u8
from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi import FastAPI, Path as ApiPath, Query, Request
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import AnyHttpUrl, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    aliceege_id_token_url: AnyHttpUrl
    aliceege_id_client_id: str
    aliceege_id_client_secret: SecretStr
    aliceege_api_url: AnyHttpUrl


settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with AsyncOAuth2Client(
        client_id=settings.aliceege_id_client_id,
        client_secret=settings.aliceege_id_client_secret.get_secret_value(),
        token_endpoint=str(settings.aliceege_id_token_url),
        token_endpoint_auth_method="client_secret_basic",
        grant_type="client_credentials",
        base_url=f"{str(settings.aliceege_api_url).rstrip('/')}/",
        timeout=30,
        leeway=30,
    ) as admin_api:
        await admin_api.fetch_token(grant_type="client_credentials")
        app.state.admin_api = admin_api
        yield


app = FastAPI(title="AliceEge partner player example", lifespan=lifespan)


@app.get("/health", include_in_schema=False)
async def health():
    return Response(status_code=204)


@app.get("/api/partner/courses")
async def list_courses(request: Request):
    response = await admin_api(request).get("api/external/courses")
    return passthrough(response)


@app.get("/api/partner/courses/{course_id}/modules/{module_id}/materials")
async def get_module_materials(
    request: Request,
    course_id: Annotated[int, ApiPath(ge=1)],
    module_id: Annotated[int, ApiPath(ge=1)],
):
    response = await admin_api(request).get(
        f"api/external/courses/{course_id}/modules/{module_id}/materials"
    )
    if response.status_code != 200:
        return passthrough(response)

    materials = response.json()
    materials["videos"] = [local_playlist_uri(uri) for uri in materials["videos"]]
    return JSONResponse(materials, headers={"Cache-Control": "no-store"})


@app.get("/api/player/videos/{video_id}/playback")
async def get_video_playlist(
    request: Request,
    video_id: Annotated[int, ApiPath(ge=1)],
    path: Annotated[str, Query(pattern=r"^[A-Za-z0-9._/-]+\.m3u8$")] = "master.m3u8",
):
    response = await admin_api(request).get(
        f"api/external/videos/{video_id}/playback",
        params={"path": path},
    )
    if response.status_code != 200:
        return passthrough(response)

    manifest = m3u8.loads(response.text)
    rewrite_nested_playlists(manifest)
    return Response(
        content=manifest.dumps(),
        media_type="application/vnd.apple.mpegurl",
        headers={"Cache-Control": "no-store"},
    )


def admin_api(request: Request) -> AsyncOAuth2Client:
    return request.app.state.admin_api


def passthrough(response):
    headers = {}
    for name in ("content-type", "cache-control"):
        value = response.headers.get(name)
        if value:
            headers[name] = value

    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=headers,
    )


def rewrite_nested_playlists(manifest):
    for playlist in manifest.playlists:
        playlist.uri = local_playlist_uri(playlist.uri)

    for playlist in manifest.iframe_playlists:
        playlist.uri = local_playlist_uri(playlist.uri)

    for media in manifest.media:
        if media.uri:
            media.uri = local_playlist_uri(media.uri)


def local_playlist_uri(uri: str):
    parsed = urlsplit(uri)
    path = parsed.path.replace(
        "/api/external/videos/",
        "/api/player/videos/",
        1,
    )
    return urlunsplit(("", "", path, parsed.query, parsed.fragment))


app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent.parent / "dist", html=True),
    name="player",
)
