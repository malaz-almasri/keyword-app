from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks, Request, Response, Depends
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import base64
import aiohttp
from bs4 import BeautifulSoup
import asyncio
import re
import colorsys
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsAllowInvalidCertificates=True)
db = client[os.environ['DB_NAME']]

# Create directories
UPLOAD_DIR = ROOT_DIR / 'uploads'
GENERATED_DIR = ROOT_DIR / 'generated'
UPLOAD_DIR.mkdir(exist_ok=True)
GENERATED_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== Auth Models ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

# ============== Project Models ==============

class BrandAnalysis(BaseModel):
    brand_voice: str = ""
    color_palette: List[str] = []
    primary_color: str = ""
    secondary_color: str = ""
    accent_color: str = ""
    tone: str = ""
    industry: str = ""

class WebsiteData(BaseModel):
    title: str = ""
    description: str = ""
    services: List[str] = []
    images: List[str] = []
    keywords: List[str] = []
    brand_analysis: Optional[BrandAnalysis] = None

class ScrapeRequest(BaseModel):
    url: str

class ProjectCreate(BaseModel):
    content_type: str
    company_name: str
    company_description: str
    strengths: List[str]
    images: List[str] = []
    design_goal: str
    platform: str
    psychological_strategy_id: str
    scraped_data: Optional[Dict[str, Any]] = None
    brand_colors: Optional[Dict[str, str]] = None
    language: str = "ar"

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: Optional[str] = None
    content_type: str
    company_name: str
    company_description: str
    strengths: List[str]
    images: List[str]
    design_goal: str
    platform: Optional[str] = "post_square"
    psychological_strategy_id: str
    scraped_data: Optional[Dict[str, Any]] = None
    brand_colors: Optional[Dict[str, str]] = None
    language: str
    generated_images: List[str] = []
    generated_videos: List[str] = []
    generated_captions: List[Dict[str, Any]] = []
    status: str
    created_at: str
    updated_at: str

class GenerateContentRequest(BaseModel):
    project_id: str
    variation_count: int = 3
    custom_instructions: Optional[str] = None

class GenerateVideoRequest(BaseModel):
    project_id: str
    duration: int = 8
    video_size: str = "portrait"
    custom_instructions: Optional[str] = None

# ============== Constants ==============

