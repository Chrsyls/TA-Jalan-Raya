# Detail Tugas Akhir — National Road Digital Twin

> Dokumen rincian tugas akhir untuk topik **National Road Digital Twin**.
>
> Berisi uraian lengkap tiap judul: latar belakang, fokus kerja, rumusan masalah, rancangan pengujian, metrik, batasan, dan risiko.
>
> Tanggal: 2026-10-14 · Revisi: menyesuaikan dengan draft proposal Alvito, memasukkan hasil bimbingan dan revisi judul, serta menambahkan konsep *cryptospatial*
>
> Mahasiswa: Alvito Aryo Putra (NRP 5024 23 1077) · Atria · Panji *(nama lengkap dan NRP Atria dan Panji dilengkapi tim)* — Departemen Teknik Komputer, FTEIC, Institut Teknologi Sepuluh Nopember
>
> Dosen pembimbing: Mochamad Hariadi, S.T., M.Sc., Ph.D (Pembimbing) · Reza Fuad Rachmadi, S.T., M.T., Ph.D (Ko-Pembimbing)
>
> Status: **draf** untuk dibahas dengan dosen pembimbing. Angka target, ambang, dan daftar perangkat bersifat **usulan** — dikalibrasi setelah baseline terukur dan diverifikasi ulang saat penelitian dimulai.

---

## Daftar Isi

**Pendahuluan**

