# Faculty of Industrial Technology — NPU

เว็บไซต์คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม พัฒนาด้วย Next.js 16, React 19 และ Tailwind CSS 4

## รันบนเครื่อง

ต้องใช้ Node.js 20.9 ขึ้นไป

```bash
npm ci
npm run dev
```

เปิด <http://localhost:3100>

เมื่อนำขึ้นใช้งานจริง ให้กำหนด `NEXT_PUBLIC_SITE_URL` เป็น URL หลักของเว็บไซต์ เพื่อให้ `sitemap.xml` และ `robots.txt` ใช้โดเมนที่ถูกต้อง

## รันด้วย Docker Compose

คัดลอก `.env.example` เป็น `.env` และกำหนดค่าตัวแปรก่อน build หากไม่เลือก Supabase ระบบ CMS จะใช้ local JSON

```bash
docker compose up --build
```

เปิด <http://localhost:3100>

หยุดและลบ container:

```bash
docker compose down
```

## รันด้วย Docker โดยตรง

```bash
docker build -t itech-npu .
docker run --rm -p 3100:3100 --name itech-npu itech-npu
```

หากใช้ Supabase ให้ส่งค่าในขั้น build เพราะตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูกฝังใน client bundle:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key \
  -t itech-npu .
```

Docker image ใช้ Next.js standalone output, รันด้วยผู้ใช้ที่ไม่ใช่ root และมี health check ที่หน้า `/`

## ระบบจัดการเนื้อหา

หน้า Admin อยู่ที่ <http://localhost:3100/admin> รองรับการเพิ่ม แก้ไข ลบ ค้นหา/กรอง อัปโหลดภาพ บันทึกฉบับร่าง และเผยแพร่เนื้อหาไปยังหน้าข่าว งาน ทุน และปฏิทิน รวมถึงแก้ไขข้อมูลติดต่อของเว็บไซต์

ข้อมูลข่าวหลักใน `content_posts` ประกอบด้วยหัวข้อ คำโปรย เนื้อหา หมวด สถานะ วันที่เผยแพร่ URL รูปภาพ และลิงก์ต้นฉบับ หน้าเว็บอ่านข่าวผ่าน Server Component หรือ API สาธารณะที่ `/api/posts` และมี RSS 2.0 ที่ `/feed.xml`

สำหรับการรันด้วย `npm run dev` ให้สร้าง `.env.local` และตั้งค่าตัวแปรต่อไปนี้ก่อนใช้งาน:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=รหัสผ่านที่คาดเดายากอย่างน้อย 8 ตัว
ADMIN_SESSION_SECRET=ข้อความสุ่มอย่างน้อย 32 ตัวอักษร
```

หากต้องการใช้ Supabase Auth สำหรับหน้า Admin แทนรหัสผ่านจาก Environment Variable ให้สร้างผู้ใช้แบบ Email/Password ใน Supabase Authentication แล้วกำหนด:

```env
ADMIN_AUTH_MODE=supabase
ADMIN_EMAIL_ALLOWLIST=admin@example.ac.th,editor@example.ac.th
```

ช่องชื่อผู้ใช้ในหน้า Admin จะรับอีเมล Supabase เมื่อใช้โหมดนี้ ระบบตรวจ session ฝั่งเซิร์ฟเวอร์ทุกครั้งและอนุญาตเฉพาะอีเมลใน allowlist เท่านั้น ค่าเริ่มต้น `ADMIN_AUTH_MODE=password` ยังคงรองรับระบบเดิม

เมื่อ `CMS_BACKEND=local` ข้อมูลจะอยู่ใน `data/content.json` และภาพอยู่ใน `public/uploads` โดย Docker Compose ผูกทั้งสองตำแหน่งเป็น volume เพื่อให้ข้อมูลคงอยู่หลัง restart container

## เชื่อม Supabase

โปรเจกต์มี Supabase SSR client สำหรับ Browser, Server Component และ session refresh ผ่าน `src/proxy.ts` แล้ว

1. เปิด SQL Editor ใน Supabase แล้วรันไฟล์ migration ตามลำดับ:
   - `supabase/migrations/20261107000000_create_content_posts.sql`
   - `supabase/migrations/20261108000000_add_learning_and_site_settings.sql`
2. เพิ่มค่าต่อไปนี้ใน `.env.local` สำหรับการรันบนเครื่อง หรือ `.env` สำหรับ Docker Compose:

```env
CMS_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_STORAGE_BUCKET=cms-media
```

3. เริ่มเซิร์ฟเวอร์ใหม่ ระบบจะอ่าน/เขียนเนื้อหาที่ตาราง `content_posts` และสร้าง public Storage bucket `cms-media` เมื่ออัปโหลดภาพครั้งแรก

## นำเข้าข่าวจาก Facebook / RSS

