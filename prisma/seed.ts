/**
 * prisma/seed.ts
 * Populates master data: Categories, Areas, and Facilities.
 * Run with: npx prisma db seed
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const dbUrl = process.env["DATABASE_URL"] ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding master data...");

  // ─── 1. Categories ────────────────────────────────────────────────────────
  const categoryNames = [
    "Elektronik",
    "Dokumen Penting",
    "Kunci",
    "Dompet & Tas",
    "Botol Minum / Tumbler",
    "Pakaian & Aksesoris",
    "Alat Tulis & Buku",
    "Lainnya",
  ];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✔ ${categoryNames.length} categories seeded`);

  // ─── 2. Areas + Facilities ────────────────────────────────────────────────
  const areaData: {
    name: string;
    facility: { name: string; phone: string; address: string };
  }[] = [
    // A. Fasilitas Umum, Pusat, dan Teater
    {
      name: "Perpustakaan Pusat ITS",
      facility: {
        name: "Layanan Informasi Perpustakaan",
        phone: "(031) 5948348",
        address: "Lantai 1 Perpustakaan Pusat ITS",
      },
    },
    {
      name: "Masjid Manarul Ilmi",
      facility: {
        name: "Ruang Kesekretariatan Takmir",
        phone: "(031) 5994251",
        address: "Samping Kiri Masjid Manarul Ilmi",
      },
    },
    {
      name: "Graha Sepuluh Nopember (GSN)",
      facility: {
        name: "Pos Keamanan Pintu Utama GSN",
        phone: "(031) 5994251",
        address: "Pintu Utama Graha Sepuluh Nopember",
      },
    },
    {
      name: "Asrama Mahasiswa ITS",
      facility: {
        name: "Kantor Pengelola Asrama",
        phone: "(031) 5947274",
        address: "Gedung Utama Asrama ITS",
      },
    },
    {
      name: "Medical Center ITS",
      facility: {
        name: "Resepsionis Medical Center ITS",
        phone: "(031) 5966012",
        address: "Gedung Medical Center ITS",
      },
    },
    {
      name: "Area Teater A, B, dan C",
      facility: {
        name: "Pos Satpam di depan Teater A",
        phone: "(031) 5994251",
        address: "Depan Teater A ITS",
      },
    },
    {
      name: "MIPA Tower (Tower 1 ITS)",
      facility: {
        name: "Lobi Utama MIPA Tower",
        phone: "(031) 5943351",
        address: "Lantai Dasar MIPA Tower (Tower 1)",
      },
    },
    {
      name: "Tower 2 ITS",
      facility: {
        name: "Lobi Utama Tower 2",
        phone: "(031) 5994251",
        address: "Lantai Dasar Tower 2 ITS",
      },
    },

    // B. FTEIC
    {
      name: "Departemen Teknik Informatika",
      facility: {
        name: "Ruang Tata Usaha Teknik Informatika",
        phone: "(031) 5939214",
        address: "Gedung Teknik Informatika Lantai 2",
      },
    },
    {
      name: "Departemen Sistem Informasi",
      facility: {
        name: "Ruang Tata Usaha Sistem Informasi",
        phone: "(031) 5999944",
        address: "Gedung Sistem Informasi Lantai 1",
      },
    },
    {
      name: "Departemen Teknik Elektro",
      facility: {
        name: "Ruang Tata Usaha Teknik Elektro",
        phone: "(031) 5947302",
        address: "Gedung B Teknik Elektro Lantai 1",
      },
    },
    {
      name: "Departemen Teknik Biomedik",
      facility: {
        name: "Ruang Admin Teknik Biomedik",
        phone: "(031) 5947302",
        address: "Gedung Teknik Biomedik ITS",
      },
    },
    {
      name: "Departemen Teknik Komputer",
      facility: {
        name: "Ruang Tata Usaha Teknik Komputer",
        phone: "(031) 5939214",
        address: "Gedung Teknik Komputer ITS",
      },
    },
    {
      name: "Departemen Teknologi Informasi",
      facility: {
        name: "Ruang Admin Teknologi Informasi",
        phone: "(031) 5939214",
        address: "Gedung Teknologi Informasi ITS",
      },
    },

    // C. FTSPK
    {
      name: "Departemen Teknik Sipil",
      facility: {
        name: "Ruang Tata Usaha Teknik Sipil",
        phone: "(031) 5943353",
        address: "Gedung Teknik Sipil ITS",
      },
    },
    {
      name: "Departemen Arsitektur",
      facility: {
        name: "Ruang Tata Usaha Arsitektur",
        phone: "(031) 5927230",
        address: "Gedung Arsitektur ITS",
      },
    },
    {
      name: "Departemen Teknik Lingkungan",
      facility: {
        name: "Ruang Admin Teknik Lingkungan",
        phone: "(031) 5948886",
        address: "Gedung Teknik Lingkungan ITS",
      },
    },
    {
      name: "Departemen Perencanaan Wilayah dan Kota",
      facility: {
        name: "Ruang Tata Usaha PWK",
        phone: "(031) 5924068",
        address: "Gedung Perencanaan Wilayah dan Kota ITS",
      },
    },
    {
      name: "Departemen Teknik Geomatika",
      facility: {
        name: "Ruang Admin Teknik Geomatika",
        phone: "(031) 5929487",
        address: "Gedung Teknik Geomatika ITS",
      },
    },
    {
      name: "Departemen Teknik Geofisika",
      facility: {
        name: "Ruang Tata Usaha Teknik Geofisika",
        phone: "(031) 5929487",
        address: "Gedung Teknik Geofisika ITS",
      },
    },

    // D. FTIRS
    {
      name: "Departemen Teknik Mesin",
      facility: {
        name: "Ruang Tata Usaha Teknik Mesin",
        phone: "(031) 5946230",
        address: "Gedung Teknik Mesin ITS",
      },
    },
    {
      name: "Departemen Teknik Kimia",
      facility: {
        name: "Ruang Tata Usaha Teknik Kimia",
        phone: "(031) 5946240",
        address: "Gedung Teknik Kimia ITS",
      },
    },
    {
      name: "Departemen Teknik Fisika",
      facility: {
        name: "Ruang Tata Usaha Teknik Fisika",
        phone: "(031) 5947188",
        address: "Gedung Teknik Fisika ITS",
      },
    },
    {
      name: "Departemen Teknik Sistem dan Industri",
      facility: {
        name: "Ruang Admin Teknik Sistem dan Industri",
        phone: "(031) 5939361",
        address: "Gedung Teknik Sistem dan Industri ITS",
      },
    },
    {
      name: "Departemen Teknik Material dan Metalurgi",
      facility: {
        name: "Ruang Tata Usaha Teknik Material dan Metalurgi",
        phone: "(031) 5997026",
        address: "Gedung Teknik Material dan Metalurgi ITS",
      },
    },

    // E. FSAD
    {
      name: "Departemen Matematika",
      facility: {
        name: "Ruang Admin Matematika",
        phone: "(031) 5943354",
        address: "Gedung Matematika ITS",
      },
    },
    {
      name: "Departemen Statistika",
      facility: {
        name: "Ruang Tata Usaha Statistika",
        phone: "(031) 5943352",
        address: "Gedung Statistika ITS",
      },
    },
    {
      name: "Departemen Fisika",
      facility: {
        name: "Ruang Admin Fisika",
        phone: "(031) 5943351",
        address: "Gedung Fisika ITS",
      },
    },
    {
      name: "Departemen Kimia",
      facility: {
        name: "Ruang Tata Usaha Kimia",
        phone: "(031) 5943353",
        address: "Gedung Kimia ITS",
      },
    },
    {
      name: "Departemen Biologi",
      facility: {
        name: "Ruang Admin Biologi",
        phone: "(031) 5963857",
        address: "Gedung Biologi ITS",
      },
    },

    // F. FTK
    {
      name: "Departemen Teknik Perkapalan",
      facility: {
        name: "Ruang Tata Usaha Teknik Perkapalan",
        phone: "(031) 5928105",
        address: "Gedung W Teknik Perkapalan ITS",
      },
    },
    {
      name: "Departemen Teknik Sistem Perkapalan",
      facility: {
        name: "Ruang Admin Teknik Sistem Perkapalan",
        phone: "(031) 5928105",
        address: "Gedung Teknik Sistem Perkapalan ITS",
      },
    },
    {
      name: "Departemen Teknik Kelautan",
      facility: {
        name: "Ruang Tata Usaha Teknik Kelautan",
        phone: "(031) 5928105",
        address: "Gedung Teknik Kelautan ITS",
      },
    },

    // G. FDKBD
    {
      name: "Departemen Desain Produk",
      facility: {
        name: "Ruang Tata Usaha Desain Produk",
        phone: "(031) 5930204",
        address: "Gedung Desain Produk ITS",
      },
    },
    {
      name: "Departemen Desain Interior",
      facility: {
        name: "Ruang Admin Desain Interior",
        phone: "(031) 5930204",
        address: "Gedung Desain Interior ITS",
      },
    },
    {
      name: "Departemen Manajemen Bisnis",
      facility: {
        name: "Ruang Tata Usaha Manajemen Bisnis",
        phone: "(031) 5918363",
        address: "Gedung Manajemen Bisnis ITS",
      },
    },

    // H. FKK & Vokasi
    {
      name: "Fakultas Kedokteran dan Kesehatan",
      facility: {
        name: "Resepsionis FKK ITS",
        phone: "(031) 5994251",
        address: "Gedung Fakultas Kedokteran dan Kesehatan ITS",
      },
    },
    {
      name: "Fakultas Vokasi ITS",
      facility: {
        name: "Ruang Tata Usaha Vokasi",
        phone: "(031) 5994251",
        address: "Gedung Fakultas Vokasi ITS",
      },
    },
  ];

  for (const { name, facility } of areaData) {
    const area = await prisma.area.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    // Each area has exactly one facility (the drop-off point)
    const existingFacility = await prisma.facility.findFirst({
      where: { areaId: area.id, name: facility.name },
    });

    if (!existingFacility) {
      await prisma.facility.create({
        data: {
          name: facility.name,
          phone: facility.phone,
          address: facility.address,
          areaId: area.id,
        },
      });
    }
  }
  console.log(`  ✔ ${areaData.length} areas + facilities seeded`);

  // ─── 3. Admin Test Accounts ────────────────────────────────────────────────
  const adminAccounts = [
    {
      name: "Admin ITS Default",
      email: "admin@its.ac.id",
      password: "admin123",
    },
    {
      name: "Admin ITS 1",
      email: "admin1@its.ac.id",
      password: "admin123",
    },
    {
      name: "Admin ITS 2",
      email: "admin2@its.ac.id",
      password: "admin123",
    },
  ];

  for (const admin of adminAccounts) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  }
  console.log(`  ✔ ${adminAccounts.length} admin accounts seeded`);
  console.log("     📧 admin1@its.ac.id  |  password: admin123");
  console.log("     📧 admin2@its.ac.id  |  password: admin123");

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
