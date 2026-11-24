from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

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

# вход
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")


@app.post("/login", response_class=HTMLResponse)
async def login_submit(
    request: Request,
    email: str = Form(...),
    password: str = Form(...)
):
    print(f"Попытка входа: {email} | {password}")
    return RedirectResponse(url="/profile", status_code=303)

# регистрация
@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse(request=request, name="register.html")


@app.post("/register", response_class=HTMLResponse)
async def register_submit(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    password_confirm: str = Form(...)
):
    if password != password_confirm:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={"error": "Пароли не совпадают"}
        )
    print(f"Новая регистрация: {name} | {email} | {password}")
    return RedirectResponse(url="/profile", status_code=303)


@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    # Временный тестовый пользователь для проверки вёрстки
    fake_user = {
        "name": "Василий",
        "email": "vasilii@example.com",
        "avatar": None
    }
    return templates.TemplateResponse(
        request=request,
        name="profile.html",
        context={"current_user": fake_user}
    )