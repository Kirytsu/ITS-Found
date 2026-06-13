/**
 * src/lib/i18n/dictionaries.ts
 * Flat key → string maps for each locale + a pure translate() with {param} support.
 * Add a key to BOTH `id` and `en`. Missing keys fall back to id, then the key itself.
 */
import type { Locale } from "./config";

type Dict = Record<string, string>;

const id: Dict = {
  // ── Common ──
  "common.detail": "Lihat Detail",
  "common.seeAll": "Lihat semua",
  "common.showMore": "Tampilkan lebih",
  "common.cancel": "Batal",
  "common.report": "Lapor",
  "common.loading": "Memuat...",
  "common.processing": "Memproses...",

  // ── Nav ──
  "nav.dashboard": "Dashboard",
  "nav.verify": "Verifikasi Laporan",
  "nav.section.reports": "Laporan",
  "nav.section.report": "Lapor",
  "nav.lost": "Kehilangan",
  "nav.found": "Penemuan",
  "nav.myReports": "Laporan Saya",
  "nav.reportLost": "Lapor Kehilangan",
  "nav.reportFound": "Lapor Penemuan",
  "nav.profile": "Profil Saya",
  "nav.notifications": "Notifikasi",
  "nav.settings": "Pengaturan",
  "nav.logout": "Keluar",
  "nav.viewProfile": "Lihat profil",
  "nav.greeting": "Halo, {name}",
  "nav.tagline": "Sistem Penemuan Barang ITS",
  "nav.unread": "{count} notifikasi belum dibaca",
  "nav.registeredAs": "Terdaftar sebagai",

  // ── Dashboard ──
  "dashboard.kicker": "Institut Teknologi Sepuluh Nopember",
  "dashboard.heroTitle": "Menemukan atau Kehilangan Barang?",
  "dashboard.heroSubtitle": "ITS Found menghubungkan laporan kehilangan dan penemuan barang di lingkungan kampus ITS, agar barang yang hilang dapat kembali ke pemiliknya.",
  "dashboard.cardReportLostDesc": "Buat laporan jika barangmu hilang di area kampus.",
  "dashboard.cardReportFoundDesc": "Buat laporan jika kamu menemukan barang milik orang lain.",
  "dashboard.cardBrowseLostDesc": "Lihat semua laporan kehilangan dari pengguna lain.",
  "dashboard.cardBrowseFoundDesc": "Lihat semua barang temuan yang sudah diverifikasi.",
  "dashboard.recentLost": "Laporan kehilangan terbaru",
  "dashboard.recentFound": "Laporan penemuan terbaru",
  "dashboard.emptyLost": "Belum ada laporan kehilangan.",
  "dashboard.emptyFound": "Belum ada laporan penemuan.",

  // ── List pages ──
  "page.lost.title": "Laporan Kehilangan",
  "page.found.title": "Laporan Penemuan",
  "page.myReports.title": "Laporan Saya",
  "list.empty": "Tidak ada laporan yang ditemukan.",
  "myReports.empty": "Anda belum membuat laporan apa pun.",

  // ── Filter ──
  "filter.allAreas": "Semua Area",
  "filter.allTypes": "Semua Jenis",
  "filter.allStatus": "Semua Status",
  "filter.search": "Cari laporan...",
  "filter.dateRange.invalid": "Tanggal mulai tidak boleh setelah tanggal akhir.",

  // ── Status / Type ──
  "status.active": "Aktif",
  "status.unverified": "Menunggu Verifikasi",
  "status.resolved": "Selesai",
  "status.rejected": "Ditolak",
  "status.claimed": "Sudah Diklaim",
  "type.lost": "Kehilangan",
  "type.found": "Penemuan",

  // ── Form ──
  "typeword.lost": "kehilangan",
  "typeword.found": "penemuan",
  "form.itemName": "Nama Barang",
  "form.itemName.ph": "Nama barang yang {type}",
  "form.area": "Area",
  "form.area.multiPh": "Pilih satu atau lebih area",
  "form.area.multiHelp": "Pilih semua area yang mungkin menjadi lokasi kehilangan",
  "form.area.ph": "Pilih Area",
  "form.category": "Kategori",
  "form.category.ph": "Pilih Jenis",
  "form.facility": "Fasilitas Penitipan",
  "form.facility.ph": "Pilih Fasilitas",
  "form.facility.phNoArea": "Pilih area terlebih dahulu",
  "form.facility.help": "Fasilitas tempat barang dititipkan",
  "form.description": "Deskripsi",
  "form.description.ph": "Deskripsi barang yang {type} secara lengkap",
  "form.description.help": "Masukkan deskripsi barang yang {type} selengkapnya",
  "form.date": "Tanggal Kejadian",
  "form.date.help": "Perkiraan tanggal {type} (tidak boleh di masa depan)",
  "form.location": "Lokasi Kejadian",
  "form.location.ph": "Contoh: Lab 301, Koridor Lantai 2",
  "form.location.help": "Perkiraan lokasi {type}",
  "form.photo": "Foto Barang",
  "form.photo.help": "Foto akan membantu identifikasi barang (opsional)",
  "form.submit.create": "Laporkan",
  "form.submit.save": "Simpan Perubahan",
  "form.err.dateRequired": "Tanggal kejadian wajib diisi.",
  "form.err.dateFuture": "Tanggal kejadian tidak boleh di masa depan.",
  "form.err.areaRequired": "Area wajib dipilih.",
  "form.err.generic": "Terjadi kesalahan. Coba lagi.",

  // ── Detail / Meta ──
  "detail.pageTitle": "Detail Laporan",
  "meta.status": "Status",
  "meta.caseType": "Jenis Kasus",
  "meta.itemType": "Jenis Barang",
  "meta.incidentDate": "Tanggal Kejadian",
  "meta.locationDetail": "Lokasi Detail",
  "meta.description": "Deskripsi",
  "meta.area": "Area",
  "meta.areaMulti": "Area (beberapa)",
  "meta.facility": "Fasilitas Penitipan",
  "meta.facilityAddress": "Alamat Fasilitas",
  "meta.facilityPhone": "Telepon Fasilitas",

  // ── Detail actions / modals ──
  "action.resolve": "Selesai",
  "action.edit": "Ubah",
  "action.delete": "Hapus",
  "action.claim": "Klaim Barang",
  "action.cancelClaim": "Batalkan Klaim",
  "action.deleting": "Menghapus...",
  "action.cancelling": "Membatalkan...",
  "modal.delete.title": "Hapus Laporan?",
  "modal.delete.body": "Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara permanen dari sistem.",
  "modal.delete.confirm": "Ya, Hapus",
  "modal.cancelClaim.title": "Batalkan Klaim?",
  "modal.cancelClaim.body": "Apakah Anda yakin ingin membatalkan klaim untuk barang ini? Laporan ini akan terbuka kembali untuk diklaim oleh pengguna lain.",
  "modal.cancelClaim.confirm": "Ya, Batalkan",
  "modal.claim.title": "Klaim Barang",
  "modal.claim.body": "Ajukan klaim kepemilikan barang ini. Pastikan Anda mengunggah bukti valid.",
  "modal.claim.submit": "Ajukan Klaim",
  "modal.resolve.title": "Tandai Selesai?",
  "modal.resolve.confirm": "Ya, Selesai",
  "modal.photoProof": "Foto Bukti",
  "modal.notesOptional": "Catatan Tambahan (Opsional)",

  // ── Notifications ──
  "notif.title": "Notifikasi",
  "notif.empty.title": "Tidak ada notifikasi",
  "notif.empty.subtitle": "Anda akan menerima notifikasi ketika ada laporan yang cocok",
  "notif.justNow": "Baru saja",
  "notif.minsAgo": "{n} menit yang lalu",
  "notif.hoursAgo": "{n} jam yang lalu",
  "notif.daysAgo": "{n} hari yang lalu",
  "notif.action.claimCancelled": "Klaim dibatalkan",
  "notif.action.readyPickup": "Barang siap diambil",
  "notif.action.verified": "Laporan terverifikasi",
  "notif.action.claimSubmitted": "Ada klaim baru",
  "notif.action.claimToResolve": "Klaim menunggu diselesaikan",
  "notif.action.newFoundReport": "Laporan penemuan baru",
  "notif.action.match": "Ditemukan laporan yang cocok",

  // ── Settings ──
  "settings.title": "Pengaturan",
  "settings.theme": "Tema",
  "settings.theme.light": "Mode Terang",
  "settings.theme.dark": "Mode Gelap",
  "settings.language": "Bahasa",
  "settings.about": "Tentang Aplikasi",
  "settings.about.name": "ITS Found",
  "settings.about.desc": "Sistem Penemuan Barang Hilang ITS",
  "settings.about.version": "Versi 1.0.0",

  // ── Auth ──
  "auth.tagline": "Sistem Penemuan Barang Hilang ITS",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.password.ph": "Masukkan password",
  "auth.login.submit": "Masuk",
  "auth.login.noAccount": "Belum punya akun?",
  "auth.login.register": "Daftar",
  "auth.register.name": "Nama Lengkap",
  "auth.register.name.ph": "Nama Anda",
  "auth.register.password.ph": "Minimal 6 karakter",
  "auth.register.submit": "Daftar",
  "auth.register.hasAccount": "Sudah punya akun?",
  "auth.register.login": "Masuk",

  // ── Profile ──
  "profile.title": "Profil Saya",
  "profile.role.admin": "Administrator",
  "profile.role.user": "Pengguna",
  "profile.email": "Email",
  "profile.joined": "Bergabung sejak",
  "profile.totalReports": "Total Laporan",
  "profile.unread": "Notifikasi Belum Dibaca",
  "profile.viewAllReports": "Lihat Semua Laporan",
  "profile.viewNotifications": "Lihat Notifikasi",

  // ── Matched reports ──
  "matched.banner": "Ditemukan {count} laporan yang mungkin cocok!",
  "matched.title": "Laporan yang Mungkin Cocok",
};