PSYCHOLOGICAL_STRATEGIES = [
    {"id": "hook", "name_ar": "الخطاف", "name_en": "Hook Strategy", "icon": "hook", "description_ar": "عنصر مفاجئ يوقف التصفح", "description_en": "Surprising element that stops scrolling", "visual_instructions": "Use HIGH CONTRAST colors, FISH-EYE angles, include ONE ILLOGICAL element. Text should be BOLD and off-center.", "video_instructions": "Start with unexpected visual. Quick cuts, dynamic movement."},
    {"id": "shock_comparison", "name_ar": "المقارنة الصادمة", "name_en": "Shock Comparison", "icon": "scale", "description_ar": "تقسيم يبرز التباين الحاد", "description_en": "Split screen showing stark contrast", "visual_instructions": "SPLIT SCREEN - left dark/chaotic, right bright/organized. Sharp diagonal dividing line.", "video_instructions": "Wipe transition from problem to solution."},
    {"id": "bold_opinion", "name_ar": "الرأي الجريء", "name_en": "Bold Opinion", "icon": "megaphone", "description_ar": "موقف قوي يثير النقاش", "description_en": "Strong stance that sparks discussion", "visual_instructions": "Extensive NEGATIVE SPACE (60%+). One powerful statement in large typography.", "video_instructions": "Static shot with slowly appearing text."},
    {"id": "whisper_insight", "name_ar": "الهمس", "name_en": "Whisper Insight", "icon": "lightbulb", "description_ar": "جو غامض يوحي بالسرية", "description_en": "Mysterious atmosphere suggesting secrets", "visual_instructions": "DIM LIGHTING with spotlight. MACRO close-ups. Muted colors with one accent.", "video_instructions": "Slow motion, shallow depth of field."},
    {"id": "pain_of_paying", "name_ar": "ألم الدفع", "name_en": "Pain of Paying", "icon": "credit-card", "description_ar": "إظهار القيمة أكبر من السعر", "description_en": "Show value larger than price", "visual_instructions": "VALUE in HUGE typography (200%+), price in small text. Green checkmarks.", "video_instructions": "Items appearing with cha-ching effect."},
    {"id": "loss_aversion", "name_ar": "تجنب الخسارة", "name_en": "Loss Aversion", "icon": "shield-alert", "description_ar": "الخوف من فقدان الفرصة", "description_en": "Fear of missing out", "visual_instructions": "RED gradients. Product FADING effect. Countdown timer. Empty shelf imagery.", "video_instructions": "Product slowly fading. Clock ticking."},
    {"id": "problem_solution", "name_ar": "المشكلة والحل", "name_en": "Problem-Solution", "icon": "puzzle", "description_ar": "من الفوضى إلى الراحة", "description_en": "From chaos to comfort", "visual_instructions": "Two-panel: Panel 1 GRAYSCALE showing frustration. Panel 2 FULL COLOR showing relief.", "video_instructions": "Start BLACK AND WHITE, transition to full color."},
    {"id": "story_based", "name_ar": "القصة", "name_en": "Story-Based", "icon": "book-open", "description_ar": "سرد قصة بداية ووسط ونهاية", "description_en": "Narrative with beginning, middle, end", "visual_instructions": "CAROUSEL design (3-5 panels). Setup, Conflict, Resolution.", "video_instructions": "Three-act structure. Character-driven."},
    {"id": "human_touch", "name_ar": "اللمسة البشرية", "name_en": "Human Touch", "icon": "heart-handshake", "description_ar": "تواصل بصري مباشر مع الكاميرا", "description_en": "Direct eye contact with camera", "visual_instructions": "DIRECT EYE CONTACT mandatory. Real human face. Genuine smile. Natural lighting.", "video_instructions": "Person looking at camera. Authentic testimonial."},
    {"id": "engagement_cta", "name_ar": "السؤال التفاعلي", "name_en": "Engagement CTA", "icon": "message-circle", "description_ar": "عنصر تفاعلي يدعو للمشاركة", "description_en": "Interactive element inviting participation", "visual_instructions": "Include FAKE INTERACTIVE ELEMENTS: Poll buttons, A/B choices, quiz format.", "video_instructions": "Pause for viewer. Point to comment section."},
    {"id": "herd_mentality", "name_ar": "القطيع", "name_en": "Herd Mentality", "icon": "users", "description_ar": "ازدحام يظهر الشعبية", "description_en": "Crowd showing popularity", "visual_instructions": "Show CROWD using the product. Queue imagery. 'Sold out' stamps.", "video_instructions": "Multiple people unboxing. Counter showing growing numbers."},
    {"id": "social_proof", "name_ar": "الدليل الاجتماعي", "name_en": "Social Proof", "icon": "star", "description_ar": "تقييمات وآراء العملاء", "description_en": "Customer reviews and ratings", "visual_instructions": "STAR RATINGS prominently displayed. Chat bubble with testimonial. Trust badges.", "video_instructions": "Testimonial clips. Star rating animation."},
    {"id": "reciprocity", "name_ar": "المقايضة", "name_en": "Reciprocity Principle", "icon": "gift", "description_ar": "الهدية تلمع أكثر من المنتج", "description_en": "Gift shines brighter than product", "visual_instructions": "FREE GIFT with GLOW effect - more prominent than main product.", "video_instructions": "Gift reveal with sparkle effects."},
    {"id": "commitment", "name_ar": "الالتزام", "name_en": "Commitment & Consistency", "icon": "check-circle", "description_ar": "شريط تقدم يوحي بالإنجاز", "description_en": "Progress bar suggesting achievement", "visual_instructions": "PROGRESS BAR at 70-90%. Step indicators. 'Almost there!' messaging.", "video_instructions": "Progress bar filling up. Confetti at milestones."},
    {"id": "scarcity", "name_ar": "الندرة", "name_en": "Scarcity Principle", "icon": "clock", "description_ar": "عناصر توحي بالنفاد", "description_en": "Elements suggesting running out", "visual_instructions": "EMPTY SHELVES with last item. COUNTDOWN TIMER. HOURGLASS. Red urgent colors.", "video_instructions": "Clock ticking. Items disappearing from shelf."},
]

