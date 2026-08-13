/* =====================================================================
   SUMBER DATA — WAJIB DIVERIFIKASI TIM SEBELUM SUBMIT
   ---------------------------------------------------------------------
   1. Nilai gizi (per 100 gram bahan mentah, bagian dapat dimakan)
      Acuan: Tabel Komposisi Pangan Indonesia (TKPI), Kementerian Kesehatan.
      >> Angka di bawah adalah NILAI ACUAN AWAL. Buka TKPI edisi terbaru,
         cocokkan satu per satu, perbaiki yang meleset, lalu hapus
         komentar ini dan catat edisi/tahun TKPI yang dipakai.

   2. Angka Kecukupan Gizi (AKG)
      Acuan: Peraturan Menteri Kesehatan tentang Angka Kecukupan Gizi.
      >> Isi nomor dan tahun peraturannya di konstanta SUMBER_AKG.

   3. Harga bahan
      >> Ganti dengan hasil survei pasar sendiri atau data harga pangan
         resmi. Catat tanggal pengambilan data di konstanta SUMBER_HARGA.

   Jangan biarkan satu pun nilai di berkas ini tidak terverifikasi.
   Di babak final, juri berhak menanyakan asal setiap angka.
   ===================================================================== */

const SUMBER_TKPI  = 'Tabel Komposisi Pangan Indonesia (TKPI), Kementerian Kesehatan Republik Indonesia';
const SUMBER_AKG   = 'Peraturan Menteri Kesehatan RI No. 28 Tahun 2019 tentang Angka Kecukupan Gizi yang Dianjurkan untuk Masyarakat Indonesia';
const SUMBER_HARGA = 'Panel Harga Eceran Badan Pangan Nasional (BAPANAS) / SP2KP Kementerian Perdagangan RI (Agustus 2026)';

/* ---------------------------------------------------------------------
   BAHAN PANGAN
   kal / prot / lemak / karbo  = per 100 g bahan mentah
   harga                       = rupiah per kilogram
   susut                       = faktor kehilangan berat saat penyiangan
                                 (1.00 = tidak ada bagian terbuang)
   --------------------------------------------------------------------- */
