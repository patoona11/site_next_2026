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

หากต้องการเชื่อมต่อ Supabase ให้คัดลอก `.env.example` เป็น `.env` และกำหนดค่าตัวแปรก่อน build หากไม่กำหนดค่า เว็บไซต์จะใช้ข้อมูลตัวอย่าง

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
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -t itech-npu .
```

Docker image ใช้ Next.js standalone output, รันด้วยผู้ใช้ที่ไม่ใช่ root และมี health check ที่หน้า `/`

## คำสั่งตรวจสอบ

```bash
npm run build
npm run lint
```