PLATFORM_SIZES = [
    {"id": "tiktok_reels", "name": "تيك توك / ريلز", "name_en": "TikTok / Reels", "width": 1080, "height": 1920, "aspect": "9:16", "platform": "vertical"},
    {"id": "post_square", "name": "بوست مربع", "name_en": "Square Post", "width": 1080, "height": 1080, "aspect": "1:1", "platform": "square"},
    {"id": "youtube_banner", "name": "يوتيوب / بنر", "name_en": "YouTube / Banner", "width": 1920, "height": 1080, "aspect": "16:9", "platform": "landscape"},
    {"id": "ig_story", "name": "ستوري", "name_en": "Story", "width": 1080, "height": 1920, "aspect": "9:16", "platform": "vertical"},
    {"id": "fb_feed", "name": "فيسبوك فيد", "name_en": "Facebook Feed", "width": 1200, "height": 628, "aspect": "1.91:1", "platform": "wide"},
]

MARKETING_TIPS = [
    {"ar": "الإعلانات ذات الوجوه البشرية تحقق تفاعل أعلى بـ 38%", "en": "Ads with human faces get 38% higher engagement"},
    {"ar": "اللون الأحمر يزيد الإحساس بالإلحاح", "en": "Red color increases sense of urgency"},
    {"ar": "أول 3 ثوان تحدد 70% من نجاح الإعلان", "en": "First 3 seconds determine 70% of ad success"},
    {"ar": "الأرقام الفردية (7, 9) أكثر إقناعاً", "en": "Odd numbers (7, 9) are more persuasive"},
    {"ar": "التواصل البصري يزيد الثقة بـ 50%", "en": "Eye contact increases trust by 50%"},
    {"ar": "الندرة تزيد القيمة المدركة بـ 200%", "en": "Scarcity increases perceived value by 200%"},
    {"ar": "القصص تُذكر 22 مرة أكثر من الحقائق", "en": "Stories are remembered 22x more than facts"},
    {"ar": "الألوان الدافئة تحفز القرار السريع", "en": "Warm colors encourage quick decisions"},
]

# ============== Auth Helper Functions ==============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        return None
    
    return User(**user)

async def get_optional_user(request: Request) -> Optional[User]:
    """Get user if authenticated, None otherwise"""
    try:
        return await get_current_user(request)
    except Exception:
        return None

# ============== Helper Functions ==============

def extract_colors_from_css(css_text: str) -> List[str]:
    hex_pattern = r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})'
    colors = re.findall(hex_pattern, css_text)
    colors = ['#' + (c*2 if len(c) == 3 else c) for c in colors]
    return list(set(colors))[:10]

def analyze_brand_voice(text: str) -> str:
    text_lower = text.lower()
    if any(word in text_lower for word in ['luxury', 'premium', 'فاخر', 'حصري']):
        return 'luxury'
    elif any(word in text_lower for word in ['fun', 'exciting', 'مرح', 'ممتع']):
        return 'playful'
    elif any(word in text_lower for word in ['professional', 'trusted', 'موثوق']):
        return 'formal'
    return 'friendly'

def get_color_tone(hex_color: str) -> str:
    try:
        hex_color = hex_color.lstrip('#')
        r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        hue = h * 360
        if 0 <= hue < 60 or 300 <= hue <= 360:
            return 'warm'
        elif 180 <= hue < 300:
            return 'cool'
        return 'neutral'
    except Exception:
        return 'neutral'
        return 'neutral'