const BAHAN = [
  // --- Sumber karbohidrat ---
  { id:'beras',    nama:'Beras putih',      grup:'karbo',   kal:360, prot:6.8,  lemak:0.7,  karbo:78.9, harga:14000, susut:1.00 },
  { id:'jagung',   nama:'Jagung manis',     grup:'karbo',   kal:108, prot:4.1,  lemak:1.3,  karbo:25.0, harga:9000,  susut:1.35 },
  { id:'singkong', nama:'Singkong',         grup:'karbo',   kal:154, prot:1.0,  lemak:0.3,  karbo:36.8, harga:6000,  susut:1.20 },
  { id:'ubi',      nama:'Ubi jalar',        grup:'karbo',   kal:119, prot:1.8,  lemak:0.7,  karbo:27.9, harga:8000,  susut:1.15 },
  { id:'kentang',  nama:'Kentang',          grup:'karbo',   kal:83,  prot:2.0,  lemak:0.1,  karbo:19.1, harga:14000, susut:1.15 },
  { id:'bihun',    nama:'Bihun kering',     grup:'karbo',   kal:360, prot:4.7,  lemak:0.1,  karbo:82.1, harga:22000, susut:1.00 },

  // --- Protein hewani ---
  { id:'telur',    nama:'Telur ayam',       grup:'hewani',  kal:154, prot:12.4, lemak:10.8, karbo:0.7,  harga:29000, susut:1.12 },
  { id:'ayam',     nama:'Daging ayam',      grup:'hewani',  kal:298, prot:18.2, lemak:25.0, karbo:0.0,  harga:38000, susut:1.25 },
  { id:'lele',     nama:'Ikan lele',        grup:'hewani',  kal:84,  prot:14.8, lemak:2.3,  karbo:0.0,  harga:26000, susut:1.35 },
  { id:'kembung',  nama:'Ikan kembung',     grup:'hewani',  kal:103, prot:22.0, lemak:1.0,  karbo:0.0,  harga:38000, susut:1.30 },
  { id:'tongkol',  nama:'Ikan tongkol',     grup:'hewani',  kal:100, prot:13.7, lemak:1.5,  karbo:0.0,  harga:32000, susut:1.25 },
  { id:'sapi',     nama:'Daging sapi',      grup:'hewani',  kal:207, prot:18.8, lemak:14.0, karbo:0.0,  harga:135000,susut:1.10 },

  // --- Protein nabati ---
  { id:'tahu',     nama:'Tahu',             grup:'nabati',  kal:80,  prot:10.9, lemak:4.7,  karbo:0.8,  harga:12000, susut:1.00 },
  { id:'tempe',    nama:'Tempe',            grup:'nabati',  kal:201, prot:20.8, lemak:8.8,  karbo:13.5, harga:14000, susut:1.00 },
  { id:'kchijau',  nama:'Kacang hijau',     grup:'nabati',  kal:323, prot:22.2, lemak:1.2,  karbo:62.9, harga:26000, susut:1.00 },
  { id:'kcmerah',  nama:'Kacang merah',     grup:'nabati',  kal:336, prot:23.1, lemak:1.7,  karbo:59.5, harga:28000, susut:1.00 },

  // --- Sayur ---
  { id:'bayam',    nama:'Bayam',            grup:'sayur',   kal:36,  prot:3.5,  lemak:0.5,  karbo:6.5,  harga:10000, susut:1.30 },
  { id:'kangkung', nama:'Kangkung',         grup:'sayur',   kal:29,  prot:3.0,  lemak:0.3,  karbo:5.4,  harga:9000,  susut:1.30 },
  { id:'wortel',   nama:'Wortel',           grup:'sayur',   kal:36,  prot:1.0,  lemak:0.6,  karbo:7.9,  harga:13000, susut:1.15 },
  { id:'buncis',   nama:'Buncis',           grup:'sayur',   kal:35,  prot:2.4,  lemak:0.2,  karbo:7.7,  harga:14000, susut:1.10 },
  { id:'kol',      nama:'Kol',              grup:'sayur',   kal:24,  prot:1.4,  lemak:0.2,  karbo:5.3,  harga:8000,  susut:1.20 },
  { id:'sawi',     nama:'Sawi hijau',       grup:'sayur',   kal:22,  prot:2.3,  lemak:0.3,  karbo:4.0,  harga:9000,  susut:1.25 },
  { id:'labusiam', nama:'Labu siam',        grup:'sayur',   kal:26,  prot:0.6,  lemak:0.1,  karbo:6.7,  harga:7000,  susut:1.20 },
  { id:'brokoli',  nama:'Brokoli',          grup:'sayur',   kal:34,  prot:2.8,  lemak:0.4,  karbo:6.6,  harga:25000, susut:1.30 },
  { id:'terong',   nama:'Terong',           grup:'sayur',   kal:24,  prot:1.1,  lemak:0.2,  karbo:5.5,  harga:9000,  susut:1.10 },

  // --- Buah ---
  { id:'pisang',   nama:'Pisang',           grup:'buah',    kal:92,  prot:1.0,  lemak:0.5,  karbo:23.4, harga:15000, susut:1.45 },
  { id:'jeruk',    nama:'Jeruk manis',      grup:'buah',    kal:45,  prot:0.9,  lemak:0.2,  karbo:11.2, harga:22000, susut:1.35 },
  { id:'pepaya',   nama:'Pepaya',           grup:'buah',    kal:46,  prot:0.5,  lemak:0.0,  karbo:12.2, harga:10000, susut:1.40 },
  { id:'semangka', nama:'Semangka',         grup:'buah',    kal:32,  prot:0.5,  lemak:0.2,  karbo:7.2,  harga:9000,  susut:1.55 },
  { id:'melon',    nama:'Melon',            grup:'buah',    kal:37,  prot:0.6,  lemak:0.4,  karbo:7.8,  harga:14000, susut:1.50 },
  { id:'apel',     nama:'Apel',             grup:'buah',    kal:58,  prot:0.3,  lemak:0.4,  karbo:14.9, harga:32000, susut:1.15 },

  // --- Pelengkap (dipakai tetap, tidak masuk rotasi menu) ---
  { id:'minyak',   nama:'Minyak goreng',    grup:'pelengkap', kal:902, prot:0.0, lemak:100.0, karbo:0.0, harga:19000, susut:1.00 },
  { id:'bumbu',    nama:'Bumbu dapur',      grup:'pelengkap', kal:0,   prot:0.0, lemak:0.0,   karbo:0.0, harga:20000, susut:1.00 }
];

