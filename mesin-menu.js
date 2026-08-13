/* =====================================================================
   MESIN PENYUSUN MENU
   ---------------------------------------------------------------------
   Pendekatan: berbasis aturan (rule-based) dengan penyesuaian iteratif.
   Bukan optimasi matematis. Alasan pemilihan dijelaskan di Bab 6.4
   proposal: hasilnya dapat ditelusuri, perilakunya deterministik, dan
   setiap keputusan sistem dapat dijelaskan kepada pengguna.

   Alur, sesuai urutan di proposal:
     1. Tentukan target gizi satu kali makan dari AKG jenjang.
     2. Pilih komponen menu untuk tiap sekat nampan.
     3. Hitung kandungan gizi dan biaya per porsi.
     4. Evaluasi terhadap batas gizi dan anggaran.
     5. Sesuaikan takaran atau ganti komponen, lalu ulangi evaluasi.
     6. Ulangi untuk lima hari dengan aturan variasi.
     7. Konsolidasikan kebutuhan bahan menjadi satu daftar belanja.

   Seluruh proses bersifat deterministik: input yang sama selalu
   menghasilkan menu yang sama. Ini disengaja agar hasil dapat
   direproduksi dan diverifikasi.
   ===================================================================== */

const MAKS_ITERASI = 40;

/* Ambang penerimaan. Menu dianggap memenuhi jika berada dalam rentang
   ini terhadap target. Batas bawah lebih ketat daripada batas atas
   karena kekurangan gizi lebih merugikan daripada kelebihan wajar. */
const AMBANG = { bawah: 0.95, atas: 1.20 };

function cariBahan(id) {
  return BAHAN.find(b => b.id === id);
}

/* Gizi dan biaya satu komponen pada takaran tertentu.
   Biaya dihitung dari berat kotor (berat bersih dikali faktor susut),
   karena yang dibeli adalah bahan sebelum penyiangan. */
function hitungKomponen(bahan, gram) {
  const f = gram / 100;
  return {
    kal:   bahan.kal   * f,
    prot:  bahan.prot  * f,
    lemak: bahan.lemak * f,
    karbo: bahan.karbo * f,
    gramKotor: gram * bahan.susut,
    biaya: (gram * bahan.susut / 1000) * bahan.harga
  };
}

function totalkan(komponen) {
  return komponen.reduce((t, k) => ({
    kal:   t.kal   + k.gizi.kal,
    prot:  t.prot  + k.gizi.prot,
    lemak: t.lemak + k.gizi.lemak,
    karbo: t.karbo + k.gizi.karbo,
    biaya: t.biaya + k.gizi.biaya
  }), { kal:0, prot:0, lemak:0, karbo:0, biaya:0 });
}

/* Rotasi komponen antar hari.
   Bahan dipilih berurutan dari daftar tersedia sehingga tidak ada
   pengulangan selama stok jenis masih mencukupi. Deterministik. */
function pilihKomponen(tersedia, grup, indeksHari) {
  const kandidat = tersedia.filter(b => b.grup === grup);
  if (kandidat.length === 0) return null;
  return kandidat[indeksHari % kandidat.length];
}

/* Alternatif yang lebih murah dalam kelompok yang sama, diurutkan naik.
   Dipakai saat biaya melewati anggaran. */
function alternatifLebihMurah(tersedia, bahan) {
  return tersedia
    .filter(b => b.grup === bahan.grup && b.harga < bahan.harga)
    .sort((a, b) => a.harga - b.harga);
}

function batasi(nilai, awal, slot) {
  const min = Math.max(awal * BATAS_PENYESUAIAN.min, BATAS_GRAM[slot].min);
  const max = Math.min(awal * BATAS_PENYESUAIAN.max, BATAS_GRAM[slot].max);
  return Math.min(max, Math.max(min, nilai));
}

/* Takaran awal satu komponen: gram yang diperlukan agar bahan tersebut
   menyumbang bagian energi yang ditetapkan untuk sekatnya.
   Inilah penerapan prinsip bahan makanan penukar. */
