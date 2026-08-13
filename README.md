# Penyusun Menu SPPG

Prototipe perangkat lunak perencanaan menu dan kebutuhan bahan untuk Satuan Pelayanan Pemenuhan Gizi. Dibangun untuk GEMASTIK 2026, Divisi VIII — Pengembangan Perangkat Lunak.

## Menjalankan

Buka `index.html` di peramban. Tidak ada proses build, tidak ada dependensi yang perlu dipasang, dan aplikasi tetap berjalan tanpa koneksi internet (hanya font web yang gagal dimuat, dan sudah disediakan font cadangan).

## Struktur berkas

| Berkas | Isi |
|---|---|
| `data.js` | Basis data bahan pangan, acuan AKG per jenjang, dan parameter takaran. **Seluruh angka di berkas ini wajib diverifikasi.** |
| `mesin-menu.js` | Logika penyusunan menu. Tidak menyentuh tampilan sama sekali. |
| `index.html` | Antarmuka dan tampilan hasil. Tidak melakukan perhitungan gizi. |

Pemisahan ini disengaja: saat juri meminta pembuktian pada source code, logika perhitungan dapat ditunjukkan tanpa harus menelusuri kode tampilan.

## Cara kerja penyusunan menu

Pendekatan berbasis aturan dengan penyesuaian iteratif, bukan optimasi matematis.

1. Target satu kali makan dihitung sebagai persentase dari AKG jenjang penerima.
2. Komponen tiap sekat nampan dipilih bergiliran dari bahan yang tersedia, sehingga menu tidak berulang selama pilihan bahan mencukupi.
3. Takaran awal tiap komponen dihitung dari kepadatan energi bahannya, mengikuti prinsip bahan makanan penukar. Satu porsi singkong dan satu porsi nasi berbeda beratnya tetapi setara energinya.
4. Sistem menghitung total gizi dan biaya, lalu mengevaluasinya terhadap target gizi dan batas anggaran.
5. Jika ada yang meleset, sistem menyesuaikan takaran dalam batas wajar. Jika anggaran masih terlampaui setelah takaran mencapai batas bawah, komponen termahal diganti alternatif yang lebih murah dalam kelompok yang sama.
6. Kebutuhan bahan lima hari dijumlahkan menjadi satu daftar belanja, dihitung dari berat kotor sebelum penyiangan.

Seluruh proses deterministik. Input yang sama selalu menghasilkan menu yang sama — disengaja agar hasil dapat direproduksi dan diverifikasi.

Setiap hasil disertai panel "Cara sistem menyusun menu ini" yang menjelaskan keputusan yang diambil, termasuk penggantian bahan yang dilakukan dan jumlah putaran penyesuaian.

## Menerbitkan ke web

Aplikasi ini sepenuhnya statis. Untuk mendapatkan URL aktif yang bisa dicantumkan di berkas lomba:

1. Buat repositori di GitHub, unggah ketiga berkas.
2. Buka vercel.com, hubungkan repositori, deploy. Tidak perlu konfigurasi apa pun.
3. Uji URL hasilnya dari perangkat lain dan mode penyamaran sebelum dicantumkan.

Alternatif tanpa repositori: seret folder ini ke netlify.com/drop.

## Yang wajib dikerjakan tim sebelum submit

**Verifikasi data — ini yang paling menentukan.**

- [ ] Cocokkan setiap nilai gizi di `data.js` dengan Tabel Komposisi Pangan Indonesia. Perbaiki yang meleset.
- [ ] Isi `SUMBER_TKPI` dengan edisi dan tahun TKPI yang dipakai.
- [ ] Cocokkan nilai AKG dengan Permenkes yang berlaku, isi `SUMBER_AKG`.
- [ ] Ganti harga bahan dengan hasil survei pasar sendiri atau data harga pangan resmi, isi `SUMBER_HARGA` beserta tanggalnya.
- [ ] Periksa persentase kontribusi gizi satu kali makan terhadap petunjuk teknis yang berlaku.

**Pemahaman kode.**

- [ ] Setiap anggota tim membaca `mesin-menu.js` sampai bisa menjelaskan alurnya tanpa membaca. Di babak final, bobot tanya jawab 45% dan juri berhak meminta pembuktian pada source code.
- [ ] Sederhanakan bagian mana pun yang tidak dipahami tim. Kecanggihan yang tidak bisa dipertanggungjawabkan lebih merugikan daripada kesederhanaan yang dikuasai.

**Kelengkapan lomba.**

- [ ] Riwayat commit yang runut di GitHub — ini bukti bobot Proses Pengembangan 20%.
- [ ] Tangkapan layar untuk Bab 7 proposal.
- [ ] Uji coba dengan calon pengguna nyata, catat hasilnya untuk Bab 9 dan 11.
- [ ] Daftar komponen pihak ketiga: aplikasi ini tidak memakai library eksternal apa pun. Cantumkan itu apa adanya — nol dependensi adalah keunggulan, bukan kekurangan.

## Batasan yang diketahui

- Perhitungan tidak memperhitungkan penyusutan zat gizi akibat pengolahan.
- Zat gizi mikro belum diperhitungkan; baru energi, protein, lemak, dan karbohidrat.
- Faktor susut bahan bersifat perkiraan dan perlu disesuaikan dengan praktik dapur setempat.
- Sistem tidak menggantikan penilaian ahli gizi. Keluarannya adalah rancangan yang tetap memerlukan verifikasi manusia.

Nyatakan seluruh batasan ini di Bab 3 proposal. Keterbatasan yang diakui menunjukkan kesadaran metodologis; keterbatasan yang disembunyikan akan ditemukan juri.