- **[Latar Belakang, Urgensi, dan Tujuan Proyek](#latar-belakang-urgensi-dan-tujuan-proyek)** — apa yang dikerjakan, mengapa penting, dan apa tujuannya
- **[Gambaran Proyek](#gambaran-proyek)** — topik, tujuh state, definisi *digital twin*, arsitektur
- **[Kerangka Penyusunan Judul](#kerangka-penyusunan-judul)** — aturan judul dan hasil revisi judul

**Detail tiap tugas akhir**

1. **[Alvito — Visualisasi & Sinkronisasi](#1-alvito--visualisasi--sinkronisasi)** — Dashboard Web Infrastruktur Jalan Raya Berbasis Digital Twin dan Integrasi IoT Real-Time
2. **[Atria — Analisis Risiko & Prediksi](#2-atria--analisis-risiko--prediksi)** — Pengembangan Model AI Agentic Berbasis Computer Vision untuk Analisis Risiko dan Prediksi Pemeliharaan pada Digital Twin Jalan Raya
3. **[Panji — Integritas Data & Backend](#3-panji--integritas-data--backend)** — Implementasi Smart Contract Blockchain untuk Tokenisasi Aset dan Integritas Data Pemeliharaan pada Sistem Digital Twin Jalan Raya

**Penutup**

4. **[Pembagian Kerja Antar-Tugas Akhir](#4-pembagian-kerja-antar-tugas-akhir)**
5. **[Panduan untuk Penguji](#5-panduan-untuk-penguji)** — kamus istilah dan antisipasi pertanyaan
6. **[Keputusan Terbuka, Arahan Bimbingan, dan Referensi](#6-keputusan-terbuka-arahan-bimbingan-dan-referensi)**

---

## Latar Belakang, Urgensi, dan Tujuan Proyek

> Bagian ini disusun dari penjelasan Pak Hariadi pada bimbingan. Tujuannya: pada diskusi pra-sempro, penguji langsung memahami **apa yang dikerjakan, apa tujuannya, dan mengapa penting** — sebelum masuk ke detail teknis. Pak Hariadi juga mengingatkan bahwa proyek ini tergolong *advance* sehingga penguji mungkin belum akrab dengan istilahnya; karena itu istilah dijelaskan secara sederhana di sepanjang dokumen dan dirangkum di §5.

> **Ringkasan satu menit.** Data dan dana pemeliharaan jalan mudah dimanipulasi — volume pekerjaan digelembungkan, harga di-*mark up*, laporan diubah setelah dicatat — karena catatannya umumnya berada di basis data biasa yang dapat diubah atau dihapus. Proyek ini membangun prototipe ***digital twin*** jalan raya (replika digital jalan yang terhubung ke sensor dan citra) sebagai sumber data kondisi yang objektif — dengan **verifikasi *cryptospatial*** agar data sensor terbukti berasal dari lokasi dan perangkat yang sah — lalu **mengunci catatan pentingnya — data, bukti, dan perjanjian — dengan *blockchain*** yang hanya dapat ditambah dan dibaca, tidak dapat diubah atau dihapus diam-diam. Tugas akhir ini **mengukur** seberapa efektif pendekatan tersebut dan berapa harganya; bukan sekadar membuat aplikasi.

### Masalah: data dan dana pemeliharaan jalan mudah dimanipulasi

Menurut penjelasan pembimbing, keamanan data dan keamanan finansial — di Indonesia maupun di dunia — masih lemah: data mudah dimanipulasi dan angka mudah di-*mark up*. Pada pemeliharaan jalan, titik rawannya ada di sepanjang siklus pekerjaan:

| Tahap | Data atau dokumen kunci | Contoh manipulasi (dilakukan setelah fakta) |
| :--- | :--- | :--- |
| Perencanaan | kondisi jalan, anggaran | kondisi dilebih-lebihkan agar anggaran membesar |
| Kontrak | syarat, harga satuan, ruang lingkup | syarat atau harga diubah setelah disepakati |
| Pelaksanaan | volume, progres, foto bukti | volume digelembungkan (*mark-up*), foto direkayasa |
| Verifikasi | laporan penerimaan pekerjaan | laporan diubah setelah dicatat |
| Pembayaran | klaim | klaim ganda, pencairan sebelum syarat terpenuhi |

Manipulasi semacam ini sulit dibuktikan karena hampir selalu berupa **mengubah atau menghapus catatan setelah dibuat**. Pada basis data biasa, tindakan itu dapat dilakukan oleh pihak yang berwenang tanpa jejak yang tak terbantahkan.

**Data pendukung** (dari sumber publik; angka ICW dikutip lewat pemberitaan GoodStats — *verifikasi ke laporan asli*):

| Sumber | Temuan | Catatan |
| :--- | :--- | :--- |
| ICW, Tren Penindakan Kasus Korupsi 2023 | 791 kasus terpantau; modus proyek fiktif 277 kasus, *mark-up* harga 50 kasus; sekitar 21% kasus berkaitan dengan proyek infrastruktur | angka dari pemberitaan atas laporan ICW |
| ICW, Tren Penindakan Kasus Korupsi 2024 | modus *mark up* tercatat 33 kasus dan *mark down* 20 kasus | idem |
| CoST (*Infrastructure Transparency Initiative*), dikutip World Economic Forum 2016 | diperkirakan 10–30% investasi infrastruktur hilang akibat korupsi dan salah kelola | **perkiraan**, bukan pengukuran pasti — sumbernya sendiri menyatakan sulit ditentukan |

> **Masih perlu dilengkapi tim:** temuan audit (BPK atau inspektorat) tentang kekurangan volume pekerjaan jalan, kasus di Indonesia yang relevan, serta data insiden keamanan data. Tautan sumber ada di §6.

### Mengapa blockchain: hanya menambah dan membaca

Penjelasan pembimbing: pada blockchain, catatan yang sudah masuk **hanya dapat ditambah (*create*) dan dibaca (*read*)** — tidak dapat diubah (*update*) atau dihapus (*delete*). Setelah dicatat, catatan itu berlaku selamanya.

| Operasi (CRUD) | Basis data biasa | Blockchain (catatan yang sudah masuk) |
| :--- | :---: | :--- |
| **C**reate — menambah | ✅ | ✅ |
| **R**ead — membaca | ✅ | ✅ |
| **U**pdate — mengubah | ✅ dapat dilakukan, sering tanpa jejak | ❌ tidak dapat — koreksi ditulis sebagai catatan **baru**, catatan lama tetap tampak |
| **D**elete — menghapus | ✅ dapat dilakukan | ❌ tidak dapat |

Manipulasi dan *mark-up* umumnya membutuhkan *update* atau *delete*; dengan keduanya ditiadakan, jalur utama manipulasi diam-diam tertutup.

> **Catatan ketelitian istilah (untuk menjawab penguji yang teliti).** Status sebuah *smart contract* memang dapat berubah lewat transaksi baru yang sah — tetapi **setiap perubahan itu sendiri tercatat permanen** dalam riwayat rantai. Yang tidak mungkin adalah menulis ulang atau menghapus riwayat itu secara diam-diam. Itu pula sebabnya tujuan proyek dirumuskan sebagai **mengurangi** peluang manipulasi dan membuatnya **terdeteksi**, bukan "menghentikan" manipulasi sepenuhnya: blockchain tidak dapat menjamin bahwa data yang masuk sudah benar (lihat *oracle problem* di §3).

### Smart contract: perjanjian yang tidak dapat diubah diam-diam

*Smart contract* adalah program di dalam blockchain yang menegakkan aturan secara otomatis. Contoh yang dipakai pembimbing: **persetujuan *terms of service* sebelum pembayaran digital** — pengguna menyetujui syarat versi tertentu, persetujuan itu tercatat permanen, dan pembayaran baru dapat diproses setelahnya. Pemilik tidak dapat mengklaim "syarat itu tidak pernah disetujui", dan tidak dapat mengubah isinya diam-diam.

Dalam proyek ini, pola yang sama diterapkan pada **perjanjian antara pemilik (*owner*) dan pengguna (pelaksana dan pihak terkait)** untuk pekerjaan pemeliharaan: syarat pekerjaan disetujui lebih dulu dan tercatat, dan pencairan (hanya disimulasikan) tidak dapat dicatat sebelum syarat dan verifikasi terpenuhi.

### Cryptospatial: keaslian lokasi data

Data jalan selalu **berlokasi**: setiap pengukuran, foto, dan klaim pekerjaan melekat pada sebuah koordinat atau segmen. Karena itu ada jenis manipulasi yang tidak tertangani hanya dengan mengunci isi data — **pemalsuan lokasi** (*location spoofing*): data yang isinya sah dikirim seolah-olah berasal dari ruas lain, atau bukti pekerjaan diambil dari tempat yang tidak pernah dikunjungi. Pola ini berdekatan dengan proyek atau laporan fiktif, modus yang dalam pemantauan ICW termasuk terbanyak pada 2023 (proyek fiktif 277 dari 791 kasus terpantau).

***Cryptospatial*** adalah paradigma yang menyatukan **kriptografi terdesentralisasi dengan sistem informasi geografis** untuk menjamin keaslian data geografis dan **bukti lokasi** (*Proof of Location*) yang tidak dapat dimanipulasi. Pada proyek ini konsepnya diadopsi secara terukur:

| Unsur | Penjelasan sederhana | Dalam proyek ini |
| :--- | :--- | :--- |
| **Cryptospatial Coordinate (CSC)** | koordinat yang diikat dengan identitas kriptografis sehingga keasliannya dapat diperiksa | koordinat dan kunci terdaftar tiap sensor dan segmen, dicatat dalam **registri** |
| **Tanda tangan digital** | "cap" yang hanya dapat dibuat pemilik kunci dan rusak bila isi pesan diubah | setiap pesan sensor, termasuk koordinatnya, ditandatangani |
| **Proof of Location** | bukti bahwa data berasal dari lokasi yang sah | **verifikasi di lapisan ingest**: tanda tangan cocok dengan kunci terdaftar *dan* koordinat pesan cocok dengan koordinat terdaftar |
| **Immutability** | catatan tidak dapat diubah | label validitas tiap pesan tercatat utuh di log; registri CSC dijaga agar tidak dapat diganti diam-diam (blockchain) |

> **Pembagian peran.** Alvito mengadopsi **verifikasi** cryptospatial di lapisan ingest dan mengukur overhead serta efektivitasnya (§1). Panji menyediakan **registri CSC** on-chain agar koordinat dan kunci terdaftar tidak dapat diganti diam-diam (§3). Tidak ada pengembangan jaringan blockchain maupun algoritma konsensus baru; riset konsensus untuk CSC yang sudah ada (Wibowo, 2023) dipakai sebagai landasan, bukan diulang.
>
> **Batas yang perlu dinyatakan jujur:** tanda tangan membuktikan pesan berasal dari perangkat berkunci terdaftar dan tidak diubah di tengah jalan. Ia **tidak** membuktikan nilai ukurnya benar, dan tidak membuktikan perangkat benar-benar berada di lokasi itu bila kuncinya dicuri atau perangkatnya dipindahkan.

### Mengapa digital twin, IoT, *cryptospatial*, dan AI ikut dibutuhkan

Blockchain hanya menjamin catatan **tidak berubah setelah dicatat**, bukan bahwa isinya benar. Data yang dikunci sebaiknya berasal dari **pengukuran objektif**, bukan dari laporan tertulis semata. Karena itu teknologi-teknologinya saling melengkapi:

| Komponen | Peran dalam mengurangi manipulasi | Bukan perannya |
| :--- | :--- | :--- |
| ***Digital twin* + GIS** | satu representasi objektif kondisi tiap segmen jalan — acuan pembanding bagi klaim | menjamin sensor pasti benar |
| **IoT + citra (*computer vision*)** | sumber data berupa pengukuran, bukan laporan tertulis | — |
| **Verifikasi *cryptospatial*** | memastikan pesan sensor berasal dari perangkat dan lokasi terdaftar sebelum masuk ke twin | membuktikan nilai ukur benar |
| **AI agentic** | menilai risiko, memperkirakan kebutuhan dan biaya wajar, memeriksa kewajaran klaim, menyusun rekomendasi beralasan | memutuskan sendiri |
| **Blockchain + IPFS** | mengunci data, bukti, dan perjanjian agar tidak dapat diubah atau dihapus diam-diam | menjamin sumber data benar |
| ***Smart contract*** | memaksa aturan perjanjian dan alur persetujuan | menilai kewajaran harga |
| **Dashboard** | membuat state, bukti, dan status verifikasi terlihat oleh semua pihak | — |

### Satu kasus dari awal sampai akhir

```
1. Sensor getaran dan citra jalan menunjukkan segmen S-017 memburuk. Setiap pesan    [IoT + CV]
   sensor ditandatangani, termasuk koordinatnya.
2. Ingest memverifikasi tanda tangan dan lokasi (cryptospatial). Pesan valid      [Alvito]
   memperbarui state S-017 dan tampil di dashboard dalam hitungan detik; pesan
   tidak valid ditandai dan tidak memperbarui state.
3. AI menilai risiko, memperkirakan pekerjaan dan biaya wajar (berupa rentang),   [Atria]
   lalu merekomendasikan penanganan.
4. Pemilik menyetujui dan menerbitkan syarat pekerjaan. Dokumen syarat disimpan   [Panji]
   di IPFS; CID-nya dicatat di smart contract.
5. Pelaksana menyetujui syarat — persetujuan tercatat permanen — lalu mengerjakan.[Panji]
6. Bukti pekerjaan (foto, laporan, data sensor sesudah perbaikan) disimpan di     [Panji]
   IPFS; CID-nya dicatat.
7. Pengawas memverifikasi, dibantu perbandingan kondisi sebelum dan sesudah       [Alvito + Atria]
   pada twin.
8. Klaim biaya dibandingkan dengan estimasi wajar; klaim yang melampaui batas     [Atria + Panji]
   toleransi ditandai dan memerlukan persetujuan tambahan.
9. Pencairan (disimulasikan) hanya dapat dicatat bila syarat sudah disetujui dan  [Panji]
   verifikasi selesai. Siapa pun dapat memeriksa bahwa data tidak diubah.
```

### Tujuan proyek

**Tujuan umum.** Mengurangi peluang manipulasi dan *mark-up* data pemeliharaan jalan dengan merancang dan mengevaluasi prototipe *digital twin* jalan raya yang data, bukti, dan perjanjiannya dikunci dengan blockchain.

**Tujuan khusus** — satu per tugas akhir:

- **Alvito** — menampilkan seluruh state twin pada satu dashboard, menjaganya tersinkron dengan sensor secara cepat dan tidak salah tampil, dan memverifikasi keaslian lokasi data sensor (*cryptospatial*).
- **Atria** — mengubah data twin menjadi risiko, prediksi, estimasi biaya wajar, dan rekomendasi yang dapat ditelusuri.
- **Panji** — mengunci data, bukti, dan perjanjian agar perubahan diam-diam terdeteksi, serta menyediakan backend yang menopang ketiganya.

**Yang diukur** (KPI proyek): *synchronization latency*, *data consistency*, *visualization accuracy*, dan *system response*, ditambah tingkat deteksi manipulasi dan kualitas rekomendasi pada skenario terkontrol.

### Lingkup: evaluasi, riset, dan eksperimen

Proyek ini bukan sistem produksi. Kontribusinya adalah **evaluasi terukur dan eksperimen terkontrol** pada prototipe:

| Dalam cakupan | Di luar cakupan |
| :--- | :--- |
| Evaluasi, riset, dan eksperimen terukur pada prototipe | Sistem produksi atau layanan operasional |
| Data **simulasi dan data sekunder** sebagai sumber utama; data primer opsional | Pemasangan sensor skala lapangan |
| Ruas acuan: **jalan nyata sebagai referensi geometri (OpenStreetMap, dengan Ina-Geoportal sebagai pendukung) atau jalan rancangan sendiri** | Klaim tentang kondisi nyata ruas tertentu |
| Verifikasi *cryptospatial* sederhana: tanda tangan sensor + koordinat terdaftar di lapisan ingest | Pengembangan atau optimasi algoritma konsensus; pembuktian lokasi fisik berbasis radio |
| Jaringan uji blockchain; pembayaran hanya disimulasikan sebagai status | Pembayaran riil, aset kripto bernilai, regulasi keuangan |
| Rekomendasi AI yang dinilai dan diputuskan manusia | Keputusan otomatis tanpa manusia |

> Data primer (dari perangkat keras sensor) **boleh** dipakai, tetapi kelanjutan perangkat keras untuk data primer **belum ditanyakan** ke pembimbing — dicatat sebagai keputusan terbuka di §6. Sampai ada jawaban, rancangan bertumpu pada data simulasi dan sekunder.

---

## Gambaran Proyek

| Unsur | Rincian |
| :--- | :--- |
| **Topik** | National Road Digital Twin |
| **Objek** | Jalan raya — ruas acuan berupa jalan nyata (sebagai referensi geometri) atau jalan rancangan sendiri |
| **Fokus** | Digital Twin + GIS + IoT + AI + Blockchain |
| **Konsep tambahan** | *Cryptospatial* — verifikasi kecocokan tanda tangan sensor dengan koordinat terdaftar (*Proof of Location*) untuk menjamin keaslian data lokasi |
| **Input / metode utama** | *Geometry*, *physical condition*, *IoT state*, *risk*, *economic state*, *maintenance*, *token state* |
| **KPI** | *Synchronization latency*, *data consistency*, *visualization accuracy*, *system response* |
| **Output** | Prototype National Road Digital Twin |

### Tujuh state yang membentuk twin

Ketujuh input utama diperlakukan sebagai **tujuh state** pada satu model data bersama. Seluruhnya disimpan dan dijaga integritasnya oleh backend (Panji), dan seluruhnya ditampilkan oleh dashboard (Alvito); yang berbeda adalah siapa yang **memproduksinya**.

| State | Contoh atribut | Produsen utama | Sifat data |
| :--- | :--- | :--- | :--- |
| **Geometry** | ruas, segmen, STA, panjang, lebar, jumlah lajur | data acuan: OpenStreetMap (utama), Ina-Geoportal (pendukung), atau ruas rancangan sendiri — diproses ke GeoJSON WGS 84 | statik — jarang berubah |
| **Physical condition** | IRI, indeks kerusakan, jenis dan tingkat kerusakan, koordinat temuan | Atria (*computer vision*) + data sekunder atau survei | periodik — per kampanye survei |
| **IoT state** | getaran, suhu permukaan, curah hujan atau genangan, volume lalu lintas, status node, **label validitas *cryptospatial*** | sensor — simulator dan data sekunder; node nyata opsional (Alvito) | aliran — hitungan detik |
| **Risk** | skor risiko per segmen beserta faktor penyebabnya | Atria | turunan — dihitung ulang saat input berubah |
| **Economic state** | estimasi biaya wajar (rentang), LHR, alokasi anggaran, klaim biaya | Atria (estimasi) + parameter yang dinyatakan eksplisit | turunan |
| **Maintenance** | rekomendasi, *work order*, status siklus, bukti pekerjaan | Atria (rekomendasi) + keputusan pengguna lewat dashboard | peristiwa — siklus status |
| **Token state** | token ID segmen, CID terakhir, *tx hash*, status verifikasi, registri CSC sensor dan segmen | Panji | peristiwa — transaksi on-chain |

> IRI = *International Roughness Index* · STA = *stationing* (posisi memanjang ruas, mis. STA 12+300) · LHR = lalu lintas harian rata-rata · CID = *Content Identifier* (alamat berkas di IPFS).

### Definisi operasional: apa yang disebut "digital twin" pada proyek ini

Penguji hampir pasti bertanya: *"Ini digital twin atau sekadar dashboard?"* Jawabannya perlu ditetapkan sejak proposal, memakai taksonomi tingkat keterhubungan data antara objek fisik dan model digitalnya — *digital model*, *digital shadow*, *digital twin* (mis. Kritzinger dkk., 2018; verifikasi pada kajian pustaka):

| Tingkat | Aliran data fisik ↔ digital | Status pada prototipe |
| :--- | :--- | :---: |
| Digital model | manual, tanpa aliran otomatis | ❌ dilewati |
| Digital shadow | fisik → digital, otomatis | ✅ dicakup penuh (sensor → twin, *real-time*) |
| Digital twin | dua arah | ◐ sebagian — arah balik berupa **rekomendasi dan keputusan manusia** |

> Loop yang dibangun: **sensor → twin → rekomendasi → keputusan manusia → pekerjaan pemeliharaan → state twin diperbarui.**
>
> Arah balik tidak diotomasi karena keputusan pemeliharaan jalan menyangkut keselamatan pengguna jalan dan anggaran publik. Ini **keputusan desain**, bukan kekurangan.

### Arsitektur berlapis

```
LAPIS FISIK         Ruas jalan · sensor (getaran, suhu, hujan, lalu lintas) · citra jalan
                    · simulator sensor (pesan bertanda tangan) dan data sekunder    [Alvito]
                       │  telemetri MQTT · citra · data survei
                       ▼
LAPIS INGEST        Broker → validasi skema → VERIFIKASI CRYPTOSPATIAL              [Alvito]
                    (tanda tangan + koordinat vs registri CSC) → label validitas
                       │  pesan tervalidasi + label validitas
                       ▼
LAPIS DATA          PostGIS + deret waktu → API + event bus                         [Panji]
                       │                      │
                       │ berkas batch → IPFS  │ state + event
                       │ → CID                │
                       ▼                      ▼
LAPIS KEPERCAYAAN   IPFS (isi berkas) + smart contract (CID, token, perjanjian,     [Panji]
                    registri CSC)
LAPIS KECERDASAN    Computer vision → risiko → prediksi → agen → rekomendasi        [Atria]
                       │  status token · label validitas · rekomendasi · kewajaran klaim
                       ▼
LAPIS APLIKASI      Dashboard Laravel + CesiumJS (peta 3D dari GeoJSON OSM)         [Alvito]
                       │  keputusan pengguna (setujui / tolak / catat pekerjaan)
                       └──► kembali ke backend ──► state twin diperbarui
```

> Pembagian lapis ingest dan data antara Alvito dan Panji (siapa membangun layanan ingest) dicatat sebagai keputusan arsitektur di §4 dan §6.

---

## Kerangka Penyusunan Judul

Proyek ini dikerjakan **3 mahasiswa di atas satu basis kode bersama**. Agar tidak tumpang tindih dan agar tiap judul berdiri sendiri sebagai tugas akhir, pembagiannya dibuat per **lapisan**: tampilan dan sinkronisasi, keputusan (kecerdasan buatan), serta integritas data dan backend.

**Judul hasil revisi.** Revisi dilakukan agar ketiga judul berkesinambungan: objeknya sama (*Digital Twin … Jalan Raya*), istilah teknisnya seragam, dan tiap judul menempati satu lapisan.

| Mahasiswa | Judul sebelum revisi | Judul sesudah revisi |
| :--- | :--- | :--- |
| Alvito | Dasbor Web Infrastruktur **Jalan Nasional** Berbasis Digital Twin dan Integrasi IoT Real-Time | **Dashboard** Web Infrastruktur **Jalan Raya** Berbasis Digital Twin dan Integrasi IoT Real-Time |
| Atria | Pengembangan Model AI Agentic Berbasis Computer Vision untuk Analisis Risiko dan Prediksi Pemeliharaan pada Digital Twin **Jalan** | Pengembangan Model AI Agentic Berbasis Computer Vision untuk Analisis Risiko dan Prediksi Pemeliharaan pada Digital Twin **Jalan Raya** |
| Panji | Implementasi Smart Contract Blockchain untuk Tokenisasi Aset dan Integritas Data Pemeliharaan pada Sistem Digital Twin **Jalan** | Implementasi Smart Contract Blockchain untuk Tokenisasi Aset dan Integritas Data Pemeliharaan pada Sistem Digital Twin **Jalan Raya** |

> Judul Alvito sama dengan judul pada draft proposal tugas akhir (EC234701). Nama topik dan prototipe tetap ***National Road Digital Twin***; judul tugas akhir memakai istilah "Jalan Raya". Bila ingin disamakan, cukup mengganti nama topik pada judul dokumen proposal.

**Empat aturan yang dipakai untuk semua judul:**

1. **Ada variabel terukur** — judul harus memuat sesuatu yang dapat naik/turun dan dibandingkan (latensi, galat, akurasi, tingkat deteksi, biaya). Tanpa ini, penguji akan menilai pekerjaan sebagai "membuat aplikasi", bukan riset.
2. **Ada intervensi milik sendiri dan ada pembanding** — bukan sekadar "memakai blockchain / AI / IoT". Harus ada sesuatu yang dirancang mahasiswa dan dibandingkan terhadap versi sederhana yang tidak memakainya (*baseline*).
3. **Tumpukan teknologi bukan klaim** — "Digital Twin + GIS + IoT + AI + Blockchain" rawan dinilai sebagai daftar kata kunci. Setiap teknologi harus dibenarkan oleh satu pertanyaan terukur: *apa yang membaik, seberapa banyak, dan berapa harganya.*
4. **Tanpa kosakata bisnis dan keuangan di judul** — kata *investasi*, *perdagangan token*, *monetisasi*, dan *platform* dikeluarkan dari judul. Urgensi keuangan (manipulasi dan *mark-up* anggaran) dibahas di latar belakang, sedangkan token pada proyek ini adalah representasi catatan aset dan pemeliharaan di jaringan uji — bukan instrumen keuangan. Nilai produknya tetap ada, tetapi letaknya di bab implikasi dan pengembangan lanjutan.

> **Uji cepat sebuah judul:** kalau eksperimennya tidak mungkin menghasilkan *"ternyata tidak berhasil"*, itu proyek — bukan riset.
>
> Contoh: *"blockchain membuat data pasti aman"* tidak lolos uji. *"Berapa persen manipulasi data terdeteksi, dan berapa latensi tambahannya dibanding log audit biasa?"* lolos.

> **Pertanyaan payung proyek:** *Apakah menambahkan lapisan verifikasi cryptospatial, blockchain (dengan IPFS dan smart contract), dan AI pada digital twin jalan raya memberi nilai tambah yang terukur dalam mengurangi peluang manipulasi dan mark-up data — dan berapa harganya pada latensi sinkronisasi, konsistensi data, akurasi visualisasi, dan respons sistem?*
>
> Pertanyaan ini dijawab lewat uji integrasi bersama pada §4 (skenario E0–E4): twin dasar dibandingkan dengan twin yang ditambah verifikasi cryptospatial, blockchain, AI, dan kombinasinya.

### Penajaman judul (opsional)

Ketiga judul dipertahankan sebagaimana pada tabel di atas. Bila dosen pembimbing meminta variabel terukur muncul langsung di judul (aturan 1), tersedia opsi penajaman berikut, ditambahkan di belakang judul:

| Mahasiswa | Opsi penajaman |
| :--- | :--- |
| Alvito | *: Evaluasi Latensi Sinkronisasi dan Akurasi Visualisasi* |
| Atria | *: Evaluasi Kualitas Rekomendasi dan Tingkat Halusinasi Agen* |
| Panji | *: Evaluasi Deteksi Manipulasi, Konsistensi Data, dan Biaya Penjangkaran* |

---

---

## 1. Alvito — Visualisasi & Sinkronisasi

> **Judul final:**
>
> **"Dashboard Web Infrastruktur Jalan Raya Berbasis Digital Twin dan Integrasi IoT Real-Time"**

Alvito Aryo Putra · NRP 5024 23 1077 · Pembimbing: Mochamad Hariadi, S.T., M.Sc., Ph.D · Ko-Pembimbing: Reza Fuad Rachmadi, S.T., M.T., Ph.D — *bagian ini disusun selaras dengan draft proposal tugas akhir (EC234701).*

### Fokus pekerjaan

> **Dalam bahasa sederhana:** layar tempat semua pihak melihat "kembaran digital" jalan raya — kondisi, sensor, risiko, rekomendasi, dan status keaslian data — yang diperbarui hampir seketika, tidak salah tampil, dan hanya menampilkan data sensor yang terbukti berasal dari lokasi dan perangkat yang sah.

Perancangan dan pengembangan **dashboard web sebagai titik integrasi utama prototipe**: menyatukan geometri jalan, informasi aset, dan data IoT pada satu antarmuka 3D; membangun **jalur sinkronisasi real-time** dari sensor sampai tampilan; membandingkan **tiga mekanisme pembaruan data** (REST *polling*, SSE, WebSocket); dan menambahkan **verifikasi *cryptospatial*** pada lapisan ingest untuk menjaga keaslian data lokasi IoT. Alvito juga menyediakan **simulator sensor dan instrumentasi pengukuran latensi** yang dipakai bersama oleh ketiga tugas akhir.

| Lapisan | Teknologi | Peran |
| :--- | :--- | :--- |
| Aplikasi web | **Laravel** | mengelola aplikasi web, API, dan komunikasi dengan backend; penyiar real-time (mis. Laravel Reverb + Echo) |
| Visualisasi 3D | **CesiumJS** | engine visualisasi 3D tunggal; geometri ruas dimuat lewat *data source*, status sensor ditampilkan lewat perubahan warna, label, atau penanda |
| Data geospasial | **OpenStreetMap** (utama), **Ina-Geoportal/BIG** (pendukung) → GeoJSON WGS 84 | geometri dan atribut jaringan jalan; batas administrasi, Rupa Bumi Indonesia, atau elevasi bila tersedia dan relevan |
| Keamanan lokasi | **Verifikasi *cryptospatial*** | kecocokan tanda tangan sensor dengan koordinat terdaftar (*Proof of Location*) di lapisan ingest |

> **Arahan Pak Fuad** (ko-pembimbing): pelajari CesiumJS dan ArcGIS untuk sisi *digital twin*. CesiumJS sudah menjadi engine utama pada draft proposal, sedangkan **ArcGIS belum tercantum**. Peran yang mungkin: alat bantu menelaah dan membersihkan data geospasial, atau sumber *basemap* dan *terrain* — Esri secara resmi mendukung CesiumJS untuk layanan lokasi ArcGIS. Keputusannya dibawa ke pembimbing (§6); sementara itu jalur data utama tetap OpenStreetMap + Ina-Geoportal.

| Panel dashboard | Isi | State yang ditampilkan |
| :--- | :--- | :--- |
| Peta ruas (3D) | ruas dan segmen, pewarnaan menurut kondisi atau risiko, sensor sebagai penanda | geometry, physical condition, risk |
| Panel sensor | nilai terbaru dan tren per segmen, status node, waktu pembaruan terakhir | IoT state |
| Panel keputusan | skor risiko beserta alasannya, rekomendasi, estimasi biaya, *work order*, tanda klaim melampaui batas | risk, economic state, maintenance |
| Lencana keaslian dan integritas | dua lapis: **validitas *cryptospatial*** (saat pesan masuk) dan **status penjangkaran on-chain** (menyusul) | IoT state, token state |
| Panel sistem | latensi terkini, jumlah sensor aktif, kesehatan layanan | metrik sistem (untuk pengujian) |

### Latar belakang — tiga hal yang mudah terlewat pada dashboard digital twin

Pemantauan infrastruktur jalan memerlukan pengintegrasian data geospasial, atribut aset, dan data sensor dinamis. Penyajian yang terpisah — tabel atau peta 2D konvensional — kurang efektif untuk pemantauan berkelanjutan, dan *digital twin* menawarkan representasi 3D interaktif yang terhubung dengan kondisi aktual aset. Namun representasi 3D saja belum cukup disebut *digital twin*: diperlukan mekanisme pembaruan data dan hubungan yang jelas antara objek digital dengan identitas segmen jalan. Dashboard yang menampilkannya menyimpan tiga masalah yang mudah terlewat.

**1. Usia data di layar.** Dashboard sederhana mengambil data lewat *polling* REST berkala; usia data di layar ditentukan oleh mekanisme pengambilan, bukan oleh sensornya:

```
Sensor mengirim data             : tiap 1 detik
Dashboard melakukan polling      : tiap 5 detik
Usia data di layar (rata-rata)   ≈ 2,5 detik + waktu respons + waktu render
Usia data di layar (terburuk)    ≈ 5   detik + waktu respons + waktu render
```

**Dugaan utama — harus dibuktikan lewat pengukuran, bukan diasumsikan:** leher botol latensi sinkronisasi berada pada mekanisme pengambilan data dan cara render, bukan pada sensor maupun jaringan lokal.

**2. Keaslian data.** Seiring masifnya aliran data IoT, data sensor berpotensi dimanipulasi — lokasi maupun nilainya — sebelum masuk ke dashboard. Dashboard yang cepat tetapi menampilkan data palsu lebih berbahaya daripada dashboard yang lambat, karena kepalsuan itu tampil rapi dan meyakinkan.

**3. Ketepatan tampilan.** Ketika segmen dan sensor bertambah, tampilan 3D tersendat karena ribuan objek digambar ulang, dan — yang lebih berbahaya — layar dapat menampilkan status *"baik"* padahal state sumber sudah *"rusak berat"*: salah tampil yang tidak terlihat sebagai galat.

Penelitian ini memisahkan empat hal yang biasanya tercampur: **seberapa cepat** (latensi), **seberapa banyak** (kapasitas rendering), **seberapa benar** (akurasi geometri dan status), dan **seberapa asli** (verifikasi *cryptospatial*).

### Catatan penting

**"Real-time" harus berupa angka.** Kata *real-time* pada judul bukan klaim kualitatif. Target awal pengujian: **latensi sinkronisasi p95 di bawah dua detik** pada beban rancangan. Angka ini diposisikan sebagai **sasaran eksperimental untuk tahap kalibrasi, bukan standar mutlak operasional** *digital twin*, dan dievaluasi berdasarkan hasil pengukuran. Latensi ini **tidak mencakup konfirmasi on-chain**: itu latensi lain, milik Panji, dan tidak berada di jalur kritis tampilan (lihat pembagian batas di bawah).

**Cryptospatial: apa yang diadopsi dan apa yang bukan.**

| | Penjelasan |
| :--- | :--- |
| **Cryptospatial** | paradigma yang menyatukan kriptografi terdesentralisasi dengan sistem informasi geografis untuk menjamin keaslian data geografis dan *Proof of Location* yang tidak dapat dimanipulasi (FOAM, 2018; Wibowo, 2023) |
| **Yang diadopsi** | verifikasi kecocokan tanda tangan kriptografi sensor dengan koordinat terdaftarnya pada lapisan ingest, beserta **label validitas** yang tercatat pada log untuk tiap pesan |
| **Yang diukur** | overhead latensi (V4 dibanding V2b) dan efektivitas menolak pesan dengan lokasi atau identitas palsu (P1–P5) |
| **Yang bukan** | mengembangkan jaringan blockchain atau algoritma konsensus (mis. optimasi RPBFT pada riset CSC terdahulu); membuktikan lokasi fisik perangkat lewat radio atau triangulasi |

**Mengapa 3D?** CesiumJS dipilih sebagai engine visualisasi utama karena kemampuannya menangani visualisasi skala besar. Penguji mungkin bertanya apakah 3D benar-benar lebih baik daripada peta 2D; perbandingan 2D–3D berada di luar cakupan draft proposal dan dapat dicatat sebagai pengembangan lanjutan.

### Rumusan masalah

Empat rumusan masalah dari draft proposal, dipetakan ke skenario dan metrik pengujian:

| RM | Pertanyaan | Skenario | Metrik utama |
| :--- | :--- | :--- | :--- |
| **RM1** | Bagaimana merancang dashboard web Digital Twin jalan raya yang mengintegrasikan geometri jalan, informasi aset, dan data IoT dengan CesiumJS sebagai engine visualisasi 3D? | rancangan arsitektur; baseline V0 | kelengkapan integrasi tujuh state; fungsi berjalan |
| **RM2** | Bagaimana perbedaan mekanisme pembaruan data — *polling*, Server-Sent Events (SSE), dan WebSocket — memengaruhi latensi sinkronisasi serta kesegaran informasi pada dashboard? | V0, V1, V2a, V2b | L_total (p50/p95/p99), kesegaran data, I_L |
| **RM3** | Seberapa akurat representasi geometri dan status data pada dashboard dibandingkan dengan data sumber, dan bagaimana optimasi visualisasi memengaruhi kinerja sistem ketika jumlah sensor dan segmen bertambah? | V3 dan seluruh beban 50 / 500 / 5.000 | deviasi geometri, A_status, FPS dan memori, batas kapasitas rendering |
| **RM4** | Bagaimana pengaruh penerapan mekanisme verifikasi *cryptospatial* terhadap latensi sinkronisasi dan integritas data pada dashboard Digital Twin? | V4 vs V2b; P1–P5 | O_crypto, waktu verifikasi, tingkat deteksi pemalsuan |

### Tujuan

- Merancang dan membangun dashboard web infrastruktur jalan raya berbasis *digital twin* yang mengintegrasikan data geospasial OpenStreetMap dan Ina-Geoportal dengan data IoT secara real-time melalui visualisasi CesiumJS.
- Membandingkan mekanisme pembaruan data yang berbeda untuk mengetahui pengaruhnya terhadap latensi sinkronisasi dan kesegaran informasi.
- Mengevaluasi konsistensi status, ketepatan representasi geometri, dan kinerja visualisasi pada beban uji yang bervariasi — sebagai dasar empiris memilih mekanisme sinkronisasi dan strategi visualisasi.
- Mengevaluasi dampak penambahan lapisan verifikasi *cryptospatial* terhadap latensi **dan** efektivitasnya dalam menjamin integritas data lokasi IoT.

### Kontribusi dan posisi penelitian

Bukan teknologi visualisasi baru, melainkan **karakterisasi dan perancangan integrasi real-time**: bukti empiris perbandingan mekanisme pengiriman data ke dashboard web, batas kapasitas rendering, dan harga (overhead) verifikasi *cryptospatial* — disertai prototipe dashboard terintegrasi.

> **Celah penelitian.** Penelitian *digital twin* infrastruktur jalan telah membahas arsitektur konseptual, pemeliharaan, integrasi BIM–GIS, dan pemantauan real-time pada infrastruktur tertentu. Masih terdapat celah dalam mengevaluasi **perbandingan mekanisme pengiriman data ke dashboard web** (*polling*, SSE, WebSocket) beserta dampaknya terhadap latensi dan ketepatan state objek geospasial. Posisi penelitian ini: membangun prototipe dashboard terintegrasi, melibatkan validasi keamanan lokasi (*cryptospatial*), dan memberikan hasil evaluasi kuantitatif atas kinerja sinkronisasi.

Dashboard versi sederhana (V0) dibangun lebih dulu dan **dipertahankan sebagai baseline**, bukan dibuang. Posisinya bergeser dari "hasil" menjadi "pembanding" — seluruh pekerjaan awal tetap terpakai penuh.

### Tahapan penelitian

| # | Tahap | Isi |
| :--- | :--- | :--- |
| 1 | Studi literatur dan penetapan kebutuhan | arsitektur *digital twin*, mekanisme real-time, visualisasi geospasial web, *cryptospatial*; batasan dan metrik evaluasi |
| 2 | Pemilihan koridor dan pemeriksaan data | menentukan ruas (jalan nyata atau rancangan sendiri), mengunduh geometri OpenStreetMap, memeriksa data pendukung Ina-Geoportal |
| 3 | Pemrosesan model data | membersihkan geometri, menetapkan ID segmen unik, menyusun GeoJSON, merancang skema data sensor yang konsisten (termasuk bidang tanda tangan) |
| 4 | Pembangunan baseline | dashboard dasar Laravel + CesiumJS dengan REST *polling* (V0) |
| 5 | Implementasi konfigurasi dan optimasi | *polling* interval pendek, SSE, WebSocket, optimasi rendering CesiumJS, dan **modul verifikasi *cryptospatial*** |
| 6 | Pengujian eksperimental | simulasi beban sensor bertahap pada perangkat dan jaringan seragam; *timestamp* dicatat pada log |
| 7 | Analisis data | latensi, kesegaran, konsistensi status, deviasi geometri, overhead dan efektivitas verifikasi *cryptospatial* |
| 8 | Penyusunan laporan | kesimpulan berdasarkan pengukuran empiris dan rekomendasi pengembangan |

### Rancangan pengujian

**Variabel kontrol** — perangkat lunak dan keras, topologi jaringan, ukuran area studi, dan skenario beban sensor (deterministik, *seed* statis) dipertahankan konstan.

| Kode | Konfigurasi | Tujuan |
| :--- | :--- | :--- |
| **V0** | REST *polling* (5 detik) dengan muat ulang penuh | baseline |
| **V1** | REST *polling* (1 detik) berbasis payload delta | mengukur efisiensi pembaruan data parsial |
| **V2a** | Server-Sent Events (SSE) dengan payload delta | menilai aliran data satu arah dari server |
| **V2b** | WebSocket dengan payload delta | menilai latensi koneksi dua arah persisten |
| **V3** | Mekanisme komunikasi terbaik (dari uji V1/V2) + optimasi CesiumJS (*batching*, *clustering*) | mengevaluasi kinerja kumulatif sistem |
| **V4** | WebSocket dengan payload delta + **verifikasi *cryptospatial*** | mengukur overhead validasi keamanan lokasi terhadap latensi total |

> **Rancangan ini tidak dapat gagal total.** Bila WebSocket unggul jauh, itu hasil. Bila pada skala prototipe *polling* sudah cukup, itu juga hasil — jawaban jujur tentang kapan kompleksitas tambahan layak dibayar. Demikian pula verifikasi *cryptospatial*: bila overhead-nya kecil, ia layak dipasang; bila besar, hasilnya adalah daftar kompromi yang terukur.

**Dimensi beban.** Skenario awal bertahap: **50, 500, hingga 5.000 titik sensor**, masing-masing 1 pesan per detik; jumlah klien divariasikan (mis. 1 / 10 / 50) pada konfigurasi terpilih saja (V0, V2b, V3). Bila semua dimensi dikalikan pada semua konfigurasi, matriks percobaan meledak dan tidak akan selesai tepat waktu.

**Pengujian efektivitas verifikasi *cryptospatial*.** Tujuan penelitian menyebut *efektivitas* menjamin integritas data lokasi, sehingga overhead saja belum cukup. Pesan pemalsuan disuntikkan secara terkontrol dan diuji pada V4 dibanding V3 (tanpa verifikasi):

| Kode | Pemalsuan | Mekanisme yang diuji |
| :--- | :--- | :--- |
| **P1** | Koordinat pada pesan diubah setelah ditandatangani | tanda tangan tidak lagi cocok |
| **P2** | Pesan bertanda tangan sah, tetapi koordinatnya menyimpang dari koordinat terdaftar (sensor dipindahkan atau dikloning di tempat lain) | jarak terhadap koordinat terdaftar |
| **P3** | Identitas tidak terdaftar, atau tanda tangan dibuat dengan kunci lain (peniruan sensor) | pencarian kunci pada registri |
| **P4** | Pesan sah lama dikirim ulang (*replay*) | nomor urut dan jendela waktu |
| **P5** | Koordinat benar, tetapi `segment_id` tidak sesuai dengan posisinya | kesesuaian koordinat–segmen |

Pesan asli diberi derau koordinat yang realistis (mis. galat GPS) untuk mengukur *false positive*; ambang jarak dikalibrasi dari derau tersebut. Satu kasus **dilaporkan sebagai batas, bukan diuji sebagai keberhasilan**: pesan sah bertanda tangan kunci curian pada koordinat benar (P6) akan lolos — inilah batas *Proof of Location* berbasis tanda tangan.

### Metrik pengukuran

Latensi diukur sepanjang jalur data dengan tujuh titik waktu:

```
t0 simulator ─► t1 broker ─► t2 ingest ─► t3 Laravel ─► t4 dorongan ─► t5 peramban ─► t6 render selesai
   (sensor)       (MQTT)    (+ verifikasi   (Alvito)      (Reverb /       (Echo /          (CesiumJS)
                             cryptospatial)               SSE / polling)  fetch)
```

Rumus yang dipakai (sesuai draft proposal, ditambah overhead):

```
L_total  = t6 − t0                                    latensi ujung ke ujung (p50, p95, p99)
A_status = N_sesuai / N_diperiksa × 100%              akurasi dan konsistensi status
I_L      = (L_baseline − L_uji) / L_baseline × 100%   perbaikan latensi terhadap baseline V0 (nilai positif = lebih baik)
O_crypto = L_V4 − L_V2b                               overhead verifikasi cryptospatial (juga dalam % terhadap L_V2b)
```

| Aspek | Metrik | Cara ukur |
| :--- | :--- | :--- |
| **Latensi sinkronisasi** | L_total p50 / p95 / p99, dan **per tahap** | *Timestamp* t0–t6 pada log; t6 diambil dari peristiwa `postRender` CesiumJS setelah pembaruan |
| Kesegaran data (*data freshness*) | Usia data pada layar — rata-rata dan maksimum | Selisih waktu layar terhadap waktu peristiwa terakhir |
| Perbaikan latensi | I_L tiap konfigurasi terhadap V0 | Rumus di atas |
| **Batas kapasitas rendering** | Jumlah sensor / segmen / klien maksimum sebelum p95 melewati target dan FPS menurun | Tambah beban bertahap |
| **Respons sistem** | Waktu respons API (p95), waktu muat awal, respons interaksi | `k6` atau Locust; Performance API peramban |
| **Akurasi geometri** | Deviasi posisi (meter) — rerata dan maksimum — antara geometri tampil dan geometri sumber | Bandingkan koordinat objek tampil (dikonversi ke koordinat geografis) dengan GeoJSON sumber |
| **Akurasi dan konsistensi status** | A_status | Uji otomatis: baca properti objek CesiumJS dan sampel piksel, bandingkan dengan *snapshot* backend |
| Georeferensi | Persentase peristiwa yang terpetakan ke segmen yang benar | Bandingkan dengan label segmen sumber |
| Kehilangan dan ketidakterurutan pesan | Jumlah pesan hilang, duplikat, terbalik urutan | Nomor urut per pesan (`seq`) dan log |
| **Overhead *cryptospatial*** | O_crypto dan durasi verifikasi per pesan | Selisih V4 dengan V2b; *timestamp* sebelum dan sesudah verifikasi |
| **Efektivitas verifikasi** | *True positive rate* per P1–P5; *false positive rate* pada pesan asli | Suntikan pemalsuan terkontrol |
| Kelengkapan log | Persentase pesan yang tercatat bersama label validitasnya | Pemeriksaan log |

> Baris **akurasi** wajib ada. Tanpa itu, optimasi latensi rentan dinilai "cepat tetapi menampilkan angka yang salah" dan turun derajat menjadi sekadar *benchmark*.

### Perangkat & data uji

Penelitian dilakukan pada lingkungan prototipe. Sebagai pengganti perangkat keras fisik, **simulator** mengirim pesan telemetri secara periodik dengan *seed* statis agar beban identik dan eksperimen dapat diulang.

| Data | Sumber | Penggunaan dan catatan |
| :--- | :--- | :--- |
| Geometri jalan | OpenStreetMap | acuan garis ruas, simpang, dan nama jalan; dipotong pada area studi, diperiksa, dan diberi atribusi (lisensi ODbL) |
| Data geospasial pendukung | Ina-Geoportal / BIG | unsur Rupa Bumi Indonesia, batas administrasi, atau elevasi bila tersedia dan relevan; tunduk pada metadata dan izin penggunaan |
| Telemetri IoT | simulator mandiri | nilai sensor (ID, *timestamp*, parameter) + nomor urut; untuk V4 ditambah koordinat dan tanda tangan |
| Registri CSC | berkas lokal (kunci publik + koordinat terdaftar); versi on-chain dari Panji pada integrasi | acuan verifikasi *cryptospatial* |
| State dashboard lintas modul | API backend tim | kondisi fisik dan status pemeliharaan; murni masukan state bagi dashboard |
| Data kinerja sistem | log aplikasi dan peramban | waktu respons, *timestamp* antar-tahap, pemakaian memori |

**Ruas acuan:** satu koridor atau ruas sepanjang sekitar 10–20 km dengan segmen 100 m – 1 km; cakupan akhir menyesuaikan ketersediaan dan kualitas data. Boleh berupa **jalan nyata sebagai referensi geometri** atau **jalan rancangan sendiri**, karena tujuan proyek adalah evaluasi, riset, dan eksperimen. **Data primer** dari node nyata bersifat opsional dan menunggu konfirmasi pembimbing tentang perangkat keras (§6).

**Alat ukur (kandidat):** pembangkit beban MQTT (mis. `emqtt-bench`, MQTTX), `k6` atau Locust untuk API, Playwright dan Performance API peramban untuk waktu render dan respons interaksi.

### Batasan

1. Penelitian berfokus pada **satu koridor atau ruas** jalan dengan panjang awal sekitar 10–20 km dan pembagian segmen 100 m – 1 km; cakupan akhir menyesuaikan ketersediaan dan kualitas data.
2. Data geospasial bersumber dari OpenStreetMap, dengan Ina-Geoportal sebagai sumber pendukung bila data relevan tersedia. Aplikasi web memakai Laravel, visualisasi 3D memakai CesiumJS, dan geometri jalan diproses ke format GeoJSON.
3. Data IoT dipakai untuk memperbarui status sensor pada dashboard. Bila sensor lapangan tidak tersedia, pengujian memakai simulator yang terdokumentasi. Data dari backend, model AI, dan blockchain milik anggota tim lain diintegrasikan melalui API sesuai kesepakatan.
4. Evaluasi mencakup latensi sinkronisasi, kesegaran dan konsistensi data, kehilangan atau ketidakterurutan pesan, ketepatan representasi geometri dan status, serta kinerja antarmuka. Pengujian dilakukan pada lingkungan prototipe dan **tidak mencakup pengembangan algoritma prediksi kerusakan jalan atau implementasi blockchain**.
5. *(Klarifikasi untuk menghindari salah paham penguji)* Verifikasi *cryptospatial* pada penelitian ini berarti **pemeriksaan tanda tangan sensor dan koordinat terdaftar di lapisan ingest**. Ia tidak mencakup jaringan blockchain, konsensus, maupun pembuktian lokasi fisik berbasis radio; registri on-chain adalah bagian tugas akhir Panji.
6. Hasil latensi berlaku untuk lingkungan uji terkontrol dan tidak mewakili jaringan lapangan (seluler, LoRaWAN); emulasi jaringan (mis. `tc netem`) dipakai pada skenario terpilih.

### Kriteria keberhasilan

Pengujian prototipe dinilai berhasil apabila:

- sistem mampu menampilkan **representasi geometri spasial secara akurat**;
- **seluruh riwayat perubahan data sensor terekam utuh** di dalam log beserta label validitas *cryptospatial*-nya;
- **batas maksimal toleransi pembebanan rendering** pada antarmuka dapat diidentifikasi secara kuantitatif.

Target p95 di bawah dua detik adalah sasaran eksperimental, bukan syarat kelulusan mutlak.

### Risiko & mitigasi

| Risiko | Mitigasi |
| :--- | :--- |
| Selisih jam antar-perangkat merusak pengukuran latensi satu arah | Jalankan simulator, backend, dan peramban uji pada satu mesin, atau sinkronkan lewat NTP; validasi dengan penanda *ping-pong* |
| Ketergantungan pada API backend (Panji) dan keluaran model (Atria) yang belum siap | Sepakati **kontrak data** (skema JSON dan OpenAPI) pada minggu 1–2; bangun *mock server*; integrasikan bertahap |
| **Laravel (PHP) tidak cocok menangani aliran telemetri berfrekuensi tinggi** pada proses web biasa | Penerimaan telemetri dikerjakan proses terpisah (*worker* atau layanan ingest); Laravel menerima hasilnya dan menyiarkannya lewat Reverb yang berjalan sebagai proses sendiri. Jalur ini justru bagian yang diukur |
| **Verifikasi *cryptospatial* membuat p95 melewati target** | Ukur sebagai overhead (O_crypto), jangan disembunyikan; cobalah variasi (registri di-*cache* di memori, verifikasi batch atau asinkron untuk pesan non-kritis) dan laporkan kompromi keamanan–latensinya |
| **Ambang jarak koordinat salah kalibrasi** — terlalu ketat: pesan asli ditolak (derau GPS); terlalu longgar: pemalsuan lolos | Kalibrasi dari derau simulator; laporkan kurva TPR–FPR terhadap ambang, bukan satu angka |
| Pengelolaan kunci sensor | Kunci sensor simulasi dibangkitkan dan disimpan di simulator uji; pengelolaan kunci perangkat nyata dinyatakan di luar cakupan |
| Registri CSC on-chain (Panji) belum siap | Registri lokal dengan antarmuka yang sama; diganti ke versi on-chain saat integrasi |
| CesiumJS berat pada banyak objek dan GPU kelas menengah | *Batching*, *clustering*, `requestRenderMode`; batas rendering justru salah satu keluaran penelitian |
| Data Ina-Geoportal tidak tersedia atau izin penggunaan belum jelas | Ina-Geoportal hanya pendukung (sesuai draft); OpenStreetMap atau data rancangan sendiri cukup |
| Akses atau lisensi ArcGIS (bila dipakai) belum jelas | ArcGIS tetap opsional; verifikasi lisensi kampus atau tingkat gratis lebih dulu |
| Data sensor nyata sulit diperoleh | Simulator terdokumentasi + data sekunder; **beri label "sintetis"** pada Bab 3 dan 4 |
| Cakupan melebar | V0–V4 adalah inti; hal lain (mis. 2D–3D, platform siap pakai) dicatat sebagai pengembangan lanjutan |

### Kajian pustaka (Bab 2)

Rujukan utama dari draft proposal dan relevansinya:

| Rujukan | Inti | Hubungan dengan penelitian ini |
| :--- | :--- | :--- |
| Hidayat dkk. (2022) | arsitektur *digital twin* untuk pemantauan dan pemeliharaan jalan dan jembatan di Jawa Barat; 15 jenis data terintegrasi; tantangan: ketersediaan peta dan kecepatan tampilan dashboard | sangat relevan dengan konteks Indonesia; penelitian ini mempersempit fokus pada **latensi sinkronisasi dan kinerja tampilan** CesiumJS |
| Consilvio dkk. (2023) | dukungan keputusan pemeliharaan jalan berbasis *digital twin* dengan data kondisi perkerasan | penelitian ini **tidak** membangun sistem rekomendasi (itu domain Atria); fokus pada aliran data sensor dan visualisasinya |
| Wang dkk. (2024) | ulasan arsitektur, teknologi kunci, dan tingkat kematangan *digital twin* jalan raya; kerangka lima dimensi: entitas fisik, entitas virtual, data, koneksi, layanan | landasan konseptual hubungan ruas nyata ↔ model geospasial pada dashboard |
| Wibowo (2023); FOAM (2018) | konsensus untuk *Cryptospatial Coordinate*; data lokasi dapat diamankan dan divalidasi keasliannya, tetapi validasi menambah waktu komputasi; standar terbuka *smart contract* untuk data geospasial | konsep verifikasi diadaptasi pada lapisan ingest untuk **mengukur besar overhead latensinya** pada sinkronisasi ke CesiumJS |
| Talaghat dkk. (2024); Jerez Cepa dan García Alberti (2026); Afshari dkk. (2025) | *digital twin* untuk perkerasan jalan; *digital twin* BIM–GIS untuk operasi dan pemeliharaan jalan lingkar kota; platform *digital twin* pemantauan persimpangan real-time | rujukan penerapan *digital twin* infrastruktur jalan |

Landasan teori yang dipakai pada Bab 2: *digital twin* pada infrastruktur jalan raya; GIS dan data geospasial (OpenStreetMap, Ina-Geoportal, GeoJSON RFC 7946); CesiumJS; IoT dan tiga mekanisme pembaruan real-time (*polling*, SSE, WebSocket); *cryptospatial* dan keamanan data geospasial; dashboard web sebagai antarmuka pemantauan.

> Daftar lengkap rujukan draft proposal ada di §6. Rujukan belum saya verifikasi satu per satu; tim perlu memeriksa DOI dan isi sebelum dikutip.

### Pembagian batas dengan Panji

Keduanya menyentuh *latensi*, *konsistensi*, dan *keaslian data*, sehingga batasnya perlu ditegaskan sejak proposal:

| | **Alvito** | **Panji** |
| :--- | :--- | :--- |
| Pertanyaan | Seberapa cepat, benar, dan asli state tampil? | Seberapa terjamin state tidak diubah, dan seberapa konsisten data antar-penyimpanan? |
| Variabel terikat | Latensi sinkronisasi, akurasi visualisasi, respons antarmuka, overhead dan efektivitas verifikasi | Tingkat deteksi manipulasi, konsistensi tiga arah, biaya dan latensi penjangkaran |
| Yang divariasikan | Mekanisme pengiriman dan render; ada atau tidaknya verifikasi *cryptospatial* | Strategi tokenisasi dan penjangkaran; arsitektur penyimpanan |
| ***Cryptospatial*** | **Verifikasi** tiap pesan di ingest (tanda tangan + koordinat vs registri); label validitas; overhead dan efektivitas | **Registri CSC** on-chain agar koordinat dan kunci terdaftar tidak dapat diganti diam-diam; penjangkaran log validitas |
| Latensi diperlakukan sebagai | **Objek penelitian** — sensor → tampil, termasuk verifikasi (hitungan detik) | **Biaya** yang diukur — peristiwa → terkonfirmasi on-chain (detik hingga menit) |

> Dua latensi, dua pemilik. Verifikasi *cryptospatial* **berada di jalur kritis** tampilan karena pesan harus diperiksa sebelum memperbarui state — itu sebabnya overhead-nya diukur pada V4. Sebaliknya, **konfirmasi on-chain tidak boleh berada di jalur kritis**: data valid tampil lebih dulu, lalu lencana penjangkaran berubah menjadi *terverifikasi* setelah transaksi terkonfirmasi. Pemisahan ini membuat KPI latensi Alvito tidak "dihukum" oleh biaya integritas Panji, dan biaya itu tetap terukur di tempat yang semestinya.

---

---

## 2. Atria — Analisis Risiko & Prediksi

> **Judul final:**
>
> **"Pengembangan Model AI Agentic Berbasis Computer Vision untuk Analisis Risiko dan Prediksi Pemeliharaan pada Digital Twin Jalan"**

### Fokus pekerjaan

Menganalisis dan membangun **lapisan kecerdasan** twin: mengubah data yang masuk secara real-time menjadi rekomendasi pemeliharaan. Empat tahap dikerjakan berurutan, masing-masing menghasilkan state untuk twin:

| Tahap | Pertanyaan | Keluaran ke twin |
| :--- | :--- | :--- |
| **1. Persepsi** (*computer vision*) | Kerusakan apa, di mana, seberapa parah? | state *physical condition* |
| **2. Risiko** | Segmen mana yang paling berisiko, dan mengapa? | state *risk* beserta faktor penyebab |
| **3. Prediksi** | Bagaimana kondisi berkembang, kapan pemeliharaan diperlukan? | proyeksi kondisi dan estimasi *economic state* |
| **4. Agen** | Apa yang sebaiknya dikerjakan lebih dulu, dengan alasan apa? | state *maintenance* (rekomendasi) |

### Catatan penting: computer vision, model prediksi, dan agen bukan alternatif

Ketiganya adalah **tahap berbeda dalam satu pipeline**, bukan pilihan A-atau-B:

```
Citra / video jalan
      │
      ▼
[ DETEKTOR CV ]   YOLO / RT-DETR            → temuan: jenis, lokasi, tingkat kerusakan
      │
      ▼
[ RISIKO ]        fusi aturan atau model    → skor risiko per segmen + faktor penyebab
      │
      ▼
[ PREDIKSI ]      regresi / GBM / Markov    → proyeksi kondisi dan waktu pemeliharaan
      │
      ▼
[ AGEN ]          LLM + alat (tool calling) → rekomendasi pemeliharaan beralasan
```

Agen tidak mendeteksi kerusakan dan tidak boleh berhitung sendiri: ia **memilih alat, membaca keluarannya, dan menyusun rekomendasi**. Angka — skor, biaya, anggaran — selalu berasal dari alat, bukan dari "ingatan" model bahasa. Pemisahan inilah yang membuat halusinasi dapat diukur: setiap klaim numerik pada rekomendasi harus dapat ditelusuri ke keluaran alat.

Lalu bagaimana dengan kritik *"deteksi kerusakan jalan pakai YOLO sudah jenuh"*? Dua hal ini perlu dipisahkan:

| Anggapan | Kenyataan |
| :--- | :--- |
| "Detektor YOLO teknologinya usang" | ❌ Tidak — keluarga YOLO masih menjadi standar praktis untuk deteksi objek |
| "Topik *deteksi kerusakan jalan menggunakan YOLO* sudah jenuh" | ✅ Benar — inilah yang sebenarnya dikritik |
| "Agentic berarti AI memutuskan sendiri" | ❌ Tidak — pada proyek ini agen **merekomendasikan**, manusia memutuskan |
| "Agen LLM pasti lebih baik daripada aturan sederhana" | ❓ Itulah yang diuji — bisa jadi aturan sederhana sudah cukup |

**Solusinya bukan mengganti detektor, melainkan memindahkan klaim kebaruan ke lapisan di atasnya.** Detektor justru sengaja dipertahankan dan dikunci:

> *"Detektor dibuat konstan sebagai **variabel kontrol**, agar perbedaan hasil murni berasal dari lapisan risiko, prediksi, dan agen yang dibandingkan."*

Kalimat itu mengubah "hanya memakai YOLO" dari kelemahan menjadi rancangan eksperimen yang sahih.

### Masalah yang diangkat

Alur yang berhenti pada "terdeteksi 14 lubang" belum menjawab pertanyaan yang sebenarnya dihadapi pengelola jalan: segmen mana dikerjakan lebih dulu, seberapa mendesak, penanganan apa, berapa biaya, dengan anggaran terbatas. **Jumlah temuan bukan keputusan.**

```
Temuan CV (ilustrasi)
  Segmen A : 12 retak halus, 0 lubang   · LHR rendah  · kondisi kering
  Segmen B :  2 lubang                  · LHR tinggi  · musim hujan · getaran node naik 40%

Peringkat menurut jumlah temuan : A (12) > B (2)  → prioritas A                    ❌
Keputusan yang masuk akal       : B lebih berisiko
                                  (lubang + beban lalu lintas + cuaca + tren getaran) ✅
```

Keputusan seperti ini memerlukan penggabungan sumber — citra, IoT, lalu lintas, cuaca, biaya — dan penalaran atas gabungan itu. Di sinilah lapisan risiko dan agen diletakkan.

### Pertanyaan inti — yang menaikkan kelas penelitian ini

> **Apakah metrik standar visi komputer (mAP) benar-benar memprediksi kualitas keputusan pemeliharaan — dan apakah lapisan agentik memberi nilai tambah di atas aturan ambang dan pipeline non-agentik?**

Literatur deteksi kerusakan jalan lazim mengoptimasi mAP atau F1 — metrik yang dirancang untuk riset deteksi. Namun keputusan pemeliharaan bergantung pada tingkat keparahan, lokasi, beban lalu lintas, dan anggaran. Detektor dengan mAP tertinggi belum tentu menghasilkan urutan prioritas terbaik: satu lubang yang terlewat pada ruas padat dapat lebih merugikan daripada sepuluh retak halus yang terlewat pada ruas sepi. Pertanyaan ini jarang diuji langsung pada kasus pemeliharaan jalan — *verifikasi pada kajian pustaka*.

> **Pertanyaan ini tidak dapat gagal.** Bila mAP berkorelasi kuat dengan kualitas rekomendasi, itu hasil — pemilihan detektor cukup berpatokan pada mAP. Bila korelasinya lemah, itu hasil yang jauh lebih menarik: benchmark deteksi ternyata bukan panduan yang tepat untuk keputusan pemeliharaan.
>
> Demikian pula untuk agen. Bila agen tidak mengungguli aturan sederhana, itu hasil jujur: kompleksitasnya tidak sepadan pada skala data ini. Bila agen unggul hanya pada kasus tertentu (data hilang, data konflik), itu juga hasil: petakan kapan agen layak dipakai.

### Rumusan masalah

1. Seberapa akurat detektor yang dikunci mengenali jenis dan tingkat kerusakan pada citra jalan nasional, mengingat dataset publik terkenal berasal dari negara lain (*domain shift*)?
2. Seberapa sesuai skor risiko hasil fusi (kondisi fisik, IoT, lalu lintas, ekonomi) dengan penilaian acuan, dibandingkan peringkat yang hanya memakai jumlah temuan?
3. Seberapa akurat model prediksi memproyeksikan perburukan kondisi segmen dibandingkan baseline sederhana (mis. kondisi tidak berubah atau deteriorasi linear)?
4. Apakah lapisan agentik menghasilkan rekomendasi yang lebih sesuai, lebih berdasar data (*groundedness*), dan lebih sedikit halusinasi dibandingkan aturan ambang dan pipeline non-agentik — dan sejauh mana mAP memprediksi kualitas rekomendasi?

### Tujuan

- Membangun modul persepsi (detektor terkunci, di-*fine-tune* minimal) yang menghasilkan state kondisi fisik per segmen — jenis, lokasi, tingkat keparahan.
- Merancang skor risiko multi-sumber yang **dapat dijelaskan** (faktor penyebab ikut dikeluarkan).
- Membangun model prediksi pemeliharaan yang sederhana dan dapat dijelaskan.
- Membangun agen (alat + penalaran) yang membaca state twin real-time dan menghasilkan rekomendasi terstruktur beralasan, lalu mengukurnya terhadap baseline.
- Menghasilkan **peta keputusan**: kapan agen layak dipakai, kapan aturan sederhana sudah cukup, dan kapan keputusan wajib diserahkan ke manusia.

### Kontribusi

Bukan detektor atau model baru, melainkan **rancangan dan evaluasi lapisan keputusan di atas detektor**: fusi risiko, prediksi, dan agen yang terukur; bukti empiris tentang kapan agen layak dipakai; serta metodologi mengevaluasi rekomendasi — *groundedness* dan tingkat halusinasi — terhadap kunci jawaban yang dapat direplikasi.

### Rancangan agen (usulan awal)

Agen bekerja dengan loop alat yang sederhana. Kerangka agen siap pakai boleh dipakai, tetapi bukan keharusan — loop sederhana lebih mudah dievaluasi dan dijelaskan.

| Alat | Fungsi | Sumber |
| :--- | :--- | :--- |
| `get_segment_state` | membaca seluruh state satu segmen | API twin |
| `get_sensor_trend` | tren IoT dalam jendela waktu | API twin |
| `run_risk_model` | skor risiko beserta faktor penyebab | modul risiko |
| `run_forecast` | proyeksi kondisi dan waktu pemeliharaan | modul prediksi |
| `estimate_cost` | estimasi biaya dari asumsi harga satuan | modul biaya |
| `check_integrity` | status integritas rekaman — *terverifikasi* atau *tidak cocok* | API integritas (Panji) |
| `rank_under_budget` | menyusun prioritas di bawah batas anggaran | pemecah deterministik (mis. *greedy* atau *knapsack*) |

Keluaran agen berupa **JSON terstruktur**: `segment_id`, `tindakan`, `prioritas`, `alasan`, `bukti[]` (tiap bukti merujuk satu panggilan alat dan satu nilai), dan `ketidakpastian`. Struktur ini yang memungkinkan *groundedness* diperiksa otomatis — validator mencocokkan setiap bukti dengan keluaran alat yang tercatat. Pemilihan di bawah anggaran dikerjakan alat deterministik; LLM tidak diminta berhitung.

### Rancangan pengujian

**Variabel kontrol** — dibuat identik di seluruh percobaan: detektor (satu versi, satu bobot), dataset dan pembagian data, *snapshot* state twin, LLM (satu versi, suhu rendah), dan himpunan skenario uji.

| Lapis | Yang dibandingkan | Metrik | Ground truth |
| :--- | :--- | :--- | :--- |
| **1. Persepsi** | Detektor terkunci: kinerja per kelas dan per domain (data publik vs data lokal) | mAP@0.5, F1 per kelas, galat estimasi keparahan | Anotasi set uji lokal; label dataset publik |
| **2. Risiko** | Peringkat jumlah temuan · skor aturan berbobot · skor model | Korelasi peringkat (Spearman/Kendall), kesepakatan *top-k* | Peringkat acuan dari aturan tertulis dan penilai |
| **3. Prediksi** | Kondisi tak berubah · deteriorasi linear · model (mis. *gradient boosting*) | MAE/RMSE indeks kondisi, akurasi kelas kondisi | Data deteriorasi uji (publik atau sintetis terkalibrasi) |
| **4. Rekomendasi** | Aturan ambang · pipeline non-agentik · agen | Kesesuaian dengan rekomendasi acuan, *groundedness*, tingkat halusinasi | Rekomendasi acuan + *snapshot* state twin |

| Kode | Konfigurasi | Peran |
| :--- | :--- | :--- |
| **A0** | Peringkat menurut jumlah temuan CV, tanpa fusi | baseline paling sederhana |
| **A1** | Skor risiko aturan berbobot (kondisi + lalu lintas + cuaca) → rekomendasi berbasis ambang | baseline berbasis aturan |
| **A2** | Model risiko dan prediksi (mis. *gradient boosting*) → rekomendasi dari templat | pipeline non-agentik |
| **A3** | **Agen** (LLM + alat) | pipeline utama |
| **A4** | A3 + *guardrail*: validator menolak keluaran yang tidak berbukti | varian dengan pengaman |

> **Rancangan ini tidak dapat gagal total.** Bila A3 unggul, itu hasil. Bila A1 atau A2 sudah setara, itu juga hasil — dan temuan yang lebih menarik karena berlawanan dengan asumsi bahwa "agen pasti lebih pintar".

**Himpunan skenario uji — ditetapkan sebelum pengujian dimulai**, agar hasil tidak dipilih-pilih (*cherry-picking*). Total 30–50 skenario segmen, kira-kira merata pada empat kondisi data:

| Kondisi | Deskripsi | Yang diuji |
| :--- | :--- | :--- |
| **K1 Normal** | Data lengkap dan konsisten | kemampuan dasar |
| **K2 Data hilang** | Satu atau lebih sumber (mis. sensor) tidak tersedia | penanganan ketidaklengkapan; berani menjawab "tidak cukup data" |
| **K3 Data konflik** | Mis. CV menunjukkan kerusakan berat sementara IoT normal | penalaran lintas sumber |
| **K4 Data tak terverifikasi** | Nilai dimanipulasi dan ditandai *tidak cocok* oleh lapisan integritas (Panji) | apakah agen memakai status integritas sebelum mempercayai data |

**Sub-eksperimen korelasi (untuk pertanyaan inti).** Pada eksperimen utama (A0–A4) detektor dikunci. Untuk menjawab apakah mAP memprediksi kualitas rekomendasi, dibuat sub-eksperimen terpisah yang memvariasikan kualitas detektor secara terkendali (3–5 titik mAP, mis. *checkpoint* awal vs akhir, ukuran model, atau ambang kepercayaan). Pada tiap titik, kualitas rekomendasi pipeline terbaik diukur, lalu dihitung koefisien korelasinya. Dipisah agar matriks percobaan utama tetap kecil.

### Kunci jawaban (ground truth)

Kualitas risiko dan rekomendasi tidak memiliki kunci jawaban otomatis. Dua lapis dipakai bersama:

- **Aturan acuan tertulis** — dari pedoman pemeliharaan jalan resmi (mis. Bina Marga; *verifikasi dokumen terbaru*) dan ambang indeks kondisi yang lazim di Indonesia (mis. IRI dan SDI), sehingga kunci jawaban dapat direplikasi.
- **Penilai manusia** — 2–3 penilai (dosen atau praktisi) menilai subset skenario; kesepakatan antar-penilai dilaporkan (mis. Cohen's κ, atau κ berbobot untuk skala ordinal).

### Metrik pengukuran

| Aspek | Metrik | Cara ukur |
| :--- | :--- | :--- |
| Persepsi | mAP@0.5, F1 per kelas, galat estimasi keparahan | Set uji lokal 200–300 frame + set uji publik |
| Kualitas risiko | Korelasi peringkat, kesepakatan *top-k* | Terhadap peringkat acuan |
| Kualitas prediksi | MAE/RMSE indeks kondisi, akurasi kelas kondisi | Terhadap data deteriorasi uji; dibanding baseline sederhana |
| **Kualitas rekomendasi** | Kesesuaian urutan prioritas dan jenis penanganan dengan acuan | Aturan acuan + penilai; kesepakatan antar-penilai |
| **Groundedness & halusinasi** | Proporsi klaim yang terverifikasi terhadap keluaran alat; proporsi klaim tak didukung atau bertentangan dengan state | Keluaran terstruktur dengan bukti per klaim + validator otomatis + pemeriksaan manual pada sampel |
| Perilaku agen | Keberhasilan pemanggilan alat, jumlah langkah per rekomendasi, **konsistensi antar-run** | Jalankan tiap skenario *k* kali (mis. 5); log seluruh pemanggilan alat |
| **Respons sistem** | Latensi inferensi CV, waktu per rekomendasi, biaya per rekomendasi (token atau waktu) | Instrumentasi |
| Korelasi | Koefisien korelasi mAP ↔ kualitas rekomendasi | Sub-eksperimen korelasi |

> Baris **groundedness dan halusinasi** jangan dilewatkan. Inilah kelemahan agen yang paling berbahaya bagi keputusan publik: agen yang menyatakan *"segmen aman"* padahal datanya menunjukkan sebaliknya jauh lebih merugikan daripada agen yang menjawab *"data tidak cukup"*. Pengukuran seperti ini masih jarang dilakukan pada tugas akhir sejenis, sehingga menjadi nilai lebih.

### Perangkat & data uji

**Persepsi (CV):** detektor satu versi dan satu bobot, di-*fine-tune* dari dataset publik deteksi kerusakan jalan (mis. RDD2022: retak memanjang D00, retak melintang D10, retak buaya D20, lubang D40) dan, bila memungkinkan, data lokal dari koridor terpilih (video kamera ponsel atau kamera dasbor kendaraan). Set uji lokal dibatasi **200–300 frame** beranotasi manual.

**Data IoT dan lalu lintas:** dari simulator Alvito dan parameter LHR yang dinyatakan eksplisit.

**Data deteriorasi untuk prediksi:** data publik bila ada (mis. LTPP — *verifikasi ketersediaan dan lisensi*), atau data sintetis dari model deteriorasi terdokumentasi yang dikalibrasi. Apa pun yang dipakai **diberi label jelas** pada bab hasil.

**LLM:** satu versi dikunci (API atau lokal), suhu rendah; versi dan tanggal pengambilan dicatat. **Perangkat:** GPU yang tersedia atau layanan komputasi awan; dicatat dan dikunci.

### Batasan

- Kelas kerusakan dibatasi **empat** (retak memanjang, retak melintang, retak buaya, lubang); jenis kerusakan lain di luar cakupan.
- Jenis perkerasan: aspal (perkerasan lentur) saja.
- Detektor dikunci — arsitektur detektor bukan objek penelitian. LLM tidak dilatih ulang; hanya rekayasa *prompt*, alat, dan validasi.
- Agen **hanya merekomendasikan**; tidak mengeksekusi tindakan di dunia nyata, dan setiap rekomendasi memerlukan persetujuan manusia.
- Prediksi memakai model sederhana yang dapat dijelaskan dan data deteriorasi publik atau sintetis terkalibrasi — klaim terbatas pada **metodologi pada prototipe**, bukan akurasi lapangan.
- Estimasi biaya memakai asumsi harga satuan yang dinyatakan eksplisit — bukan RAB resmi.
- Satu koridor jalan nasional.

### Risiko & mitigasi

| Risiko | Mitigasi |
| :--- | :--- |
| ***Domain shift*** — dataset publik berasal dari negara lain, kondisi jalan dan kamera berbeda | Uji pada set lokal; laporkan penurunan akurasi sebagai hasil; *fine-tune* pada sebagian data lokal |
| **Kunci jawaban ahli sulit atau mahal diperoleh** | Aturan acuan tertulis + 2–3 penilai pada 30–50 skenario; laporkan kesepakatan antar-penilai |
| Data deteriorasi nyata tidak tersedia | Data publik atau sintetis terkalibrasi, **diberi label jelas**; prediksi diposisikan sebagai pembuktian metodologi |
| Perilaku LLM berubah antar-versi dan tidak deterministik | Kunci versi dan tanggal; jalankan *k* kali dan laporkan varians; simpan log seluruh pemanggilan alat |
| Cakupan melebar karena empat tahap sekaligus | Prioritaskan tahap 2 dan 4 sebagai kontribusi; tahap 1 memakai detektor terkunci dengan *fine-tuning* minimal; tahap 3 dimulai dari baseline sederhana — bila model prediksi tersendat, baseline terdokumentasi tetap menjadi hasil dan klaim dipersempit pada Bab Batasan |
| Hasil "agen lebih baik" hanya pada contoh terpilih | Himpunan skenario ditetapkan sebelum pengujian dan mencakup kondisi K1–K4 |
| Biaya API LLM membengkak | Anggaran token, *caching*, batasi jumlah skenario dan jumlah pengulangan; atau pakai model lokal |
| Citra jalan memuat pelat nomor dan wajah | Buramkan otomatis sebelum disimpan atau ditampilkan; untuk pelatihan, pakai dataset publik |

### Etika & keselamatan

Rekomendasi pemeliharaan menyangkut keselamatan pengguna jalan dan anggaran publik, sehingga beberapa ketentuan desain diterapkan sekaligus menjadi bahan pembahasan:

- **Manusia memutuskan.** Agen merekomendasikan; setiap rekomendasi beserta buktinya dicatat dan dijangkarkan oleh lapisan integritas (Panji) sebagai jejak audit.
- **"Tidak cukup data" adalah jawaban yang sah.** Agen dirancang dan diuji agar berani menolak menyimpulkan, bukan mengisi kekosongan dengan tebakan yang meyakinkan.
- **Privasi citra.** Citra jalan dapat memuat pelat nomor dan wajah orang — data pribadi di mata UU PDP No. 27/2022. Penyamaran dilakukan sebelum penyimpanan.
- **Bobot lalu lintas dapat menggeser prioritas** ke ruas padat dan mengabaikan ruas sepi. Bobot dilaporkan secara transparan dan dapat diubah pengguna; dampaknya dibahas sebagai implikasi.

### Kajian pustaka (Bab 2)

| Matriks | Kandidat | Kriteria |
| :--- | :--- | :--- |
| Detektor kerusakan jalan | keluarga YOLO, RT-DETR | kinerja pada kelas D00–D40, kecepatan, lisensi (mis. YOLO versi Ultralytics berlisensi AGPL-3.0 — periksa implikasinya bila hasil akan dikomersialkan) |
| Model risiko dan prediksi | skor aturan berbobot, *gradient boosting*, rantai Markov | kebutuhan data, keterjelasan, kinerja pada data sintetis |
| Rancangan agen | loop alat sederhana, kerangka agen (mis. LangGraph), antarmuka alat (*tool calling*, MCP) | keterlacakan, kemudahan evaluasi, ketergantungan pada vendor |
| Evaluasi keluaran LLM | validator bukti otomatis, penilaian manusia, LLM sebagai penilai | keandalan, biaya, bias |

> Daftar kandidat perlu diperbarui saat penelitian dimulai, karena model, kerangka, dan lisensi bergerak cepat.

### Pembagian batas dengan Alvito

| | **Atria** | **Alvito** |
| :--- | :--- | :--- |
| Pertanyaan | Seberapa tepat risiko, prediksi, dan rekomendasinya? | Seberapa cepat dan seberapa benar hasilnya tampil? |
| Variabel terikat | mAP/F1, korelasi peringkat risiko, galat prediksi, kesesuaian dan halusinasi rekomendasi | Latensi sinkronisasi, akurasi visualisasi, respons antarmuka |
| Yang divariasikan | Lapisan risiko, prediksi, dan agen | Mekanisme pengiriman dan render |
| "Respons sistem" berarti | Latensi inferensi dan waktu per rekomendasi | Latensi render dan respons interaksi |
| Skor risiko diperlakukan sebagai | **Objek penelitian** — benarkah? | **Data yang ditampilkan** — tampil sesuai sumber? |

> Bila peta menampilkan segmen merah padahal skornya rendah, pertanyaannya ada dua: *apakah skornya benar?* (Atria) dan *apakah tampilannya setia pada skor?* (Alvito). Keduanya diuji terpisah, sehingga kesalahan dapat ditelusuri ke lapisan yang tepat.

---

---

## 3. Panji — Integritas Data & Backend

> **Judul final:**
>
> **"Implementasi Smart Contract Blockchain untuk Tokenisasi Aset dan Integritas Data Pemeliharaan pada Sistem Digital Twin Jalan Raya"**

### Fokus pekerjaan

> **Dalam bahasa sederhana:** "buku catatan yang tidak dapat dihapus atau dikoreksi diam-diam" untuk data, bukti, dan perjanjian pemeliharaan jalan — ditambah "dapur" (backend) yang menyiapkan data bagi dashboard dan AI.

Dua lapis dikerjakan bersamaan, dengan bobot akademik pada lapis kedua:

| Lapis | Isi | Peran |
| :--- | :--- | :--- |
| **Backend** | Penerimaan data IoT, validasi, penyimpanan geometri dan deret waktu, API, *event bus* | **fondasi bersama** — dipakai Alvito dan Atria |
| **Integritas** | Tokenisasi aset dan rekaman pemeliharaan, penyimpanan bukti di **IPFS**, penjangkaran CID, *smart contract* (token, perjanjian, alur persetujuan), verifikasi | **kontribusi akademik** — diukur terhadap baseline |

Teknologi sisi blockchain mengikuti arahan Pak Fuad (pembimbing 2): belajar **IPFS**. Backend dibangun dari **komponen siap pakai**, bukan dikembangkan dari nol; kontribusi akademik terletak pada lapisan integritas.

### Catatan penting: "mengonversi data menjadi token" tidak berarti menyimpan data di blockchain

Data mentah tidak "diubah menjadi token" secara harfiah. Yang terjadi adalah rantai transformasi berikut — data mentah tetap berada di luar rantai, sedangkan sidik jarinya dijangkarkan:

```
Data mentah (telemetri sensor · hasil CV · rekaman pemeliharaan · berkas bukti · dokumen syarat)
      │  tetap tersimpan di luar rantai: basis data (kueri cepat) dan IPFS (bukti dan arsip)
      ▼
[ BATCH BERKAS ]    data dikelompokkan (mis. per segmen per jam) dan dibakukan: urutan bidang, satuan, zona waktu
      ▼
[ IPFS ]            berkas ditambahkan dan di-pin → CID (sidik jari isi berkas; berubah bila isi berubah sedikit pun)
      ▼
[ SMART CONTRACT ]  mencatat CID + metadata (segmen, periode, penandatangan); memperbarui token segmen atau work order
      ▼
[ VERIFIKASI ]      siapa pun dapat mengambil berkas dari IPFS dan mencocokkan CID dengan catatan di rantai
```

Beberapa anggapan umum perlu dipisahkan dari kenyataannya:

| Anggapan | Kenyataan |
| :--- | :--- |
| "Blockchain menyimpan seluruh data sensor" | ❌ Tidak — terlalu mahal dan lambat; yang dicatat hanya CID dan metadata |
| "Blockchain menjamin data itu benar" | ❌ Tidak — ia menjamin data **tidak berubah setelah dicatat**; data salah dari sumber tetap tercatat dengan rapi (*garbage in, garbage out*) |
| "Blockchain mencegah data palsu" | ◐ Sebagian — pemalsuan **riwayat** terdeteksi; penyuntikan data palsu **dari sumber** hanya dapat dipersempit lewat identitas dan tanda tangan perangkat (*oracle problem*) |
| "IPFS menyimpan data selamanya dan rahasia" | ❌ Tidak — IPFS menjamin **keaslian isi** (CID cocok), bukan **ketersediaan**: berkas hilang bila tidak ada node yang menyimpannya (*pin*). Dan data bersifat **publik secara bawaan** — siapa pun yang memegang CID dapat mengambilnya, sehingga data sensitif harus dienkripsi sebelum ditambahkan |
| "Topik *blockchain untuk integritas data* sudah umum" | ✅ Benar — inilah yang sebenarnya dikritik |

**Solusinya bukan menghindari blockchain, melainkan memindahkan klaim kebaruan ke pengukuran.** Pembandingnya sengaja dibuat kuat:

> *"Basis data biasa, log audit append-only, dan log berantai-hash dibuat sebagai pembanding, agar nilai tambah blockchain terukur — bukan diasumsikan."*

### Model ancaman — apa yang dilindungi

Klaim "menghindari data fraud dan *mark-up*" terlalu lebar untuk diuji. Ia dipecah menjadi sepuluh skenario yang konkret, masing-masing dengan cakupan yang dinyatakan jujur:

| Kode | Skenario manipulasi | Mekanisme deteksi atau pencegahan yang diuji | Cakupan |
| :--- | :--- | :--- | :--- |
| **T1** | Mengubah nilai rekaman lama (mis. IRI "diperbaiki") | CID yang dihitung ulang tidak cocok dengan CID di rantai | ✅ penuh |
| **T2** | Menghapus rekaman atau berkas | CID tercatat di rantai tetapi isi tidak dapat diambil atau tidak cocok; jumlah berkas per periode tidak cocok | ✅ terdeteksi · ◐ pemulihan bergantung pada salinan (*pin*) |
| **T3** | Menyisipkan rekaman palsu bertanggal mundur | rekaman tidak tercakup CID periode yang sudah terjangkar; cap waktu blok vs cap waktu rekaman | ✅ penuh, untuk periode yang sudah terjangkar |
| **T4** | Mengubah urutan rekaman | nomor urut (`seq`) di dalam berkas | ✅ penuh |
| **T5** | *Replay* data lama sebagai data baru | nomor urut + jendela waktu yang diwajibkan | ✅ penuh bila `seq` diwajibkan |
| **T6** | Mengubah berkas bukti (foto, laporan) setelah dicatat | CID berkas bukti berubah | ◐ perubahan terdeteksi; **bukti yang direkayasa sebelum dicatat tidak** |
| **T7** | Mengubah isi syarat atau perjanjian setelah disetujui | CID dokumen syarat dicatat bersama persetujuan; perubahan berarti versi baru yang memerlukan persetujuan ulang | ✅ penuh |
| **T8** | Klaim ganda, atau pencairan sebelum syarat terpenuhi | aturan *smart contract* — mesin status menolak transisi yang tidak sah | ✅ penuh (logika kontrak) |
| **T9** | Penggelembungan (*mark-up*) volume atau harga pada klaim | estimasi wajar (rentang, dari Atria) dan klaim sama-sama tercatat permanen; klaim di atas batas toleransi masuk status DITINJAU | ◐ blockchain menjamin jejak, **bukan kewajaran harga** — kewajaran dinilai estimasi (Atria) dan manusia |
| **T10** | Menyamar sebagai perangkat sensor | tanda tangan digital per node | ◐ sebagian — kebocoran kunci perangkat di luar cakupan |

### Pertanyaan inti — yang menaikkan kelas penelitian ini

> **Apakah penjangkaran berbasis IPFS dan smart contract benar-benar memberi nilai tambah dibanding log audit biasa — dan berapa harganya dalam latensi, throughput, dan biaya?**

Narasi "blockchain untuk integritas" lazim mengasumsikan blockchain pasti lebih baik. Padahal pada satu organisasi dengan administrator yang dipercaya, log berantai-hash biasa dapat memberi jaminan serupa tanpa biaya konsensus. Nilai blockchain muncul ketika ada **banyak pihak yang tidak saling percaya penuh** — pemilik jalan, pelaksana, pengawas, auditor — dan tidak ada satu administrator yang dipercaya semuanya.

> **Pertanyaan ini tidak dapat gagal.** Bila blockchain mendeteksi atau mencegah manipulasi yang lolos dari baseline, itu hasil. Bila baseline hash-chain setara pada model ancaman tertentu, itu hasil yang lebih jujur: tunjukkan pada model kepercayaan apa blockchain layak dipakai dan pada model apa tidak.
>
> Inilah yang membedakan penelitian ini dari sekadar "menerapkan blockchain" menjadi "menguji kapan blockchain layak".

### Rumusan masalah

1. Bagaimana merancang skema tokenisasi (aset segmen, rekaman pemeliharaan, perjanjian) dan penjangkaran data (berkas di IPFS, CID di *smart contract*) sehingga catatan tidak dapat diubah atau dihapus diam-diam, tanpa menyimpan data mentah di rantai?
2. Seberapa besar tingkat deteksi atau pencegahan manipulasi (T1–T10) pada skema berbasis IPFS dan *smart contract* dibandingkan baseline — basis data biasa, log audit, dan log berantai-hash — dan pada ancaman mana blockchain memberi nilai tambah?
3. Berapa biaya integritas — latensi konfirmasi, throughput, biaya gas, serta latensi dan ketersediaan IPFS — dan bagaimana strategi *batching* menggeser *trade-off* tersebut?
4. Bagaimana arsitektur backend menjaga konsistensi tiga arah (basis data ↔ IPFS ↔ on-chain) dan waktu respons API saat beban IoT tinggi dan saat terjadi kegagalan (broker, node, transaksi gagal, pesan duplikat)?

### Tujuan

- Merumuskan model ancaman dan skema tokenisasi yang eksplisit.
- Mengimplementasikan *smart contract* (registri aset, penjangkaran CID, perjanjian dan siklus pemeliharaan, kontrol akses, batas toleransi klaim) beserta pengujian dan analisis keamanan dasar.
- Membangun backend (ingest → penyimpanan → IPFS → API → penjangkaran → *indexer*) dari komponen siap pakai.
- Mengukur tingkat deteksi atau pencegahan manipulasi, konsistensi data, dan biaya terhadap baseline non-blockchain.
- Menyediakan kontrak data, API, dan endpoint verifikasi untuk Alvito dan Atria.

### Kontribusi

Bukan blockchain atau algoritma konsensus baru, melainkan **perancangan dan karakterisasi tokenisasi, penjangkaran, dan perjanjian digital pada konteks pemeliharaan jalan**: model ancaman yang eksplisit, perbandingan terhadap baseline non-blockchain, pengukuran biaya–manfaat, dan arsitektur backend referensi yang konsistensinya terukur. Hasil akhirnya adalah bukti empiris tentang model kepercayaan mana yang membenarkan biaya blockchain.

### Rancangan tokenisasi dan perjanjian (usulan awal)

| Token | Mewakili | Standar kandidat | State on-chain | Catatan |
| :--- | :--- | :--- | :--- | :--- |
| **Token aset segmen** | satu segmen jalan | ERC-721, tidak dapat dipindahtangankan (*non-transferable*) | `segmentId`, pemegang (*custodian*), CID terakhir, versi | tidak diperdagangkan |
| **Token pemeliharaan** | satu *work order* | ERC-721 atau ERC-1155 | status siklus, CID syarat dan bukti, penandatangan, estimasi (bawah–atas), klaim | transisi status dipaksa oleh kontrak |

> **Prinsip hemat biaya:** riwayat disimpan sebagai *event* (log), dan hanya state terakhir yang ditulis ke *storage* — menulis storage jauh lebih mahal daripada menerbitkan event. ERC-1155 mendukung operasi batch yang dapat menekan biaya; pilihan antara ERC-721 dan ERC-1155 dibuat berdasarkan pengukuran gas, bukan selera. Nilai uang direpresentasikan sebagai bilangan bulat satuan uji; **tidak ada transfer uang riil**.

Kewenangan dipisah per peran dan dipaksa oleh kontrak (mis. pustaka kontrol akses OpenZeppelin). Pada prototipe, peran disimulasikan dengan akun uji:

| Peran | Wakil | Kewenangan |
| :--- | :--- | :--- |
| **Pemilik** (*owner*) | instansi pemilik ruas | menyetujui *work order*, menerbitkan syarat, menetapkan pemegang token |
| **Pelaksana** (*user*) | kontraktor | menyetujui syarat, mencatat pekerjaan dan klaim beserta CID bukti |
| **Pengawas** | konsultan pengawas | memverifikasi pekerjaan, menyetujui klaim yang ditinjau |
| **Auditor** | pihak pemeriksa | membaca dan memverifikasi saja |
| **Operator sistem** | administrator backend | mendaftarkan segmen dan perangkat; **tidak** dapat mengubah rekaman yang sudah terjangkar |

**Perjanjian sebelum pembayaran** — penerapan contoh pembimbing (*terms of service* sebelum pembayaran digital) pada pekerjaan pemeliharaan:

```
1. PEMILIK menerbitkan SYARAT (ruang lingkup, harga satuan acuan, kriteria penerimaan, sanksi).
   Dokumen → IPFS → CID syarat v1 dicatat di smart contract.
2. PELAKSANA membaca syarat dari CID tersebut dan menyetujuinya — transaksi bertanda tangan
   mencatat penyetujuan, waktu, dan versi syarat. Penyetujuan tidak dapat dihapus.
3. Pekerjaan dilakukan. Bukti (foto, laporan, data sensor sesudah perbaikan) → IPFS → CID dicatat.
4. PENGAWAS memverifikasi, dibantu perbandingan kondisi sebelum dan sesudah pada twin.
5. Klaim dicatat. Bila klaim > batas atas estimasi × (1 + toleransi) → status DITINJAU
   (butuh persetujuan tambahan Pengawas dan Pemilik). Estimasi dan klaim sama-sama tercatat permanen.
6. Pencairan (disimulasikan) hanya dapat dicatat bila langkah 2 dan 4 terpenuhi.
7. Perubahan syarat = versi baru (CID baru) + persetujuan ulang. Versi lama tetap tercatat.
```

Siklus *work order* diperlakukan sebagai mesin status:

```
DIREKOMENDASIKAN → DISETUJUI → SYARAT DITERIMA → DIKERJAKAN → DIVERIFIKASI → DICAIRKAN* → DITUTUP
(Atria / pengguna)  (Pemilik;   (Pelaksana;       (Pelaksana;   (Pengawas)     (simulasi)
                     syarat v1)  persetujuan       CID bukti)
                                 tercatat)

Klaim di atas batas toleransi        →  DITINJAU  (butuh persetujuan tambahan Pemilik dan Pengawas)
Dari tahap mana pun sebelum DITUTUP  →  DITOLAK   (alasan dicatat)
(*) Pencairan hanya dicatat sebagai status — tidak ada transfer uang riil
```

Klaim ganda (T8) ditolak oleh kontrak: status DIKERJAKAN dan DICAIRKAN tidak dapat dicatat dua kali pada *work order* yang sama, dan hanya peran yang berwenang yang dapat mencatatnya.

### Rancangan pengujian

**Variabel kontrol** — dibuat identik di seluruh percobaan: aliran data uji (skenario sensor dan rekaman pemeliharaan dengan *seed* tetap), himpunan manipulasi (jumlah dan jenis sama), dan perangkat uji.

| Kode | Konfigurasi | Peran |
| :--- | :--- | :--- |
| **B0** | Basis data biasa, tanpa perlindungan tambahan | baseline |
| **B1** | Basis data + log audit *append-only* | baseline umum |
| **B2** | Log berantai-hash (*hash-chain*) di luar rantai + tanda tangan operator | pembanding non-blockchain terkuat |
| **B3** | **Berkas batch di IPFS + CID dijangkarkan ke smart contract** + token dan aturan perjanjian | pipeline utama |
| **B4** | Penjangkaran per rekaman — satu transaksi per rekaman | batas atas biaya |

B3 dijalankan pada beberapa ukuran dan interval batch (mis. 10 / 100 / 1.000 rekaman; 10 detik / 1 menit / 10 menit). Sebagai sub-eksperimen, penyimpanan bukti dibandingkan antara IPFS dan penyimpanan objek biasa (hash tetap dijangkarkan) pada sisi ketersediaan dan latensi. Pengukuran terkontrol memakai jaringan lokal (mis. Hardhat Network atau Anvil); satu jaringan *permissioned* (mis. Hyperledger Besu) atau testnet publik dipakai untuk validasi realisme.

> **Rancangan ini tidak dapat gagal total.** Bila B3 mendeteksi lebih banyak daripada B2, itu hasil. Bila B2 setara pada sebagian besar ancaman dengan biaya jauh lebih kecil, itu juga hasil — dan memperjelas bahwa nilai blockchain terletak pada skenario multi-pihak, bukan pada integritas semata.

### Metrik pengukuran

| Aspek | Metrik | Cara ukur |
| :--- | :--- | :--- |
| **Deteksi atau pencegahan manipulasi** | *True positive rate* per ancaman (T1–T10), *false positive rate*, waktu-ke-deteksi | Suntikkan N manipulasi per ancaman pada tiap skenario B0–B4; jalankan verifikator |
| **Efektivitas batas toleransi klaim** | Persentase klaim digelembungkan yang ditandai (mis. +10%, +30%, +100% di atas batas atas estimasi) dan persentase klaim wajar yang salah ditandai | Klaim sintetis terkontrol |
| **Konsistensi tiga arah** | Persentase batch yang CID-nya sama di basis data, IPFS, dan on-chain; jumlah ketidakkonsistenan setelah injeksi kegagalan; waktu pemulihan | Rekonsiliasi berkala; *fault injection* (matikan broker atau node, kirim ulang pesan) |
| **Latensi integritas** | Waktu peristiwa → terkonfirmasi on-chain (p50 / p95); waktu verifikasi N rekaman | *Timestamp* di ingest, penambahan ke IPFS, pengiriman transaksi, dan *receipt* |
| IPFS | Latensi menambah dan mengambil berkas (p50 / p95); ketersediaan setelah *pin* dicabut atau node dimatikan | Uji pada node sendiri |
| Throughput | Rekaman per detik yang diproses ingest + penjangkaran tanpa antrean tumbuh | Beban bertahap (pembangkit beban MQTT, `k6`) |
| **Biaya** | Gas per batch dan per transisi status; ukuran data on-chain (byte) | Laporan gas (Hardhat atau Foundry) dan *receipt* |
| **Respons sistem** | Waktu respons API (p95) untuk query state dan verifikasi saat beban | `k6` atau Locust |
| Kualitas kontrak | Cakupan uji (*statement* dan *branch*), temuan analisis statis per tingkat keparahan, uji properti atau *fuzz* | Alat uji dan analisis statis |
| Ketahanan | Pesan hilang atau duplikat setelah kegagalan; idempotensi | Log dan nomor urut (`seq`) |

> Baris **deteksi manipulasi dibandingkan baseline** wajib ada. Tanpa itu, penelitian rentan dinilai "menerapkan blockchain" dan turun derajat menjadi sekadar implementasi. Biaya dilaporkan dalam **satuan gas**, bukan rupiah, karena jaringan yang dipakai adalah jaringan uji.

### Arsitektur backend (usulan awal)

```
Sensor / simulator ──MQTT+TLS──► Broker ──► Layanan ingest ──► PostgreSQL/PostGIS + deret waktu
                                              │ validasi skema · tanda tangan · nomor urut
                                              │ pemetaan ke segmen · normalisasi kanonik
                                              ├──► Event bus ──► Dashboard Laravel (Alvito) · Agen (Atria)
                                              └──► Outbox ──► Worker penjangkaran ──► IPFS ──► Smart contract
                                                                     ▲                            │
                                                                     └──── Indexer ◄── event on-chain
```

| Komponen | Fungsi | Kandidat |
| :--- | :--- | :--- |
| Gateway IoT | menerima telemetri, mengautentikasi perangkat | broker MQTT (mis. Mosquitto) + TLS |
| Layanan ingest | validasi skema dan tanda tangan, pemetaan ke segmen, normalisasi kanonik | proses terpisah dari proses web Laravel (§4) |
| Penyimpanan | geometri dan state; deret waktu | PostgreSQL + PostGIS, TimescaleDB |
| Penyimpanan bukti | berkas batch, foto, dokumen syarat | node IPFS sendiri (mis. Kubo) + *pin*; layanan *pinning* dan jaringan IPFS privat sebagai opsi |
| Event bus | menyebarkan perubahan state ke dashboard, agen, dan worker penjangkaran | komponen paling sederhana yang memenuhi kebutuhan (mis. MQTT atau Redis Streams) |
| Worker penjangkaran | batch → berkas → IPFS → CID → transaksi → konfirmasi | ethers.js atau web3.py |
| *Indexer* | mendengarkan event kontrak, memperbarui token state di basis data | pendengar kustom |
| API | query state dan verifikasi; kontrak OpenAPI | — |
| Autentikasi dan peran | membedakan Pemilik, Pelaksana, Pengawas, Auditor, Operator | JWT atau sesi Laravel + RBAC |

Pola yang dipakai agar data tetap konsisten ketika sebagian komponen gagal:

- ***Transactional outbox*** — perubahan state dan "tugas penjangkaran" ditulis dalam satu transaksi basis data; worker memprosesnya kemudian, sehingga tidak ada rekaman yang terlewat dijangkarkan.
- **Kunci idempotensi** (`sensor_id` + `seq`) agar pesan duplikat tidak tercatat dua kali.
- **Rekonsiliasi berkala** tiga arah: basis data ↔ IPFS ↔ on-chain.
- ***Retry* dengan *backoff*** untuk transaksi atau penambahan IPFS yang gagal.
- **Status `provisional` → `confirmed`** sehingga dashboard dapat menampilkan data lebih dulu dan lencana integritas menyusul (lihat pembagian batas dengan Alvito pada §1).

Pemetaan titik koordinat ke segmen (*linear referencing*, mis. `ST_LineLocatePoint` pada PostGIS) disediakan backend sebagai fungsi bersama untuk Alvito dan Atria; akurasinya diuji sebagai bagian dari akurasi visualisasi (Alvito).

### Perangkat & data uji

**Backend:** broker MQTT, PostgreSQL + PostGIS (+ TimescaleDB untuk deret waktu), layanan ingest, worker penjangkaran, dan *indexer*; integrasi dengan aplikasi Laravel disepakati pada §4.

**IPFS:** node sendiri (mis. Kubo) dengan *pin*; jaringan IPFS privat dan layanan *pinning* sebagai opsi. Isi: berkas batch telemetri (mis. per segmen per jam), berkas bukti (foto atau laporan sintetis), dan dokumen syarat.

**Blockchain:** Solidity (satu versi seri 0.8.x dikunci), Hardhat atau Foundry, pustaka kontrak OpenZeppelin; jaringan lokal untuk pengukuran terkontrol + satu jaringan *permissioned* atau testnet publik untuk validasi. Bila pembimbing menunjuk jaringan rujukan tertentu, jaringan itu dipertimbangkan (§6).

**Data:** aliran dari simulator Alvito dan data sekunder + rekaman siklus pemeliharaan sintetis (*work order* dari DIREKOMENDASIKAN sampai DITUTUP) + klaim sintetis + himpunan manipulasi T1–T10. Seluruhnya **diberi label sintetis atau sekunder**; data primer opsional menunggu konfirmasi perangkat keras (§6).

> Kunci versi seluruh alat dan tanggal pengambilannya di Bab 3 agar hasil dapat direplikasi. Status testnet publik dan versi alat berubah-ubah — verifikasi saat penelitian dimulai.

### Batasan

- Jaringan uji (lokal, *permissioned*, atau testnet), bukan mainnet; biaya dalam satuan gas, bukan rupiah.
- Token **tidak dapat dipindahtangankan** dan tidak bernilai moneter; pencairan hanya disimulasikan sebagai status. Aspek regulasi aset kripto, tokenisasi sebagai instrumen keuangan, dan integrasi dengan sistem pembayaran nyata di luar cakupan.
- Blockchain dan IPFS menjamin data **tidak berubah setelah dicatat**, bukan kebenaran sumber. Penyamaran perangkat hanya dicakup sebagian (tanda tangan per node dengan kunci uji). Kewajaran harga dinilai estimasi Atria dan manusia, bukan oleh kontrak.
- Ketersediaan data di IPFS bergantung pada *pinning*; tidak ada jaminan persistensi jangka panjang di luar node yang dikelola tim.
- Satu ruas acuan dengan data simulasi dan sekunder; tidak mencakup skala produksi (ketersediaan tinggi, multi-wilayah).
- Tidak mengembangkan algoritma konsensus; memakai yang tersedia.
- Backend dibangun dari komponen siap pakai; kontribusi akademik terletak pada lapisan integritas, bukan pada rekayasa backend umum.

### Risiko & mitigasi

| Risiko | Mitigasi |
| :--- | :--- |
| **Cakupan melebar** — blockchain, IPFS, perjanjian, dan backend sekaligus | Prioritaskan kontrak inti, penjangkaran CID, dan backend minimal lebih dulu; perjanjian dan batas toleransi menyusul; fitur tambahan (*indexer* lengkap, peran berlapis) belakangan. B0–B3 sudah cukup sebagai hasil bila B4 tersendat |
| **Backend menjadi hambatan** — Alvito dan Atria menunggu | Rilis kontrak API (OpenAPI) dan *mock* pada minggu 1–2; versi API bertahap; batasi fitur backend pada kebutuhan KPI |
| Penguji bertanya *"mengapa tidak pakai basis data saja?"* | Baseline B1–B2 adalah jawaban empirisnya; jelaskan model kepercayaan multi-pihak |
| Data hilang karena tidak ada yang men-*pin* di IPFS | Node sendiri dengan *pin*, cadangan pada penyimpanan objek; ketersediaan diukur sebagai metrik |
| Data sensitif terekspos karena IPFS publik secara bawaan | Jangan menaruh data pribadi; enkripsi sebelum ditambahkan; pertimbangkan jaringan IPFS privat |
| Biaya dan latensi jaringan publik tidak stabil | Ukur pada jaringan lokal terkontrol; testnet hanya untuk validasi; laporkan variasinya |
| Bug pada smart contract (kontrak tidak dapat diubah setelah *deploy*) | Uji menyeluruh, analisis statis, uji properti atau *fuzz*; jaga kontrak tetap sederhana; bahas pola kontrak yang dapat ditingkatkan (*proxy*) sebagai *trade-off* |
| Versi alat atau testnet berubah atau dihentikan | Kunci versi dan tanggal; hindari ketergantungan pada satu testnet publik |
| Kegagalan merusak konsistensi data | *Outbox*, idempotensi, rekonsiliasi; *fault injection* menjadi bagian hasil |
| Data nyata tidak tersedia | Simulasi terkalibrasi dan data sekunder, **diberi label** |

### Privasi & keamanan

- **Tidak ada data pribadi on-chain maupun di IPFS publik.** Data di rantai tidak dapat dihapus, sehingga bertentangan dengan hak penghapusan data pribadi pada UU PDP No. 27/2022 — *perlu dikaji pada Bab 2*. Identitas pelaksana dipseudonimkan (alamat akun); foto bukti diburamkan dan hanya CID-nya yang dicatat.
- **Kunci privat** hanya kunci uji; tidak pernah disimpan di repositori.
- **Token bukan instrumen investasi** — tidak dapat dipindahtangankan, tidak bernilai moneter, hanya di jaringan uji.
- **Akses berbasis peran dan TLS** — data infrastruktur jalan diperlakukan sebagai data sensitif.

### Kajian pustaka (Bab 2)

| Matriks | Kandidat | Kriteria |
| :--- | :--- | :--- |
| Platform blockchain | jaringan kompatibel-EVM (Hardhat/Anvil, Hyperledger Besu, testnet publik), Hyperledger Fabric; jaringan rujukan dari pembimbing bila ada | model kepercayaan (publik atau *permissioned*), bahasa kontrak, biaya, latensi, kemudahan setup |
| Standar token | ERC-721, ERC-1155, token *non-transferable* | kesesuaian dengan aset unik, biaya gas, dukungan operasi batch |
| Skema penjangkaran | CID per batch (IPFS), root Merkle per batch, log berantai-hash | biaya, ukuran bukti, waktu-ke-deteksi |
| Penyimpanan bukti | IPFS (node sendiri, layanan *pinning*), penyimpanan objek S3-kompatibel | keaslian, ketersediaan, privasi, biaya |
| Benchmark | platform rujukan (kriptoaman.com) | cara menyajikan data terverifikasi, bukti (*evidence*), dan pemantauan on-chain — lihat §6 |

> Daftar kandidat perlu diperbarui saat penelitian dimulai, karena alat dan jaringan uji berubah cepat.

### Pembagian batas dengan Atria

Keduanya menyentuh *keluaran AI*, *estimasi*, dan *data yang dipercaya*, sehingga batasnya perlu ditegaskan:

| | **Atria** | **Panji** |
| :--- | :--- | :--- |
| Pertanyaan | Apakah rekomendasi dan estimasinya tepat? | Apakah rekomendasi, estimasi, dan klaim terjamin tidak berubah dan dapat ditelusuri? |
| Yang divariasikan | Lapisan risiko, prediksi, dan agen | Strategi tokenisasi/penjangkaran dan arsitektur penyimpanan |
| Keluaran AI diperlakukan sebagai | **Objek penelitian** | **Rekaman** yang dijaga integritasnya — tanpa menilai benar atau salahnya |
| Estimasi biaya wajar | Diukur akurasinya (MAPE, cakupan rentang) | Dicatat permanen dan dijadikan batas toleransi klaim oleh kontrak |
| Data yang ditandai *tidak cocok* | Diuji: apakah agen memperlakukannya dengan tepat | Dideteksi dan ditandai |

> Panji mendeteksi **bahwa** data berubah; Atria menguji **apa yang dilakukan agen** ketika diberi tahu. Keduanya bertemu pada kondisi uji K4 (data tak terverifikasi) di tugas akhir Atria dan pada skenario E3 di uji integrasi bersama (§4).

---