function takaranAwalKomponen(bahan, slot, sisaTarget) {
  const targetSlot = sisaTarget * PROPORSI_ENERGI[slot];
  const gram = bahan.kal > 0 ? (targetSlot / bahan.kal) * 100 : BATAS_GRAM[slot].min;
  return Math.min(BATAS_GRAM[slot].max, Math.max(BATAS_GRAM[slot].min, gram));
}

/* ------------------------------------------------------------------
   Menyusun menu satu hari.
   ------------------------------------------------------------------ */
function susunMenuHari(indeksHari, opsi) {
  const { tersedia, target, pelengkap, anggaranBahan } = opsi;

  const slot = ['karbo', 'hewani', 'nabati', 'sayur', 'buah'];
  const minyak = cariBahan('minyak');
  const bumbu  = cariBahan('bumbu');

  const giziMinyak = hitungKomponen(minyak, pelengkap.minyak);
  const giziBumbu  = hitungKomponen(bumbu,  pelengkap.bumbu);
  const sisaTarget = Math.max(0, target.kal - giziMinyak.kal);

  let pilihan = {}, gram = {}, awal = {};

  for (const s of slot) {
    const b = pilihKomponen(tersedia, s, indeksHari);
    if (!b) return { gagal: true, alasan: `Tidak ada bahan tersedia untuk ${LABEL_GRUP[s]}.` };
    pilihan[s] = b;
    awal[s] = takaranAwalKomponen(b, s, sisaTarget);
    gram[s] = awal[s];
  }

  const catatan = [];
  let iterasi = 0;
  let hasil = null;

  while (iterasi < MAKS_ITERASI) {
    iterasi++;

    const komponen = slot.map(s => ({
      slot: s,
      bahan: pilihan[s],
      gram: Math.round(gram[s]),
      gizi: hitungKomponen(pilihan[s], gram[s])
    }));
    komponen.push({ slot:'minyak', bahan:minyak, gram:pelengkap.minyak, gizi:giziMinyak });
    komponen.push({ slot:'bumbu',  bahan:bumbu,  gram:pelengkap.bumbu,  gizi:giziBumbu  });

    const total = totalkan(komponen);
    hasil = { komponen, total };

    const rasioKal  = total.kal  / target.kal;
    const rasioProt = total.prot / target.prot;
    const lewatAnggaran = total.biaya > anggaranBahan;

    const kalKurang  = rasioKal  < AMBANG.bawah;
    const protKurang = rasioProt < AMBANG.bawah;
    const kalLebih   = rasioKal  > AMBANG.atas;

    if (!kalKurang && !protKurang && !kalLebih && !lewatAnggaran) break;

    /* Prioritas penyesuaian:
       1. Biaya lewat     -> turunkan takaran, lalu ganti komponen termahal.
       2. Protein kurang  -> tambah lauk hewani, lalu lauk nabati.
       3. Energi kurang   -> tambah makanan pokok.
       4. Energi berlebih -> kurangi makanan pokok. */

    if (lewatAnggaran) {
      const sebelum = { ...gram };
      gram.hewani = batasi(gram.hewani * 0.94, awal.hewani, 'hewani');
      gram.buah   = batasi(gram.buah   * 0.96, awal.buah,   'buah');

      if (gram.hewani === sebelum.hewani && gram.buah === sebelum.buah) {
        const urut = ['hewani', 'buah', 'karbo', 'nabati', 'sayur'];
        let diganti = false;
        for (const s of urut) {
          const alt = alternatifLebihMurah(tersedia, pilihan[s]);
          if (alt.length > 0) {
            catatan.push(`${pilihan[s].nama} diganti ${alt[0].nama} agar biaya masuk anggaran.`);
            pilihan[s] = alt[0];
            awal[s] = takaranAwalKomponen(alt[0], s, sisaTarget);
            gram[s] = awal[s];
            diganti = true;
            break;
          }
        }
        if (!diganti) break;
      }
      continue;
    }

    if (protKurang) {
      const sebelum = gram.hewani;
      gram.hewani = batasi(gram.hewani * 1.10, awal.hewani, 'hewani');
      if (gram.hewani === sebelum) {
        gram.nabati = batasi(gram.nabati * 1.12, awal.nabati, 'nabati');
      }
    }

    if (kalKurang) {
      const sebelum = gram.karbo;
      gram.karbo = batasi(gram.karbo * 1.08, awal.karbo, 'karbo');
      if (gram.karbo === sebelum && !protKurang) {
        gram.nabati = batasi(gram.nabati * 1.08, awal.nabati, 'nabati');
      }
    } else if (kalLebih) {
      gram.karbo = batasi(gram.karbo * 0.93, awal.karbo, 'karbo');
    }
  }

  const rasioKal  = hasil.total.kal  / target.kal;
  const rasioProt = hasil.total.prot / target.prot;

  const peringatan = [];
  if (rasioKal  < AMBANG.bawah) peringatan.push('Energi belum mencapai target.');
  if (rasioProt < AMBANG.bawah) peringatan.push('Protein belum mencapai target.');
  if (hasil.total.biaya > anggaranBahan) peringatan.push('Biaya bahan melewati anggaran.');

  return {
    hari: NAMA_HARI[indeksHari],
    komponen: hasil.komponen,
    total: hasil.total,
    rasioKal, rasioProt,
    iterasi, catatan, peringatan,
    gagal: false
  };
}

