import os
import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, Request, Form, Depends, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db, SessionLocal

# Создаём в PostgreSQL все таблицы из models.py (если их ещё нет)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# <--- 2. Подключаем сессии к приложению
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# Функция, которая автоматически добавляет current_user во ВСЕ шаблоны сайта
def inject_current_user(request: Request) -> dict:
    user_id = request.session.get("user_id")
    if not user_id:
        return {"current_user": None}
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        return {"current_user": user}
    finally:
        db.close()

templates.context_processors.append(inject_current_user)


# Функция, которая по cookie определяет, кто сейчас сидит на сайте
def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User | None:
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()


# ===============
# ГЛАВНАЯ СТРАНИЦА
# ===============

@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/rooms", response_class=HTMLResponse)
async def rooms_page(request: Request):
    return templates.TemplateResponse(request=request, name="rooms/rooms.html")


@app.get("/gastronomy", response_class=HTMLResponse)
async def gastronomy_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/gastronomy.html")


@app.get("/beach-and-pools", response_class=HTMLResponse)
async def beach_page(request: Request):
    return templates.TemplateResponse(request=request, name="beach_and_pools/beach_and_pools.html")


@app.get("/spa", response_class=HTMLResponse)
async def spa_page(request: Request):
    return templates.TemplateResponse(request=request, name="spa/spa.html")


@app.get("/kids", response_class=HTMLResponse)
async def kids_page(request: Request):
    return templates.TemplateResponse(request=request, name="kids/kids.html")


@app.get("/activities", response_class=HTMLResponse)
async def activities_page(request: Request):
    return templates.TemplateResponse(request=request, name="activities/activities.html")


@app.get("/reviews", response_class=HTMLResponse)
async def reviews_page(request: Request):
    return templates.TemplateResponse(request=request, name="reviews.html")


@app.get("/booking", response_class=HTMLResponse)
async def booking_page(request: Request):
    return templates.TemplateResponse(request=request, name="booking.html")


# ===============
# НОМЕРА
# ===============

@app.get("/rooms/eco-room", response_class=HTMLResponse)
async def eco_room_page(request: Request):
    return templates.TemplateResponse(request=request, name="rooms/eco_room.html")


@app.get("/rooms/comfort-room", response_class=HTMLResponse)
async def comfort_room_page(request: Request):
    return templates.TemplateResponse(request=request, name="rooms/comfort_room.html")


@app.get("/rooms/family-room", response_class=HTMLResponse)
async def family_room_page(request: Request):
    return templates.TemplateResponse(request=request, name="rooms/family_room.html")


@app.get("/rooms/garden-chalet", response_class=HTMLResponse)
async def garden_chalet_page(request: Request):
    return templates.TemplateResponse(request=request, name="rooms/garden_chalet.html")


# ===============
# ГАСТРОНОМИЯ
# ===============

@app.get("/gastronomy/vista-main-restaurant", response_class=HTMLResponse)
async def vista_main_restaurant_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/vista_main_restaurant.html")


@app.get("/gastronomy/italian-restaurant-la-brezza", response_class=HTMLResponse)
async def italian_restaurant_la_brezza_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/italian_restaurant_la_brezza.html")


@app.get("/gastronomy/turquesa-fish", response_class=HTMLResponse)
async def turquesa_fish_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/turquesa_fish.html")


@app.get("/gastronomy/terraza-far-eastern", response_class=HTMLResponse)
async def terraza_far_eastern_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/terraza_far_eastern.html")


@app.get("/gastronomy/anatolia", response_class=HTMLResponse)
async def anatolia_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/anatolia.html")


@app.get("/gastronomy/pescado-mexican", response_class=HTMLResponse)
async def pescado_mexican_page(request: Request):
    return templates.TemplateResponse(request=request, name="gastronomy/pescado_mexican.html")


# ===============
# ЛИЧНЫЙ КАБИНЕТ
# ===============

# ВХОД
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")


@app.post("/login", response_class=HTMLResponse)
async def login_submit(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Ищем пользователя в базе по почте
    user = db.query(models.User).filter(models.User.email == email).first()

    # Если пользователь не найден или пароль не подходит — показываем ошибку
    if not user:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={"error": "Неверная электронная почта"}
        )
    elif user.password != password:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={"error": "Неверный пароль"}
        )

    # Запоминаем ID пользователя в cookie сессии
    request.session["user_id"] = user.id

    return RedirectResponse(url="/profile", status_code=303)


# РЕГИСТРАЦИЯ
@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse(request=request, name="register.html")


@app.post("/register", response_class=HTMLResponse)
async def register_submit(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    password_confirm: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Проверяем совпадение паролей
    if password != password_confirm:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={"error": "Пароли не совпадают"}
        )

    # 2. Проверяем, не занята ли почта
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={"error": "Пользователь с такой почтой уже зарегистрирован"}
        )

    # 3. Создаём нового пользователя и сохраняем в БД
    new_user = models.User(
        name=name,
        email=email,
        password=password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Запоминаем ID пользователя в cookie сессии (сразу авторизуем)
    request.session["user_id"] = new_user.id

    return RedirectResponse(url="/profile", status_code=303)


# ПРОФИЛЬ
@app.get("/profile", response_class=HTMLResponse)
async def profile_page(
    request: Request,
    current_user: models.User | None = Depends(get_current_user)
):
    if not current_user:
        return RedirectResponse(url="/login", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="profile.html",
        context={"current_user": current_user}
    )


# ВЫХОД ИЗ АККАУНТА
@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)


# Папка для сохранения аватаров пользователей
AVATARS_DIR = Path("static/images/avatars")
AVATARS_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/profile/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: models.User | None = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return RedirectResponse(url="/login", status_code=303)

    # Проверяем, что загрузили именно изображение
    if not avatar.content_type or not avatar.content_type.startswith("image/"):
        return RedirectResponse(url="/profile", status_code=303)

    # Удаляем старый файл аватара с диска, если он был
    if current_user.avatar:
        old_file = Path(current_user.avatar.lstrip("/"))
        if old_file.exists():
            old_file.unlink()

    # Генерируем уникальное имя файла (например: user_1_e4b19a2c.jpg)
    ext = Path(avatar.filename).suffix or ".jpg"
    filename = f"user_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = AVATARS_DIR / filename

    # Сохраняем загруженный файл на диск
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(avatar.file, buffer)

    # Обновляем путь к аватару в PostgreSQL
    user_in_db = db.query(models.User).filter(models.User.id == current_user.id).first()
    user_in_db.avatar = f"/static/images/avatars/{filename}"
    db.commit()

    return RedirectResponse(url="/profile", status_code=303)