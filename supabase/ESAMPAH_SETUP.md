# Setup Awal E-Sampah Sukolilo

Aplikasi E-Sampah memakai akun autentikasi khusus aplikasi. Akun SIMPeL tidak otomatis dapat masuk ke E-Sampah. Data nama, jabatan, dan unit pegawai direferensikan melalui `public.staff_master`.

## 1. Buat akun Admin Kecamatan pertama

Langkah ini hanya dilakukan sekali karena belum ada akun E-Sampah pertama yang dapat mengelola akun lain.

1. Buka Supabase Dashboard project `dibpprnbcgoxepaljyds`.
2. Buka **Authentication → Users → Add user**.
3. Buat user dengan email internal sesuai username, misalnya `admin_sukolilo@login.esampah.sukolilo.online`. Tandai email sebagai confirmed dan tetapkan password awal.
4. Ambil UUID user yang baru dibuat.
5. Ambil UUID pegawai yang akan menjadi Admin Kecamatan dari master SDM:

```sql
select id, nama, jabatan, unit_kerja
from public.staff_master
where aktif = true and deleted_at is null
order by nama;
```

6. Jalankan SQL berikut dengan mengganti tiga nilai placeholder:

```sql
insert into public.esampah_petugas
  (auth_user_id, staff_master_id, username, role, unit_id, aktif)
select
  'UUID_AUTH_USER'::uuid,
  'UUID_STAFF_MASTER'::uuid,
  'admin_sukolilo',
  'admin_kecamatan',
  u.id,
  true
from public.esampah_unit u
where u.kode = 'KEC-SUKOLILO';
```

Pastikan hasil insert satu baris. Setelah itu Admin Kecamatan dapat login ke aplikasi.

## 2. Membuat akun berikutnya

Setelah login sebagai Admin Kecamatan:
1. Buka **Lainnya → Manajemen Akun E-Sampah**.
2. Pilih pegawai dari master SDM, peran, dan unit operasional.
3. Buat username dan password awal (minimal 10 karakter).
4. Berikan kredensial kepada petugas melalui kanal internal yang aman.

Username login menggunakan alias internal `username@login.esampah.sukolilo.online`. Petugas cukup memasukkan username dan password pada layar login E-Sampah.

## 3. Cakupan peran

- **Admin Kecamatan:** memantau seluruh unit; transaksi hanya pada Bank Sampah Kantor Kecamatan.
- **Admin Kelurahan:** memantau seluruh unit RW di kelurahannya; transaksi hanya pada Bank Sampah Kelurahan.
- **Petugas RW:** hanya melihat dan mencatat transaksi pada unit RW yang ditugaskan.
- **Pimpinan:** akses pantau saja, tanpa pencatatan transaksi.

Unit kecamatan dan 7 unit kelurahan dibuat dari master kelurahan. Unit RW diinisialisasi dari 67 pasangan kelurahan/RW yang tercatat pada akun operator RW SIMPeL. Akun E-Sampah tetap dibuat terpisah dan tidak menggunakan kredensial SIMPeL.

## 4. Mekanisme setoran

Satu kali simpan setoran membuat satu batch, satu baris transaksi per subjenis, dan satu baris mutasi per transaksi. Saldo nasabah bertambah langsung dalam transaksi database yang sama. Jika salah satu langkah gagal, seluruh batch dibatalkan. Kunci permintaan mencegah submit ulang yang sama menambah saldo dua kali.

Semua harga jenis sampah saat ini masih Rp0. Setelah login sebagai Admin Kecamatan, buka menu Harga Sampah lalu gunakan tombol Ubah pada tiap jenis untuk menetapkan harga per kg. Aplikasi menolak transaksi dengan harga nol dan tidak memakai harga contoh pada tampilan.

## 5. Catatan keamanan

- Password hanya diproses oleh Supabase Auth dan tidak disimpan pada tabel aplikasi.
- Service-role key hanya digunakan di Edge Function, tidak dikirim ke browser.
- Row Level Security membatasi data berdasarkan peran dan unit.
- Perubahan ini berada di branch pengembangan `feature/fresh-eco-modern`; belum dipromosikan ke production Netlify.
