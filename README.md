# ITS Found

ITS Found adalah platform pelaporan dan pencarian barang hilang/ditemukan yang dikhususkan untuk lingkungan kampus Institut Teknologi Sepuluh Nopember (ITS).

## Fitur Utama

- **Laporan Kehilangan & Penemuan**: Pengguna dapat mempublikasikan barang yang hilang atau ditemukan lengkap dengan detail, foto, lokasi, dan tanggal kejadian.
- **Smart Match Notification**: Sistem mencocokkan laporan kehilangan dan penemuan berdasarkan area, kategori, dan rentang waktu kejadian, lalu mengirim notifikasi otomatis ke kedua pihak. Kecocokan untuk laporan *Penemuan* baru muncul **setelah** laporan tersebut diverifikasi admin (laporan yang masih menunggu verifikasi tidak menampilkan kecocokan). Bila ada lebih dari satu kecocokan, semuanya ditampilkan sebagai daftar kartu di halaman detail.
- **Hub Verifikasi Admin (2 Antrean)**: Halaman verifikasi memakai pemilih segmented (radio) dengan dua antrean — **Perlu Verifikasi** (laporan penemuan baru untuk di-*verify*/*reject*) dan **Klaim Menunggu** (laporan penemuan terverifikasi yang memiliki klaim pengguna dan menunggu diselesaikan admin). Item navigasi *Verifikasi Laporan* di sidebar menampilkan **badge angka** berisi total laporan yang butuh perhatian admin (perlu verifikasi + klaim menunggu).
- **Alur Klaim Barang**: Pengguna dapat mengajukan klaim atas laporan *Penemuan* dengan mengunggah bukti foto. Pengaju dapat membatalkan klaimnya sendiri, dan admin dapat **menolak** klaim — saat ditolak, klaim dihapus dan laporan kembali terbuka sehingga dapat diklaim ulang oleh siapa pun. Foto bukti ditampilkan penuh (tidak terpotong) di halaman detail.
- **Akses Admin yang Ditingkatkan**: Pada halaman *Kehilangan* dan *Penemuan*, admin memperoleh filter status penuh (Aktif, Menunggu Verifikasi, Selesai, Ditolak) serta dapat menyunting/menghapus laporan mana pun. Pengguna biasa hanya melihat status Aktif/Selesai (default **Aktif**).
- **Penyelesaian Laporan yang Ringkas**: Saat admin menyelesaikan laporan penemuan tanpa klaim (serah terima luring), formulir hanya meminta **nama** penerima dan **foto** bukti — tanpa nomor HP atau nomor identitas.
- **Sistem Notifikasi Berbasis Status**: Setiap aksi tercatat sebagai notifikasi, bukan sekadar toast sesaat — buat, sunting, hapus, verifikasi, tolak, klaim, batal klaim, tolak klaim, dan tandai selesai. Notifikasi memakai frasa berbasis status (mis. "Status laporan sudah diselesaikan") dan dikirim ke seluruh pihak terkait — pelapor, pengaju klaim, *dan* admin yang menyelesaikan (baik penyelesaian mandiri laporan *Kehilangan* maupun lewat klaim pada laporan *Penemuan*) — bukan hanya pelaku aksi. Tiap jenis punya warna/ikon khas; setelah dibaca, kartunya berubah abu-abu namun warna ikon tetap.
- **Notif Card Mengambang**: Seusai aksi, sebuah kartu notifikasi bergaya muncul di pojok kanan atas (mengganti toast statis), selaras dengan tampilan kartu di halaman notifikasi.
- **Tandai Dibaca Saat Diklik & Hapus Terbaca**: Notifikasi ditandai dibaca ketika kartunya diklik (bukan saat membuka halaman). Tersedia tombol **Tandai Semua Dibaca** dan **Hapus Terbaca** (dengan dialog konfirmasi); badge jumlah belum dibaca tersinkron di seluruh aplikasi.
- **Pencatatan Fasilitas Penitipan**: Laporan penemuan dilengkapi informasi fasilitas penitipan (contoh: Pos Satpam, TU Departemen) beserta alamat dan nomor kontaknya.
- **Timeline Riwayat Status**: Rekam jejak status transparan — siapa yang membuat, memverifikasi (Admin), hingga mengambil/menyelesaikan laporan.
- **Laporan Kehilangan Multi-Area**: Satu laporan *Kehilangan* dapat menjangkau beberapa area sekaligus untuk memperluas kemungkinan kecocokan.
- **Filter Searchable & Paginasi**: Filter area dan kategori memakai komponen *combobox* yang dapat dicari; daftar laporan responsif dengan paginasi (maks. 20 laporan per halaman).
- **Mode Gelap & Multi-Bahasa**: Mendukung dark mode dan dua bahasa (Indonesia/Inggris) lewat halaman Pengaturan maupun pintasan ikon di header desktop. Seluruh teks antarmuka, termasuk label aksesibilitas, melewati lapisan internasionalisasi (tanpa teks ter-hardcode).

## Siklus Status Laporan

| Status | Arti | Terlihat publik? |
| --- | --- | --- |
| `UNVERIFIED` | Laporan *Penemuan* baru, menunggu verifikasi admin | Hanya admin & pemilik laporan |
| `PUBLISHED` (Aktif) | Laporan aktif & tampil di daftar publik (Kehilangan langsung ke sini; Penemuan setelah diverifikasi) | Ya |
| `CLAIM_PENDING` (Klaim Tertunda) | Laporan *Penemuan* yang sedang diklaim seorang pengguna, menunggu admin menyelesaikan serah terima | Ya (filter "Klaim Tertunda") |
| `RESOLVED` (Selesai) | Barang sudah dikembalikan/diambil | Ya (filter "Selesai") |
| `REJECTED` (Ditolak) | Laporan penemuan ditolak admin | Hanya admin |

Laporan *Kehilangan* langsung berstatus `PUBLISHED` dan tidak pernah memakai `CLAIM_PENDING` (tak dapat diklaim). Laporan *Penemuan* dimulai dari `UNVERIFIED` → `PUBLISHED` (setelah diverifikasi, ikut Smart Match) → `CLAIM_PENDING` (saat diklaim) → `RESOLVED`. Membatalkan atau menolak klaim mengembalikan status ke `PUBLISHED` sehingga dapat diklaim ulang. `CLAIM_PENDING` adalah status nyata di basis data, bukan inferensi dari relasi klaim.

## Struktur Direktori Utama

Projek ini menggunakan **Next.js 16 (App Router)** dan **Prisma ORM**.

```text
src/
├── app/                  # Routing utama Next.js
│   ├── (auth)/           # Route untuk login & register (menggunakan layout khusus)
│   ├── (main)/           # Route untuk halaman utama pengguna (Dashboard, Laporan Saya, Detail, dsb.)
│   ├── admin/            # Route khusus panel admin (Verifikasi)
│   └── api/              # Route handlers untuk API pendukung (misal: upload gambar)
├── components/           # Komponen UI React
│   ├── shared/           # Komponen bisnis reusable (ReportCard, Timeline, FilterBar,
│   │                     #   VerificationTabs, NotifCardToast, NotifCardWrapper, dsb.)
│   └── ui/               # Komponen dasar (Button, Select, Combobox, Badge, Toast, TopNavbar, dsb.)
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

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Server Components)
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
npx prisma db seed
```

*Catatan: Akun Admin default yang dibuat oleh seeder adalah:*
- **Email:** `admin@its.ac.id`
- **Password:** `admin123`

### 4. Jalankan Development Server

```bash
npm run dev
```