วิธีเริ่มต้นที่ง่ายที่สุดคือสร้าง RSS จาก RSS.app, n8n หรือ Make แล้ววางลิงก์ใน Admin > ข้อมูลเว็บไซต์ > ลิงก์ RSS ส่วนตัว จากนั้นเลือกข่าวที่ต้องการนำเข้า ระบบจะบันทึกเป็นฉบับร่างให้ตรวจสอบก่อนเผยแพร่

หากคณะมี Facebook Page Access Token สามารถใช้ Graph API ทางการได้โดยเพิ่มตัวแปรต่อไปนี้:

```env
FACEBOOK_PAGE_ID=100057388091241
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_GRAPH_VERSION=v26.0
```

Page Access Token เป็นความลับฝั่งเซิร์ฟเวอร์ ห้ามใช้คำนำหน้า `NEXT_PUBLIC_` หรือ commit ลง Git

`SUPABASE_SECRET_KEY` ใช้เฉพาะ Route Handler ฝั่งเซิร์ฟเวอร์ ห้ามตั้งชื่อขึ้นต้นด้วย `NEXT_PUBLIC_` ห้ามใส่ใน source control และห้ามส่งเป็น Docker build argument ระบบยังรองรับชื่อเดิม `SUPABASE_SERVICE_ROLE_KEY` สำหรับโปรเจกต์ Supabase รุ่นเก่า

หากยังไม่มี secret key สามารถใช้ `CMS_BACKEND=local` ได้เฉพาะการรันบนเครื่องหรือ Docker ที่ผูก persistent volume เท่านั้น Publishable key เพียงอย่างเดียวสามารถใช้ Supabase Auth และอ่านแถวที่ RLS อนุญาตได้ แต่ไม่ควรเปิดสิทธิ์เขียนแบบ anonymous ให้หน้า Admin

### Deploy บน Vercel

Vercel Functions ไม่อนุญาตให้เขียนไฟล์ลง `/var/task` ดังนั้นระบบ CMS บน Vercel ต้องใช้ Supabase เท่านั้น ให้เพิ่มตัวแปรต่อไปนี้ใน Project Settings > Environments > Production แล้ว Redeploy:

```env
CMS_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_STORAGE_BUCKET=cms-media
```

หากไม่ได้กำหนด `CMS_BACKEND` ระบบจะเลือก Supabase ให้อัตโนมัติเมื่อทำงานบน Vercel และจะแจ้งว่าการตั้งค่า Supabase ยังไม่ครบแทนการพยายามเขียนไฟล์ local

## Local AI ด้วย Ollama

เว็บมี server-only endpoint ที่ `POST /api/ai/chat` สำหรับเรียก Ollama โดยไม่เปิดพอร์ต 11434 ให้เครื่องภายนอกเข้าถึงโดยตรง เพิ่มค่าเหล่านี้ใน `.env.local`:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3.5:4b
AI_API_KEY=สร้างคีย์แบบสุ่มที่ยาวและคาดเดายาก
```

เตรียมโมเดลและเริ่ม Ollama ก่อนรันเว็บ:

```bash
ollama pull qwen3.5:4b
ollama serve
npm run dev
```

ตัวอย่าง request (รองรับทั้ง `Authorization: Bearer` และ `X-API-Key`):

```bash
curl http://localhost:3100/api/ai/chat \
  -H "Authorization: Bearer YOUR_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"สวัสดี"}]}'
```

หากเว็บรันใน Docker ให้ใช้ `OLLAMA_BASE_URL=http://host.docker.internal:11434` ซึ่งกำหนดเป็นค่าเริ่มต้นไว้ใน `docker-compose.yml` แล้ว

### เปิดให้ iPhone ใช้ผ่าน Tailscale HTTPS

ติดตั้งและลงชื่อเข้าใช้ Tailscale ด้วยบัญชีเดียวกันทั้งเครื่องที่รันเว็บและ iPhone จากนั้นรัน:

```bash
tailscale serve --bg 3100
tailscale serve status
```

นำ URL แบบ `https://ชื่อเครื่อง.ชื่อ-tailnet.ts.net` ที่คำสั่งแสดงไปเปิดบน iPhone การเข้าถึงถูกจำกัดอยู่ใน tailnet และ Ollama ยังคงรับการเชื่อมต่อผ่าน Next.js endpoint เท่านั้น

## Automation webhook

เมื่อ Admin เพิ่ม แก้ไข หรือลบข่าว ระบบส่ง `POST` ไปยัง webhook ที่กำหนดไว้ จึงใช้ต่อกับ n8n, Make หรือระบบ automation อื่นได้:

```env
AUTOMATION_WEBHOOK_URL=https://automation.example/webhook/itech2026
AUTOMATION_WEBHOOK_SECRET=สร้างคีย์ลับแบบสุ่ม
```

Event ที่ส่งคือ `content.created`, `content.updated` และ `content.deleted` ในรูปแบบ JSON หากกำหนด secret ระบบจะส่งลายเซ็น HMAC SHA-256 ใน header `X-Itech-Signature` การบันทึกข่าวจะยังสำเร็จแม้ปลายทาง webhook ล่ม

## คำสั่งตรวจสอบ

```bash
npm run build
npm run lint
```