/* ------------------------------------------------------------------
   Menyusun rencana satu minggu dan daftar belanja.
   ------------------------------------------------------------------ */
function susunRencana(input) {
  const { idJenjang, porsi, anggaranPorsi, persenAKG, bahanTersedia, porsiBumbu } = input;

  const jenjang = JENJANG.find(j => j.id === idJenjang);
  const pelengkap = PELENGKAP[idJenjang];

  const target = {
    kal:  jenjang.kal  * (persenAKG / 100),
    prot: jenjang.prot * (persenAKG / 100)
  };

  const tersedia = BAHAN.filter(
    b => b.grup !== 'pelengkap' && bahanTersedia.includes(b.id)
  );

  // Sebagian anggaran dialokasikan untuk bumbu, minyak, dan kemasan.
  const anggaranBahan = anggaranPorsi * (1 - porsiBumbu / 100);

  const opsi = { tersedia, target, pelengkap, anggaranBahan };

  const hari = [];
  for (let i = 0; i < NAMA_HARI.length; i++) {
    const m = susunMenuHari(i, opsi);
    if (m.gagal) return { gagal: true, alasan: m.alasan };
    hari.push(m);
  }

  // Konsolidasi kebutuhan bahan lintas hari.
  const belanja = {};
  for (const h of hari) {
    for (const k of h.komponen) {
      if (!belanja[k.bahan.id]) {
        belanja[k.bahan.id] = { bahan: k.bahan, gramKotor: 0, biaya: 0 };
      }
      belanja[k.bahan.id].gramKotor += k.gizi.gramKotor * porsi;
      belanja[k.bahan.id].biaya     += k.gizi.biaya * porsi;
    }
  }

  const daftarBelanja = Object.values(belanja)
    .sort((a, b) => b.biaya - a.biaya);

  const biayaBahanTotal = daftarBelanja.reduce((t, x) => t + x.biaya, 0);
  const rerataBiayaPorsi = hari.reduce((t, h) => t + h.total.biaya, 0) / hari.length;

  return {
    gagal: false,
    jenjang, target, porsi, anggaranPorsi, persenAKG, porsiBumbu,
    hari,
    daftarBelanja,
    biayaBahanTotal,
    rerataBiayaPorsi,
    anggaranMingguan: anggaranPorsi * porsi * NAMA_HARI.length
  };
}