const en: Dict = {
  // ── Common ──
  "common.detail": "View Details",
  "common.seeAll": "See all",
  "common.showMore": "Show more",
  "common.cancel": "Cancel",
  "common.report": "Report",
  "common.loading": "Loading...",
  "common.processing": "Processing...",

  // ── Nav ──
  "nav.dashboard": "Dashboard",
  "nav.verify": "Verify Reports",
  "nav.section.reports": "Reports",
  "nav.section.report": "Submit",
  "nav.lost": "Lost",
  "nav.found": "Found",
  "nav.myReports": "My Reports",
  "nav.reportLost": "Report Lost",
  "nav.reportFound": "Report Found",
  "nav.profile": "My Profile",
  "nav.notifications": "Notifications",
  "nav.settings": "Settings",
  "nav.logout": "Log Out",
  "nav.viewProfile": "View profile",
  "nav.greeting": "Hi, {name}",
  "nav.tagline": "ITS Lost & Found System",
  "nav.unread": "{count} unread notifications",
  "nav.registeredAs": "Signed in as",

  // ── Dashboard ──
  "dashboard.kicker": "Institut Teknologi Sepuluh Nopember",
  "dashboard.heroTitle": "Found or Lost Something?",
  "dashboard.heroSubtitle": "ITS Found connects lost and found item reports across the ITS campus, helping lost items find their way back to their owners.",
  "dashboard.cardReportLostDesc": "Report an item you lost somewhere on campus.",
  "dashboard.cardReportFoundDesc": "Report an item you found that belongs to someone else.",
  "dashboard.cardBrowseLostDesc": "Browse all lost item reports from other users.",
  "dashboard.cardBrowseFoundDesc": "Browse all verified found items.",
  "dashboard.recentLost": "Recent lost reports",
  "dashboard.recentFound": "Recent found reports",
  "dashboard.emptyLost": "No lost reports yet.",
  "dashboard.emptyFound": "No found reports yet.",

  // ── List pages ──
  "page.lost.title": "Lost Reports",
  "page.found.title": "Found Reports",
  "page.myReports.title": "My Reports",
  "list.empty": "No reports found.",
  "myReports.empty": "You haven't created any reports yet.",

  // ── Filter ──
  "filter.allAreas": "All Areas",
  "filter.allTypes": "All Categories",
  "filter.allStatus": "All Statuses",
  "filter.search": "Search reports...",
  "filter.dateRange.invalid": "Start date cannot be after end date.",

  // ── Status / Type ──
  "status.active": "Active",
  "status.unverified": "Awaiting Verification",
  "status.resolved": "Resolved",
  "status.rejected": "Rejected",
  "status.claimed": "Claimed",
  "type.lost": "Lost",
  "type.found": "Found",

  // ── Form ──
  "typeword.lost": "lost",
  "typeword.found": "found",
  "form.itemName": "Item Name",
  "form.itemName.ph": "Name of the {type} item",
  "form.area": "Area",
  "form.area.multiPh": "Select one or more areas",
  "form.area.multiHelp": "Select every area where it might have been lost",
  "form.area.ph": "Select Area",
  "form.category": "Category",
  "form.category.ph": "Select Category",
  "form.facility": "Drop-off Facility",
  "form.facility.ph": "Select Facility",
  "form.facility.phNoArea": "Select an area first",
  "form.facility.help": "Where the item is kept",
  "form.description": "Description",
  "form.description.ph": "Full description of the {type} item",
  "form.description.help": "Describe the {type} item as completely as possible",
  "form.date": "Date of Incident",
  "form.date.help": "Approximate {type} date (cannot be in the future)",
  "form.location": "Incident Location",
  "form.location.ph": "e.g. Lab 301, 2nd Floor Corridor",
  "form.location.help": "Approximate {type} location",
  "form.photo": "Item Photo",
  "form.photo.help": "A photo helps identify the item (optional)",
  "form.submit.create": "Submit Report",
  "form.submit.save": "Save Changes",
  "form.err.dateRequired": "Date of incident is required.",
  "form.err.dateFuture": "Date of incident cannot be in the future.",
  "form.err.areaRequired": "Area is required.",
  "form.err.generic": "Something went wrong. Please try again.",

  // ── Detail / Meta ──
  "detail.pageTitle": "Report Details",
  "meta.status": "Status",
  "meta.caseType": "Case Type",
  "meta.itemType": "Item Type",
  "meta.incidentDate": "Date of Incident",
  "meta.locationDetail": "Location Detail",
  "meta.description": "Description",
  "meta.area": "Area",
  "meta.areaMulti": "Areas (multiple)",
  "meta.facility": "Drop-off Facility",
  "meta.facilityAddress": "Facility Address",
  "meta.facilityPhone": "Facility Phone",

  // ── Detail actions / modals ──
  "action.resolve": "Resolve",
  "action.edit": "Edit",
  "action.delete": "Delete",
  "action.claim": "Claim Item",
  "action.cancelClaim": "Cancel Claim",
  "action.deleting": "Deleting...",
  "action.cancelling": "Cancelling...",
  "modal.delete.title": "Delete Report?",
  "modal.delete.body": "This action cannot be undone. The report will be permanently removed from the system.",
  "modal.delete.confirm": "Yes, Delete",
  "modal.cancelClaim.title": "Cancel Claim?",
  "modal.cancelClaim.body": "Are you sure you want to cancel your claim on this item? The report will reopen for other users to claim.",
  "modal.cancelClaim.confirm": "Yes, Cancel",
  "modal.claim.title": "Claim Item",
  "modal.claim.body": "Submit a claim of ownership for this item. Make sure you upload valid proof.",
  "modal.claim.submit": "Submit Claim",
  "modal.resolve.title": "Mark as Resolved?",
  "modal.resolve.confirm": "Yes, Resolve",
  "modal.photoProof": "Proof Photo",
  "modal.notesOptional": "Additional Notes (Optional)",

  // ── Notifications ──
  "notif.title": "Notifications",
  "notif.empty.title": "No notifications",
  "notif.empty.subtitle": "You'll be notified when a matching report appears",
  "notif.justNow": "Just now",
  "notif.minsAgo": "{n} minutes ago",
  "notif.hoursAgo": "{n} hours ago",
  "notif.daysAgo": "{n} days ago",
  "notif.action.claimCancelled": "Claim cancelled",
  "notif.action.readyPickup": "Item ready for pickup",
  "notif.action.verified": "Report verified",
  "notif.action.claimSubmitted": "New claim received",
  "notif.action.claimToResolve": "Claim awaiting resolution",
  "notif.action.newFoundReport": "New found-item report",
  "notif.action.match": "Matching report found",

  // ── Settings ──
  "settings.title": "Settings",
  "settings.theme": "Theme",
  "settings.theme.light": "Light Mode",
  "settings.theme.dark": "Dark Mode",
  "settings.language": "Language",
  "settings.about": "About",
  "settings.about.name": "ITS Found",
  "settings.about.desc": "ITS Lost & Found System",
  "settings.about.version": "Version 1.0.0",

  // ── Auth ──
  "auth.tagline": "ITS Lost & Found System",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.password.ph": "Enter your password",
  "auth.login.submit": "Sign In",
  "auth.login.noAccount": "Don't have an account?",
  "auth.login.register": "Register",
  "auth.register.name": "Full Name",
  "auth.register.name.ph": "Your name",
  "auth.register.password.ph": "At least 6 characters",
  "auth.register.submit": "Register",
  "auth.register.hasAccount": "Already have an account?",
  "auth.register.login": "Sign In",

  // ── Profile ──
  "profile.title": "My Profile",
  "profile.role.admin": "Administrator",
  "profile.role.user": "User",
  "profile.email": "Email",
  "profile.joined": "Member since",
  "profile.totalReports": "Total Reports",
  "profile.unread": "Unread Notifications",
  "profile.viewAllReports": "View All Reports",
  "profile.viewNotifications": "View Notifications",

  // ── Matched reports ──
  "matched.banner": "Found {count} possibly matching report(s)!",
  "matched.title": "Possible Matches",
};

export const dictionaries: Record<Locale, Dict> = { id, en };

export type Translator = (key: string, params?: Record<string, string | number>) => string;

/** Pure translate — no React/context needed. Falls back id → key. */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] ?? dictionaries.id;
  let str = dict[key] ?? dictionaries.id[key] ?? key;
  if (params) {
    for (const p of Object.keys(params)) {
      str = str.replace(new RegExp(`\\{${p}\\}`, "g"), String(params[p]));
    }
  }
  return str;
}

/** Bind a translator to a locale. */
export function getTranslator(locale: Locale): Translator {
  return (key, params) => translate(locale, key, params);
}
