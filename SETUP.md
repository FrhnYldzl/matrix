# Matrix OS · Setup & Deploy Rehberi

> **Bu private bir holdco OS'tur — SaaS değil.** Ferhan + 2-4 partner için tasarlandı. Hiç kimseye satılmayacak, customer signup yok, multi-tenant izolasyon yok. Altyapı buna göre sade.

---

## 0. Mimari Özeti

| Katman | Teknoloji | Nerede koşar |
|---|---|---|
| Frontend (Next.js 16) | React 19 · Tailwind v4 · Zustand · React Flow | **Vercel** (ücretsiz tier) |
| API routes (same repo) | Next.js App Router `/api/*` | **Vercel** (serverless) |
| Database | Postgres 16 | **Railway** |
| Cache & queue | Redis 7 (BullMQ) | **Railway** |
| Background worker | Node.js (BullMQ consumer) | **Railway** |
| Cron jobs | Railway cron | **Railway** |
| Agent runtime | Claude Agent SDK (Anthropic) | API çağrısı — serverless'tan |
| Auth | Email allowlist + signed cookie | Serverless middleware |

**Maliyet tahmini (solo + 2-4 partner kullanımı):**
- Vercel Hobby: **$0/ay**
- Railway Postgres + Redis + Worker: **~$10-20/ay**
- Anthropic API kullanımı: **~$20-100/ay** (tasarruf Oracle routing'i yaparsa)
- **Toplam ~$30-120/ay** — günde 1-2 saat zaman tasarrufu bile bunu katlarken geçer.

---

## 1. Local Development (ilk kurulum)

### 1.1. Repo klonla + bağımlılıklar

```bash
git clone <your-repo-url> matrix-os
cd matrix-os
npm install
```

### 1.2. Local Postgres + Redis (Docker)

`docker-compose.yml` (isteğe bağlı ama öneriyorum):

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: matrix
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7
    ports: ["6379:6379"]
volumes:
  pgdata:
```

```bash
docker-compose up -d
```

### 1.3. `.env.local` oluştur

```bash
cp .env.example .env.local
```

`.env.local`'ı aç ve düzenle:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/matrix"
REDIS_URL="redis://localhost:6379"
MATRIX_ALLOWED_EMAILS="ferhan@ferhan.co"
MATRIX_SESSION_SECRET="$(openssl rand -hex 32)"  # gerçek komut çıktısını yapıştır
ANTHROPIC_API_KEY="sk-ant-api03-..."  # anthropic.com/account'tan al
```

### 1.4. DB şemasını ve mock veriyi yükle

```bash
npm run db:generate      # Prisma client üret
npm run db:push          # Şemayı Postgres'e uygula (ilk kez)
npm run db:seed          # mock-data.ts'den DB'ye 3 workspace + skills + workflows vs yükle
```

### 1.5. Çalıştır

```bash
npm run dev
```

Aç: `http://localhost:3000`. Matrix tüm 18 route ile canlı.

---

## 2. Railway Deploy (production)

### 2.1. Railway hesap + proje

1. [railway.com](https://railway.com) → giriş (GitHub OAuth kolay)
2. **New Project** → **Deploy from GitHub Repo** → `matrix-os` seç
3. Build otomatik başlar, ama önce servisleri eklemen gerek ↓

### 2.2. Postgres + Redis ekle

- Project panel → **New** → **Database → PostgreSQL**
- Project panel → **New** → **Database → Redis**

Railway otomatik olarak `DATABASE_URL` ve `REDIS_URL` değişkenlerini üretir ve main servise attach eder.

### 2.3. Environment variables

Main servisin **Variables** sekmesinde şunları ekle (production değerleriyle):

```
ANTHROPIC_API_KEY=sk-ant-api03-...
MATRIX_ALLOWED_EMAILS=ferhan@ferhan.co,partner1@domain.co,partner2@domain.co
MATRIX_SESSION_SECRET=<openssl rand -hex 32 çıktısı>
NOTION_TOKEN=...
SLACK_BOT_TOKEN=...
HUBSPOT_API_KEY=...
```

`DATABASE_URL` ve `REDIS_URL` Railway plugin'den otomatik gelir.

### 2.4. İlk deploy

Railway otomatik `railway.json` okur:
- `npm run db:generate && npm run build` (build)
- `npm run db:migrate:deploy && npm run start` (start)

İlk deploy'da `db:migrate:deploy` henüz migration oluşturmadığın için uyarı verir — sorun değil. Sonra:

```bash
# Local'den (ilk kez):
npx prisma migrate dev --name init
git add prisma/migrations && git commit -m "feat: initial DB migration"
git push  # Railway auto-deploys
```

Bir daha şema değişikliği:

```bash
# Local'de düzenle prisma/schema.prisma
npx prisma migrate dev --name add-xyz
git add prisma/migrations && git push
```

### 2.5. İlk seed (production)

Railway servisine shell ile bağlan (**CLI yolu**):

```bash
npm i -g @railway/cli
railway login
railway link  # proje seç
railway run npm run db:seed
```

Veya Railway dashboard'dan **Service → Deployments → latest → Shell** → `npm run db:seed`.

### 2.6. Custom domain

Railway **Settings → Networking → Custom Domain** → `matrix.ferhan.co` ekle. DNS CNAME'i Railway'in verdiği hedefe yönlendir.

### 2.7. Cloudflare Access (opsiyonel ama önerilen)

Private holdco OS için `matrix.ferhan.co`'yu **sadece senin + partnerlerin** görebileceği şekilde kilitle:

1. Cloudflare → **Zero Trust** → **Access → Applications** → **Add**
2. Hostname: `matrix.ferhan.co`
3. Policy: Email allowlist — Ferhan + partners
4. Save

Bu senin koduna ekstra auth yükü getirmez; Matrix'in kendi email allowlist'i zaten var. Bu katman cloud-level savunma.

---

## 3. Claude Agent SDK entegrasyonu (B+1 sprint)

`src/lib/agent/orchestrator.ts` şu an skeleton. Gerçek SDK çağrısı için:

```bash
npm install @anthropic-ai/sdk
```

Sonra `invoke()` fonksiyonunda `// Claude Agent SDK call goes here` bölümünü doldur. MCP tool'lar için Anthropic'in resmi MCP sunucularını (Notion, Gmail, Slack) paketle.

---

## 4. Ortak senaryolar

### "Juris SaaS'ını Matrix'e ekle"

1. `POST /api/workspaces` ile yeni workspace yarat:
   ```json
   {
     "slug": "juris",
     "name": "Juris · SaaS",
     "shortName": "JS",
     "industry": "Legal Tech SaaS",
     "accent": "nebula"
   }
   ```
2. Keymaker'daki "Sales & Marketing" blueprint'ini Juris'e kur → 5 agent + 7 skill + 3 workflow otomatik yaratılır
3. TrainStation'da Juris'in Stripe/HubSpot/GA key'lerini env'e ekle (Railway Variables)
4. Captain's Log → 90-Day Rocks tanımla ("Q2'de $50K MRR")
5. Scorecard metrikleri (MRR, CAC, churn) haftalık yazılmaya başlasın

### "Skill'in maliyeti kontrolden çıkıyor"

1. Control Room → Kill Switch'i arm et (`POST /api/system/kill-switch { armed: true, reason: "budget blow" }`)
2. Tüm koşan agent/workflow/skill invocation'ları anında durur
3. The Tribute'ta sorumlu skill'i bul, maliyeti analiz et
4. Oracle "bu skill Opus yerine Haiku'ya yönlendir" önerisi üretir
5. Skill düzelt → Kill switch'i disarm → yaşam devam

---

## 5. Sorun giderme

| Belirti | Çözüm |
|---|---|
| `Invalid DATABASE_URL` | `.env.local`'ın başında `DATABASE_URL=` satırı olmalı (export YOK) |
| `prisma generate` hata | `rm -rf node_modules/.prisma && npm run db:generate` |
| Build bulut'ta fail | Railway Variables'a `DATABASE_URL` gerçek yazılmış mı? Build time'da prisma generate'e gerek |
| Seed `mock-data import` hata | `tsx` v4+ kurulu mu? `npm i -D tsx@latest` |
| `429 rate-limited` | `/system/rate-limited` sayfası ← connector kota dolumu, TrainStation'da connector sağlığına bak |

---

## 6. Sıradaki sprint'ler

**B+1: Agent SDK entegrasyonu**
- Claude Agent SDK kurulumu, MCP servers (Notion/Gmail/Slack)
- Orchestrator'ın gerçek LLM çağrıları
- Golden test suite v1

**B+2: Scheduled jobs**
- Cron ile Oracle günlük tarama
- Haftalık Level 10 Meeting workflow'u
- Scorecard otomatik doldurma

**B+3: Authentication**
- Email allowlist middleware (`src/middleware.ts`)
- Magic link email via Resend/Postmark
- Session cookie flow

**C: İlk gerçek asset**
- Bir workspace'e Juris/Ferhan · Core — gerçek connector (Notion) ile uç-uca test
- 1 orchestrator + 3 specialist agent canlıya
- İlk $1 gerçek harcama The Tribute'e düşsün
