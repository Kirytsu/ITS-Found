# ITS Found

ITS Found adalah platform pelaporan dan pencarian barang hilang/ditemukan yang dikhususkan untuk lingkungan kampus Institut Teknologi Sepuluh Nopember (ITS).

## Fitur Utama

- **Laporan Kehilangan & Penemuan**: Pengguna dapat mempublikasikan barang yang hilang atau ditemukan lengkap dengan detail, foto, lokasi, dan tanggal kejadian.
- **Smart Match Notification**: Sistem secara cerdas akan mencocokkan laporan kehilangan dan penemuan berdasarkan area, kategori, dan rentang waktu kejadian. Pengguna akan mendapatkan notifikasi otomatis jika ada kecocokan.
- **Alur Verifikasi Admin (Khusus Penemuan)**: Untuk mencegah penyalahgunaan dan memastikan barang diamankan, setiap laporan *Penemuan* harus diverifikasi oleh Admin.
- **Pencatatan Fasilitas Penitipan**: Laporan penemuan dilengkapi dengan informasi detail fasilitas penitipan (contoh: Pos Satpam, TU Departemen) beserta alamat dan nomor kontaknya.
- **Timeline Riwayat Status**: Laporan dilengkapi rekam jejak status transparan, menampilkan siapa yang membuat, memverifikasi (Admin), hingga mengambil/menyelesaikan laporan.
- **Dashboard Interaktif**: Filter terintegrasi untuk mencari laporan spesifik dan antarmuka kartu (card) yang responsif.

## Struktur Direktori Utama

Projek ini menggunakan **Next.js 15 (App Router)** dan **Prisma ORM**.

```text
src/
├── app/                  # Routing utama Next.js
│   ├── (auth)/           # Route untuk login & register (menggunakan layout khusus)
│   ├── (main)/           # Route untuk halaman utama pengguna (Dashboard, Laporan Saya, Detail, dsb.)
│   ├── admin/            # Route khusus panel admin (Verifikasi)
│   └── api/              # Route handlers untuk API pendukung (misal: upload gambar)
├── components/           # Komponen UI React
│   ├── shared/           # Komponen bisnis yang dapat digunakan ulang (ReportCard, Timeline, dsb.)
│   └── ui/               # Komponen dasar (Button, Select, Badge, Toast, TopNavbar, dsb.)
├── generated/prisma/     # Prisma client hasil generate
├── lib/                  # Fungsi utilitas dan logika server
│   ├── actions/          # Server Actions untuk operasi database (CRUD)
│   ├── auth.ts           # Logika sesi (JWT) dan Middleware autentikasi
│   ├── db.ts             # Inisialisasi Prisma Client (Singleton)
│   └── utils.ts          # Fungsi utilitas (format tanggal, warna status, dsb.)
└── types/                # Definisi TypeScript interface (Model data)

prisma/
├── schema.prisma         # Skema database SQLite dan model Prisma
└── seed.ts               # Script untuk memasukkan data awal (Master data & Admin)
```

## Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database Engine**: SQLite
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Autentikasi**: JSON Web Tokens (`jose`), bcryptjs (Password Hashing)
- **Image Upload**: Formidable (Penyimpanan lokal sementara di `public/uploads`)

## Cara Menjalankan Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan ITS Found di mesin lokal Anda.

### 1. Kloning dan Instalasi

```bash
git clone https://github.com/Kirytsu/ITS-Found.git
cd "ITS Found"
npm install
```

### 2. Konfigurasi Environment Variable

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="" # Sesuaikan dengan secret yang ada
```

### 3. Setup Database & Seeding

Jalankan sinkronisasi skema database dan masukkan *master data* (Kategori, Area, Fasilitas) beserta akun dummy.

```bash
npx prisma db push
npx prisma generate
npm run seed
```

*Catatan: Akun Admin default yang dibuat oleh seeder adalah:*
- **Email:** `admin@its.ac.id`
- **Password:** `admin123`

### 4. Jalankan Development Server

```bash
npm run dev
```
