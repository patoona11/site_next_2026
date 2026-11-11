# Faculty of Industrial Technology — NPU

เว็บไซต์คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม พัฒนาด้วย Next.js 16, React 19 และ Tailwind CSS 4

## รันบนเครื่อง

ต้องใช้ Node.js 20.9 ขึ้นไป

```bash
npm ci
npm run dev
```

เปิด <http://localhost:3000>

เมื่อนำขึ้นใช้งานจริง ให้กำหนด `NEXT_PUBLIC_SITE_URL` เป็น URL หลักของเว็บไซต์ เพื่อให้ `sitemap.xml` และ `robots.txt` ใช้โดเมนที่ถูกต้อง

## รันด้วย Docker Compose

คัดลอก `.env.example` เป็น `.env` และกำหนดค่าตัวแปรก่อน build หากไม่เลือก Supabase ระบบ CMS จะใช้ local JSON

```bash
docker compose up --build
```

เปิด <http://localhost:3000>

หยุดและลบ container:

```bash
docker compose down
```

## รันด้วย Docker โดยตรง

```bash
docker build -t itech-npu .
docker run --rm -p 3000:3000 --name itech-npu itech-npu
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

หน้า Admin อยู่ที่ <http://localhost:3000/admin> รองรับการเพิ่ม แก้ไข ลบ ค้นหา/กรอง อัปโหลดภาพ บันทึกฉบับร่าง และเผยแพร่เนื้อหาไปยังหน้าข่าว งาน ทุน และปฏิทิน รวมถึงแก้ไขข้อมูลติดต่อของเว็บไซต์

ข้อมูลข่าวหลักใน `content_posts` ประกอบด้วยหัวข้อ คำโปรย เนื้อหา หมวด สถานะ วันที่เผยแพร่ URL รูปภาพ และลิงก์ต้นฉบับ หน้าเว็บอ่านข่าวผ่าน Server Component หรือ API สาธารณะที่ `/api/posts` และมี RSS 2.0 ที่ `/feed.xml`

สำหรับการรันด้วย `npm run dev` ให้สร้าง `.env.local` และตั้งค่าตัวแปรต่อไปนี้ก่อนใช้งาน:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=รหัสผ่านที่คาดเดายากอย่างน้อย 8 ตัว
ADMIN_SESSION_SECRET=ข้อความสุ่มอย่างน้อย 32 ตัวอักษร
```

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

หากยังไม่มี secret key ให้คง `CMS_BACKEND=local` ไว้ก่อน Publishable key เพียงอย่างเดียวสามารถใช้ Supabase Auth และอ่านแถวที่ RLS อนุญาตได้ แต่ไม่ควรเปิดสิทธิ์เขียนแบบ anonymous ให้หน้า Admin

## คำสั่งตรวจสอบ

```bash
npm run build
npm run lint
```