def extract_brand_name(soup, default_title: str, url: str = "") -> str:
    # 1. Try Open Graph Site Name
    og_site_name = soup.find('meta', property='og:site_name')
    if og_site_name and og_site_name.get('content'):
        return og_site_name.get('content').strip()
    
    # 2. Try JSON-LD (Search for Organization)
    import json
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            if not script.string: continue
            data = json.loads(script.string)
            
            def check_org(d):
                if isinstance(d, dict) and d.get('@type') == 'Organization' and d.get('name'):
                    return d.get('name')
                return None

            if isinstance(data, dict):
                res = check_org(data)
                if res: return res
                if '@graph' in data:
                    for item in data['@graph']:
                        res = check_org(item)
                        if res: return res
        except:
            pass

    # 3. Clean Title Heuristic
    if default_title:
        # Common separators in page titles
        separators = ['|', '-', '—', ':', '•', '–', '«', '»']
        
        for sep in separators:
            if sep in default_title:
                parts = [p.strip() for p in default_title.split(sep) if p.strip()]
                if not parts: continue
                # Usually the brand name is the shortest part, often at the end or beginning
                candidates = [p for p in parts if len(p) < 40] 
                if candidates:
                    # Pick the shortest one as likely brand name
                    return min(candidates, key=len)
    
    # 4. Fallback: Domain name
    if url:
        try:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc
            if not domain: domain = url
            if domain.startswith('www.'):
                domain = domain[4:]
            if '.' in domain:
                name = domain.rsplit('.', 1)[0]
                return name.replace('-', ' ').title()
        except:
            pass
                    
    return default_title