/* ---------------------------------------------------------------------
   ACUAN AKG PER JENJANG
   Nilai adalah kebutuhan HARIAN. Kontribusi satu kali makan dihitung
   sebagai persentase dari nilai ini (dapat diatur pengguna).
   Untuk jenjang yang mencakup dua kelompok jenis kelamin, digunakan
   nilai rata-rata. Cantumkan pendekatan ini di Bab 3 proposal.
   --------------------------------------------------------------------- */
const JENJANG = [
  { id:'paud', nama:'PAUD / TK',        usia:'4–6 tahun',   kal:1400, prot:25.0 },
  { id:'sd13', nama:'SD kelas 1–3',     usia:'7–9 tahun',   kal:1650, prot:40.0 },
  { id:'sd46', nama:'SD kelas 4–6',     usia:'10–12 tahun', kal:1950, prot:52.5 },
  { id:'smp',  nama:'SMP',              usia:'13–15 tahun', kal:2225, prot:67.5 },
  { id:'sma',  nama:'SMA / SMK',        usia:'16–18 tahun', kal:2375, prot:70.0 }
];

/* ---------------------------------------------------------------------
   PEMBAGIAN ENERGI PER SEKAT NAMPAN
   Takaran tidak ditetapkan sebagai gram tetap, melainkan dihitung dari
   kepadatan energi masing-masing bahan. Pendekatan ini mengikuti prinsip
   bahan makanan penukar: satu porsi kentang dan satu porsi nasi berbeda
   beratnya, tetapi setara kontribusi energinya.

   Konsekuensinya, mengganti beras dengan singkong tidak membuat porsi
   menjadi kurang — sistem menyesuaikan gramasi secara otomatis.

   Nilai di bawah adalah bagian dari sisa target energi satu kali makan,
   setelah kontribusi minyak dihitung terlebih dahulu.
   --------------------------------------------------------------------- */
const PROPORSI_ENERGI = {
  karbo:  0.47,
  hewani: 0.21,
  nabati: 0.10,
  sayur:  0.07,
  buah:   0.15
};

/* Batas gramasi agar hasil tetap masuk akal sebagai satu porsi sajian.
   Tanpa batas ini, bahan berenergi sangat rendah bisa menghasilkan
   takaran yang tidak wajar untuk disajikan. */
const BATAS_GRAM = {
  karbo:  { min: 40, max: 320 },
  hewani: { min: 25, max: 150 },
  nabati: { min: 20, max: 120 },
  sayur:  { min: 40, max: 180 },
  buah:   { min: 50, max: 220 }
};

/* Takaran pelengkap per porsi (gram). Ditetapkan tetap per jenjang. */
const PELENGKAP = {
  paud: { minyak: 5, bumbu: 8  },
  sd13: { minyak: 6, bumbu: 9  },
  sd46: { minyak: 7, bumbu: 10 },
  smp:  { minyak: 8, bumbu: 11 },
  sma:  { minyak: 8, bumbu: 12 }
};

/* Batas penyesuaian takaran terhadap hasil perhitungan awal. */
const BATAS_PENYESUAIAN = { min: 0.70, max: 1.60 };

const NAMA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const LABEL_GRUP = {
  karbo:  'Makanan pokok',
  hewani: 'Lauk hewani',
  nabati: 'Lauk nabati',
  sayur:  'Sayur',
  buah:   'Buah'
};