async def scrape_website_advanced(url: str) -> WebsiteData:
    try:
        if url.startswith('/'):
            url = url.lstrip('/')
        
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        connector = aiohttp.TCPConnector(ssl=False)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.get(url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Could not fetch website: {response.status}")
                html = await response.text()
        
        soup = BeautifulSoup(html, 'html.parser')
        raw_title = soup.title.string if soup.title else ""
        title = extract_brand_name(soup, raw_title, url)
        description = ""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            description = meta_desc.get('content', '')
        
        all_text = soup.get_text(separator=' ', strip=True)[:2000]
        colors = []
        for style_tag in soup.find_all('style'):
            colors.extend(extract_colors_from_css(style_tag.string or ''))
        for elem in soup.find_all(style=True):
            colors.extend(extract_colors_from_css(elem.get('style', '')))
        colors = list(set(colors))[:10]
        
        services = [tag.get_text(strip=True) for tag in soup.find_all(['h1', 'h2', 'h3']) if 5 < len(tag.get_text(strip=True)) < 100][:10]
        
        images = []
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src and not src.startswith('data:'):
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    from urllib.parse import urljoin
                    src = urljoin(url, src)
                if src.startswith('http'):
                    images.append(src)
        images = images[:8]
        
        brand_analysis = BrandAnalysis(
            brand_voice=analyze_brand_voice(all_text),
            color_palette=colors,
            primary_color=colors[0] if colors else "#000000",
            secondary_color=colors[1] if len(colors) > 1 else "#666666",
            accent_color=colors[2] if len(colors) > 2 else "#3B82F6",
            tone=get_color_tone(colors[0]) if colors else 'neutral'
        )
        
        return WebsiteData(title=title, description=description, services=services, images=images, brand_analysis=brand_analysis)
    except Exception as e:
        logger.error(f"Error scraping website: {e}")
        raise HTTPException(status_code=400, detail=str(e))

def get_strategy_by_id(strategy_id: str) -> dict:
    for strategy in PSYCHOLOGICAL_STRATEGIES:
        if strategy['id'] == strategy_id:
            return strategy
    return PSYCHOLOGICAL_STRATEGIES[0]

def get_platform_by_id(platform_id: str) -> dict:
    for p in PLATFORM_SIZES:
        if p['id'] == platform_id:
            return p
    return PLATFORM_SIZES[1]

def build_advanced_image_prompt(project: dict, variation: int = 1) -> str:
    strategy = get_strategy_by_id(project.get('psychological_strategy_id', 'hook'))
    platform = get_platform_by_id(project.get('platform', 'post_square'))
    brand_colors = project.get('brand_colors', {}) or {}
    
    variation_styles = ["Clean and minimalist", "Bold and dynamic", "Elegant and sophisticated"]
    
    return f"""Create a HIGH-CONVERTING advertisement image:

BRAND: {project.get('company_name', 'Brand')}
Description: {project.get('company_description', '')}
Strengths: {', '.join(project.get('strengths', []))}

COLORS: Primary {brand_colors.get('primary', '#000000')}, Secondary {brand_colors.get('secondary', '#FFFFFF')}, Accent {brand_colors.get('accent', '#3B82F6')}

PLATFORM: {platform['name_en']} ({platform['width']}x{platform['height']})

NEUROMARKETING STRATEGY: {strategy['name_en']}
{strategy['visual_instructions']}

STYLE: {variation_styles[variation-1] if variation <= len(variation_styles) else variation_styles[0]}

REQUIREMENTS:
- Arabic text, RTL flow
- Mobile-optimized, readable on small screens
- Modern professional aesthetic
- Apply psychological strategy exactly"""

def build_advanced_video_prompt(project: dict) -> str:
    strategy = get_strategy_by_id(project.get('psychological_strategy_id', 'hook'))
    return f"""Create SHORT-FORM VIDEO AD (5-10 seconds loop):

BRAND: {project.get('company_name', 'Brand')}
Product: {project.get('company_description', '')}

STRATEGY: {strategy['name_en']}
{strategy.get('video_instructions', strategy['visual_instructions'])}

SPECS: Modern, cinematic, high-energy. Capture attention in FIRST FRAME. Smooth transitions."""

def generate_caption(project: dict, strategy: dict) -> Dict[str, Any]:
    captions = {
        'hook': {'ar': 'توقف! 🛑 هل رأيت هذا من قبل؟', 'en': 'Stop! 🛑 Have you seen this before?'},
        'scarcity': {'ar': '⏰ الكمية محدودة جداً!', 'en': '⏰ Very limited quantity!'},
        'social_proof': {'ar': '⭐⭐⭐⭐⭐ آلاف العملاء السعداء', 'en': '⭐⭐⭐⭐⭐ Thousands of happy customers'},
        'loss_aversion': {'ar': '😱 لا تفوّت الفرصة!', 'en': '😱 Don\'t miss out!'},
    }
    base = captions.get(strategy['id'], {'ar': 'عرض خاص ✨', 'en': 'Special offer ✨'})
    hashtags = ['#اعلان', '#تسويق', '#عرض_خاص']
    return {
        'caption_ar': f"{base['ar']}\n\n{project.get('company_name', '')}\n\n{' '.join(hashtags)}",
        'caption_en': f"{base['en']}\n\n{project.get('company_name', '')}\n\n{' '.join(hashtags)}",
        'hashtags': hashtags
    }

# ============== Auth API Endpoints ==============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Process session_id from Google OAuth and create session (DEMO MODE - NO AUTH REQUIRED)"""
    try:
        # DEMO MODE: Create anonymous user session without external auth
        user_id = "demo_user"
        user_email = "demo@neuroad.app"
        user_name = "Demo User"
        
        existing_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        
        if not existing_user:
            await db.users.insert_one({
                "user_id": user_id,
                "email": user_email,
                "name": user_name,
                "picture": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        session_token = f"demo_session_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=365)
        
        await db.user_sessions.delete_many({"user_id": user_id})
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=365*24*60*60,
            path="/"
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        return {"success": True, "user": user}
        
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"success": True}

# ============== Main API Endpoints ==============

@api_router.get("/")
async def root():
    return {"message": "NeuroAd API - AI-Powered Neuromarketing Content Generator"}

@api_router.get("/strategies")
async def get_strategies():
    return PSYCHOLOGICAL_STRATEGIES

@api_router.get("/platforms")
async def get_platforms():
    return PLATFORM_SIZES

@api_router.get("/marketing-tips")
async def get_marketing_tips():
    return MARKETING_TIPS

@api_router.post("/scrape")
async def scrape_url(request: ScrapeRequest):
    return await scrape_website_advanced(request.url)

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        ext = Path(file.filename).suffix or '.jpg'
        filename = f"{uuid.uuid4()}{ext}"
        filepath = UPLOAD_DIR / filename
        content = await file.read()
        with open(filepath, 'wb') as f:
            f.write(content)
        return {"url": f"/api/uploads/{filename}", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/uploads/{filename}")
async def get_upload(filename: str):
    filepath = UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

@api_router.get("/generated/{filename}")
async def get_generated(filename: str):
    filepath = GENERATED_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, request: Request):
    try:
        user = await get_optional_user(request)
        project_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        doc = {
            "id": project_id,
            "user_id": user.user_id if user else None,
            **project.model_dump(),
            "generated_images": [],
            "generated_videos": [],
            "generated_captions": [],
            "status": "draft",
            "created_at": now,
            "updated_at": now
        }
        
        await db.projects.insert_one(doc)
        return ProjectResponse(**doc)
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(request: Request):
    user = await get_optional_user(request)
    query = {"user_id": user.user_id} if user else {}
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [ProjectResponse(**p) for p in projects]

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# ============== Nano Banana Pro Image Generation ==============

async def generate_image_with_nano_banana(prompt: str, aspect_ratio: str = "1:1") -> Optional[str]:
    """Generate image using Nano Banana Pro API from kie.ai"""
    kie_api_key = os.environ.get('KIE_AI_API_KEY')
    if not kie_api_key:
        raise HTTPException(status_code=500, detail="KIE_AI_API_KEY not configured")
    
    # Create task
    create_url = "https://api.kie.ai/api/v1/jobs/createTask"
    headers = {
        "Authorization": f"Bearer {kie_api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "nano-banana-pro",
        "input": {
            "prompt": prompt,
            "image_input": [],
            "aspect_ratio": aspect_ratio,
            "resolution": "1K",
            "output_format": "png"
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create the task
        response = await client.post(create_url, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(f"Nano Banana Pro create task failed: {response.text}")
            return None
        
        result = response.json()
        if result.get("code") != 200:
            logger.error(f"Nano Banana Pro error: {result.get('msg')}")
            return None
        
        task_id = result.get("data", {}).get("taskId")
        if not task_id:
            logger.error("No taskId returned from Nano Banana Pro")
            return None
        
        # Poll for result
        check_url = f"https://api.kie.ai/api/v1/jobs/recordInfo?taskId={task_id}"
        max_attempts = 60  # Wait up to 2 minutes
        
        for attempt in range(max_attempts):
            await asyncio.sleep(2)  # Wait 2 seconds between polls
            
            check_response = await client.get(check_url, headers=headers)
            if check_response.status_code != 200:
                continue
            
            check_result = check_response.json()
            if check_result.get("code") != 200:
                continue
            
            data = check_result.get("data", {})
            state = data.get("state")
            
            if state == "success":
                result_json = data.get("resultJson", "{}")
                try:
                    import json
                    result_data = json.loads(result_json)
                    result_urls = result_data.get("resultUrls", [])
                    if result_urls:
                        return result_urls[0]
                except Exception as e:
                    logger.error(f"Error parsing result: {e}")
                return None
            elif state == "failed":
                logger.error(f"Nano Banana Pro task failed: {data.get('failMsg')}")
                return None
        
        logger.error("Nano Banana Pro task timed out")
        return None

async def download_and_save_image(image_url: str, project_id: str, variation: int) -> Optional[str]:
    """Download image from URL and save locally"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(image_url)
            if response.status_code != 200:
                return None
            
            filename = f"{project_id}_v{variation}_{uuid.uuid4()}.png"
            filepath = GENERATED_DIR / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return f"/api/generated/{filename}"
    except Exception as e:
        logger.error(f"Error downloading image: {e}")
        return None

@api_router.post("/generate-content")
async def generate_content(request: GenerateContentRequest):
    """Generate images using Nano Banana Pro API"""
    try:
        project = await db.projects.find_one({"id": request.project_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        await db.projects.update_one(
            {"id": request.project_id},
            {"$set": {"status": "generating", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        generated_urls = []
        
        # Map platform to aspect ratio
        platform = project.get('platform', 'post_square')
        aspect_map = {
            'tiktok_reels': '9:16',
            'post_square': '1:1',
            'youtube_banner': '16:9',
            'ig_story': '9:16',
            'fb_feed': '16:9'
        }
        aspect_ratio = aspect_map.get(platform, '1:1')
        
        # Generate variations
        for i in range(1, min(request.variation_count + 1, 4)):
            prompt = build_advanced_image_prompt(project, variation=i)
            if request.custom_instructions:
                prompt += f"\n\nADDITIONAL INSTRUCTIONS: {request.custom_instructions}"
            
            logger.info(f"Generating image variation {i} with Nano Banana Pro...")
            
            # Generate image with Nano Banana Pro
            image_url = await generate_image_with_nano_banana(prompt, aspect_ratio)
            
            if image_url:
                # Download and save locally
                local_url = await download_and_save_image(image_url, request.project_id, i)
                if local_url:
                    generated_urls.append(local_url)
                    logger.info(f"Generated image {i}: {local_url}")
        
        # Generate caption
        strategy = get_strategy_by_id(project.get('psychological_strategy_id', 'hook'))
        caption = generate_caption(project, strategy)
        
        status = "completed" if generated_urls else "failed"
        
        await db.projects.update_one(
            {"id": request.project_id},
            {
                "$push": {"generated_images": {"$each": generated_urls}},
                "$set": {
                    "generated_captions": [caption],
                    "status": status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": len(generated_urls) > 0,
            "images": generated_urls,
            "caption": caption,
            "variations_count": len(generated_urls)
        }
        
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        await db.projects.update_one(
            {"id": request.project_id},
            {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate-video")
async def generate_video(request: GenerateVideoRequest):
    try:
        project = await db.projects.find_one({"id": request.project_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        await db.projects.update_one(
            {"id": request.project_id},
            {"$set": {"status": "generating_video", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        prompt = build_advanced_video_prompt(project)
        if request.custom_instructions:
            prompt += f"\n\nADDITIONAL: {request.custom_instructions}"
        
        # from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        if True:
            raise HTTPException(status_code=501, detail="Video generation is currently disabled due to missing dependencies.")

        # video_gen = OpenAIVideoGeneration(api_key=api_key)
        
        # filename = f"{request.project_id}_{uuid.uuid4()}.mp4"
        # output_path = str(GENERATED_DIR / filename)
        
        # # Sora 2 supported sizes
        # size_map = {"portrait": "1024x1792", "square": "1024x1024", "landscape": "1280x720"}
        # size = size_map.get(request.video_size, "1024x1792")
        
        # video_bytes = video_gen.text_to_video(
        #     prompt=prompt,
        #     model="sora-2",
        #     size=size,
        #     duration=min(max(request.duration, 4), 12),
        #     max_wait_time=600
        # )
        
        if video_bytes:
            video_gen.save_video(video_bytes, output_path)
            video_url = f"/api/generated/{filename}"
            
            await db.projects.update_one(
                {"id": request.project_id},
                {
                    "$push": {"generated_videos": video_url},
                    "$set": {"status": "completed", "updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
            return {"success": True, "video_url": video_url}
        else:
            raise HTTPException(status_code=500, detail="Video generation failed")
        
    except Exception as e:
        logger.error(f"Error generating video: {e}")
        await db.projects.update_one(
            {"id": request.project_id},
            {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
