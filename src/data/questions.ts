export interface Question {
  id: number;
  topic: 'Artikel Jahitan' | 'Teknologi Pertanian' | 'Reka Bentuk Pengaturcaraan';
  tpLevel: 'TP4' | 'TP5' | 'TP6';
  scenario?: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const RBT_QUESTIONS: Question[] = [
  // UNIT 3: ARTIKEL JAHITAN (TP4 - TP6)
  {
    id: 1,
    topic: 'Artikel Jahitan',
    tpLevel: 'TP4',
    scenario: 'Haziq mendapati bahagian kelim pada beg pensel kain denim buatannya mudah terurai dan tercabut apabila diisi alat tulis yang berat.',
    question: 'Berdasarkan analisis kekuatan jahitan tangan, mata jahitan manakah yang paling kukuh dan tepat digunakan untuk menggantikan atau menyamai jahitan mesin bagi mencantumkan kelim tersebut?',
    options: [
      'Jahitan Kia',
      'Jahitan Jelujur Kasar',
      'Jahitan Insang Pari',
      'Jahitan Lilit Kemas',
    ],
    correctAnswer: 'Jahitan Kia',
    explanation: 'Jahitan Kia merupakan mata jahitan tangan paling kukuh yang digunakan untuk mencantum kepingan fabrik serta memulakan dan mematikan jahitan, menyerupai jahitan mesin.',
  },
  {
    id: 2,
    topic: 'Artikel Jahitan',
    tpLevel: 'TP4',
    scenario: 'Semasa memindahkan pola garisan bentuk poket daripada kertas pola ke atas kepingan fabrik felt, garisan tandaan tidak kelihatan jelas.',
    question: 'Apakah kombinasi dua alatan menjahit yang paling tepat digunakan untuk memindahkan garisan pola tersebut secara kemas tanpa merosakkan fabrik?',
    options: [
      'Roda surih dan kertas karbon tukang jahit',
      'Pita pengukur dan gunting fabrik',
      'Kapur tukang jahit dan jarum peniti',
      'Peretas jahitan dan jarum jahit tangan',
    ],
    correctAnswer: 'Roda surih dan kertas karbon tukang jahit',
    explanation: 'Roda surih digunakan bersama-sama kertas karbon tukang jahit untuk memindahkan tanda pola dan garisan pemadan ke atas fabrik.',
  },
  {
    id: 3,
    topic: 'Artikel Jahitan',
    tpLevel: 'TP5',
    scenario: 'Aina ingin mereka bentuk pemegang cawan panas (cup sleeve) daripada fabrik. Dia perlu memilih hiasan dan kemasan tepi agar fabrik tidak berbulu di samping kelihatan menarik dan mudah dibuka tutup.',
    question: 'Nilai dan pilih gabungan mata jahitan kemasan tepi dan jenis pengancing yang paling ergonomik dan berfungsi bagi artikel tersebut:',
    options: [
      'Jahitan Insang Pari pada tepi fabrik dan pengancing pita pelekat (Velcro)',
      'Jahitan Jelujur Kasar pada tepi fabrik dan pengancing butang katup',
      'Jahitan Silang Pangkah pada tepi fabrik dan zip besi',
      'Jahitan Kia pada tepi fabrik dan cangkuk palang',
    ],
    correctAnswer: 'Jahitan Insang Pari pada tepi fabrik dan pengancing pita pelekat (Velcro)',
    explanation: 'Jahitan insang pari berfungsi mengemas bahagian tepi fabrik yang mudah berbulu serta sebagai hiasan, manakala Velcro fleksibel untuk melaras saiz lilitan cawan panas.',
  },
  {
    id: 4,
    topic: 'Artikel Jahitan',
    tpLevel: 'TP5',
    scenario: 'Dalam ujian kualiti artikel jahitan beg uncang, didapati tali penarik sukar ditarik dan jahitan kelim bahagian mulut beg koyak apabila ditarik dengan kuat.',
    question: 'Apakah penilaian langkah pembaikan terbaik yang perlu dilakukan murid untuk mengatasi ralat reka bentuk tersebut?',
    options: [
      'Membuka kelim menggunakan peretas jahitan, menambah kelebaran basi lipatan lorong tali, dan menjahit semula dengan Jahitan Kia yang kukuh',
      'Menggunakan gam fabrik untuk melekatkan terus tali penarik pada fabrik',
      'Menukar kain kepada kertas tebal dan mengepin menggunakan jarum peniti',
      'Mengetatkan jahitan dengan jahitan jelujur kasar tanpa ruang saluran',
    ],
    correctAnswer: 'Membuka kelim menggunakan peretas jahitan, menambah kelebaran basi lipatan lorong tali, dan menjahit semula dengan Jahitan Kia yang kukuh',
    explanation: 'Peretas jahitan digunakan untuk meretas mata jahitan yang silap, basi lorong tali perlu dilebarkan agar tali bergerak lancar, dan jahitan kia memberikan ketahanan tegangan.',
  },
  {
    id: 5,
    topic: 'Artikel Jahitan',
    tpLevel: 'TP6',
    scenario: 'Murid diminta menghasilkan artikel jahitan inovatif serbaguna mesra alam menggunakan perca kain terpakai untuk kegunaan murid sekolah rendah.',
    question: 'Langkah manakah yang menepati prosedur reka bentuk artikel jahitan bermula dari idea sehingga penilaian akhir secara sistematik?',
    options: [
      'Menjana idea kreatif -> Menghasilkan lakaran bermaklumat -> Memilih bahan & alatan -> Mengukur, menanda & menggunting -> Menjahit artikel -> Membuat kemasan & penilaian produk',
      'Menggunting fabrik -> Menjahit terus tanpa pola -> Membuat lakaran -> Membeli alatan baru -> Menjual produk',
      'Menjahit fabrik -> Melukis pola di atas baju -> Menghias dengan manik -> Mengukur kain yang siap',
      'Memilih alatan -> Menilai produk akhir -> Melukis lakaran idea -> Menjahit fabrik',
    ],
    correctAnswer: 'Menjana idea kreatif -> Menghasilkan lakaran bermaklumat -> Memilih bahan & alatan -> Mengukur, menanda & menggunting -> Menjahit artikel -> Membuat kemasan & penilaian produk',
    explanation: 'Aliran kerja penghasilan artikel jahitan KSSR bermula daripada penjanaan idea dan lakaran bersaiz/bermaklumat, persediaan bahan, penandaan & pemotongan, proses cantuman jahitan, hingga kemasan dan pengujian kualiti.',
  },

  // UNIT 4: TEKNOLOGI PERTANIAN (PERTANIAN BANDAR & TAKUNGAN AIR) (TP4 - TP6)
  {
    id: 6,
    topic: 'Teknologi Pertanian',
    tpLevel: 'TP4',
    scenario: 'Cikgu Kamal menunjukkan sistem penanaman hidroponik takung di mana akar tanaman menyerap larutan nutrien secara kapilari melalui medium penanaman tanpa memerlukan pam elektrik.',
    question: 'Apakah fungsi utama penggunaan leca (bebola tanah liat bakar) atau span berbanding tanah biasa dalam takung hidroponik tersebut?',
    options: [
      'Memegang akar tanaman dan mengekalkan kelembapan serta pengudaraan tanpa mengotorkan air takung',
      'Membekalkan nutrien mineral N, P, K secara semula jadi tanpa baja kimia',
      'Menghalang cahaya matahari daripada menembusi daun tanaman',
      'Memanaskan air takungan supaya akar cepat membesar',
    ],
    correctAnswer: 'Memegang akar tanaman dan mengekalkan kelembapan serta pengudaraan tanpa mengotorkan air takung',
    explanation: 'Leca dan span berfungsi sebagai medium sokongan untuk menegakkan pokok, memegang akar, serta menyediakan rongga udara yang baik untuk respirasi akar dalam sistem takungan.',
  },
  {
    id: 7,
    topic: 'Teknologi Pertanian',
    tpLevel: 'TP4',
    scenario: 'Selepas dua minggu menyemai biji benih sayuran kailan dalam dulang semaian, didapati beberapa anak benih tumbuh terlalu rapat dan batangnya kurus melentur.',
    question: 'Wajarkan tindakan agronomi TP4 yang mesti diambil oleh murid sebelum memindahkan anak benih ke dalam takung hidroponik:',
    options: [
      'Melakukan proses penjarangan dengan mencabut anak benih yang lemah agar anak benih sihat mendapat ruang dan nutrien optimum',
      'Menambah baja pekat berganda ke dalam dulang semaian tanpa menjarangkannya',
      'Memotong semua daun anak benih sehingga tinggal batang sahaja',
      'Membiarkan anak benih bersaing sehingga hanya satu yang hidup sendiri',
    ],
    correctAnswer: 'Melakukan proses penjarangan dengan mencabut anak benih yang lemah agar anak benih sihat mendapat ruang dan nutrien optimum',
    explanation: 'Penjarangan dilakukan untuk mengurangkan persaingan ruang, cahaya, dan nutrien serta memilih anak benih yang paling tegap untuk dipindahkan.',
  },
  {
    id: 8,
    topic: 'Teknologi Pertanian',
    tpLevel: 'TP5',
    scenario: 'Murid menyukat kepekatan larutan nutrien dalam takung hidroponik tanaman salad. Pada minggu ketiga, bacaan meter EC menunjukkan kepekatan larutan nutrien terlalu tinggi sehingga hujung daun tanaman kelihatan terbakar (nutrient burn).',
    question: 'Berdasarkan penilaian situasi di atas, apakah langkah pembetulan yang paling tepat dan selamat dilakukan?',
    options: [
      'Menambah air bersih tanpa klorin ke dalam takung untuk mencairkan kepekatan larutan sehingga mencapai julat EC yang disyorkan',
      'Menambah stok pekat Larutan A dan Larutan B secara serentak ke dalam takung',
      'Membiarkan air kering supaya garam nutrien mengendap di dasar takung',
      'Memindahkan takung ke tempat gelap gelita selama 3 hari',
    ],
    correctAnswer: 'Menambah air bersih tanpa klorin ke dalam takung untuk mencairkan kepekatan larutan sehingga mencapai julat EC yang disyorkan',
    explanation: 'Apabila kepekatan larutan nutrien terlalu tinggi (EC melebihi had), air bersih perlu ditambah untuk menurunkan kepekatan ion garam terlarut agar akar tidak rosak.',
  },
  {
    id: 9,
    topic: 'Teknologi Pertanian',
    tpLevel: 'TP5',
    scenario: 'Sebuah sekolah di kawasan bandar mempunyai ruang koridor yang terhad dan dinding konkrit yang luas serta terdedah kepada cahaya matahari pagi.',
    question: 'Nilaikan reka bentuk sistem pertanian bandar yang paling menjimatkan ruang lantai dan menggunakan takungan bertingkat yang sesuai:',
    options: [
      'Sistem penanaman menegak (vertical farming) menggunakan botol kitar semula atau paip PVC bertakung yang digantung pada dinding',
      'Membina kolam tanah berlumpur seluas padang sekolah',
      'Menanam pokok durian di dalam pasu bunga kecil di atas meja guru',
      'Menggali parit konkrit sedalam 2 meter di sepanjang koridor sekolah',
    ],
    correctAnswer: 'Sistem penanaman menegak (vertical farming) menggunakan botol kitar semula atau paip PVC bertakung yang digantung pada dinding',
    explanation: 'Sistem pertanian menegak (vertical garden) merupakan konsep pertanian bandar ideal untuk memaksimumkan ruang dinding yang sempit dan memanfaatkan bahan kitar semula.',
  },
  {
    id: 10,
    topic: 'Teknologi Pertanian',
    tpLevel: 'TP6',
    scenario: 'Tanaman bayam dalam sistem takung hidroponik diserang kutu daun (afid) dan ulat perosak. Murid dilarang menggunakan racun kimia sintetik berbahaya kerana sayur akan dimakan di kantin sekolah.',
    question: 'Reka bentuk penyelesaian kawalan biologi atau racun organik mesra alam yang boleh dihasilkan sendiri oleh murid:',
    options: [
      'Menyembur cecair semburan organik ekstrak cili dan bawang putih yang dicampur sedikit cecair sabun pencuci pinggan sebagai pelekat',
      'Menyiram petrol dan menyalakan api kecil di sekeliling takungan',
      'Menabur garam kasar pekat terus ke atas semua daun bayam',
      'Menutup keseluruhan tanaman dengan plastik hitam kedap udara selama seminggu',
    ],
    correctAnswer: 'Menyembur cecair semburan organik ekstrak cili dan bawang putih yang dicampur sedikit cecair sabun pencuci pinggan sebagai pelekat',
    explanation: 'Semburan ekstrak bawang putih dan cili berkesan menghalau serangga perosak secara mesra alam, manakala sabun bertindak sebagai pelekat organik pada permukaan daun.',
  },

  // UNIT 5: REKA BENTUK PENGATURCARAAN (TP4 - TP6)
  {
    id: 11,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP4',
    scenario: 'Dalam satu projek pengaturcaraan pintu pagar keselamatan automatik menggunakan papan mikropengawal (micro:bit):',
    question: 'Komponen perkakasan manakah yang bertindak sebagai PERANTI INPUT dan PERANTI OUTPUT dalam sistem tersebut?',
    options: [
      'Input: Penderia inframerah / butang tekan | Output: Motor servo / paparan LED',
      'Input: Motor servo / buzzer | Output: Penderia cahaya / bateri',
      'Input: Kabel USB / roda | Output: Penderia suhu / resistor',
      'Input: Pembaz (buzzer) | Output: Penderia sentuh',
    ],
    correctAnswer: 'Input: Penderia inframerah / butang tekan | Output: Motor servo / paparan LED',
    explanation: 'Penderia (sensor) dan butang menerima isyarat persekitaran (Input), manakala motor servo menggerakkan pagar dan LED memaparkan status (Output).',
  },
  {
    id: 12,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP4',
    scenario: 'Perhatikan pseudokod berikut:\n1. MULA\n2. BACA nilai penderia cahaya\n3. JIKA nilai penderia cahaya < 30 MAKA\n4.    Hidupkan lampu LED\n5. JIKA TIDAK\n6.    Matikan lampu LED\n7. TAMAT JIKA\n8. TAMAT',
    question: 'Apakah struktur kawalan yang digunakan dalam algoritma lampu jalan pintar di atas?',
    options: [
      'Struktur kawalan dwipilihan (if...else)',
      'Struktur kawalan jujukan (sequence)',
      'Struktur kawalan pilihan tunggal (single if)',
      'Struktur kawalan ulangan tanpa henti (infinite loop)',
    ],
    correctAnswer: 'Struktur kawalan dwipilihan (if...else)',
    explanation: 'Algoritma di atas mempunyai dua cabang tindakan bergantung kepada syarat benar atau palsu (JIKA... MAKA... JIKA TIDAK...), iaitu struktur kawalan dwipilihan.',
  },
  {
    id: 13,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP4',
    scenario: 'Semasa melukis carta alir pengaturcaraan, murid ingin meletakkan langkah "Kira jumlah markah = markah kuiz + markah game".',
    question: 'Simbol piawai carta alir manakah yang wajib digunakan untuk mewakili langkah pengiraan tersebut?',
    options: [
      'Segi empat tepat (Proses / Tindakan)',
      'Rombus / Berlian (Syarat / Pilihan)',
      'Bujur / Segi empat bucu bulat (Terminal Mula / Tamat)',
      'Paralelogram / Segi empat selari (Input / Output)',
    ],
    correctAnswer: 'Segi empat tepat (Proses / Tindakan)',
    explanation: 'Simbol segi empat tepat digunakan bagi operasi pemprosesan, manipulasi data atau pengiraan matematik dalam carta alir.',
  },
  {
    id: 14,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP5',
    scenario: 'Murid memuat turun atur cara penggera suhu ke dalam mikropengawal. Situasi sebenar: Suhu bilik ialah 38°C (panas), namun pembaz (buzzer) tidak berbunyi. Selepas disemak, kod blok menunjukkan:\n`if (suhu < 30) { play tone High }`',
    question: 'Nilai dan kenal pasti ralat logik pada blok kod tersebut serta cara membetulkannya:',
    options: [
      'Tanda operator salah; gantikan tanda (<) kepada (>) iaitu `if (suhu > 30)` supaya amaran berbunyi apabila suhu panas melebihi had',
      'Tukar perkakasan micro:bit dengan bateri kereta',
      'Padamkan blok bunyi dan gantikan dengan blok muzik tidur',
      'Gantikan penderia suhu dengan pembesar suara komputer',
    ],
    correctAnswer: 'Tanda operator salah; gantikan tanda (<) kepada (>) iaitu `if (suhu > 30)` supaya amaran berbunyi apabila suhu panas melebihi had',
    explanation: 'Ralat logik berlaku kerana menggunakan operator lebih kecil (< 30) dan bukannya lebih besar (> 30) untuk mengesan keadaan suhu tinggi.',
  },
  {
    id: 15,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP5',
    scenario: 'Faizal ingin membina sistem amaran pencuri di pintu rumah yang akan terus membunyikan siren berulang kali selagi pintu belum ditutup kembali.',
    question: 'Struktur kawalan manakah yang paling cekap diprogramkan ke dalam mikropengawal untuk situasi tersebut?',
    options: [
      'Struktur kawalan ulangan (Loop / While penderia magnet terbuka)',
      'Struktur kawalan pilihan tunggal sekali jalan tanpa ulangan',
      'Struktur jujukan satu baris yang tamat serta-merta',
      'Mematikan bekalan kuasa mikropengawal serta-merta',
    ],
    correctAnswer: 'Struktur kawalan ulangan (Loop / While penderia magnet terbuka)',
    explanation: 'Struktur kawalan ulangan (loop) membolehkan arahan membunyikan siren diulang secara berterusan sehingga syarat (pintu ditutup) dipenuhi.',
  },
  {
    id: 16,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP6',
    scenario: 'Anda diminta mencipta inovasi "Alat Penyiram Tanaman Pintar Automatik" bagi membantu tukang kebun sekolah semasa cuti penggal.',
    question: 'Susunkan algoritma logik yang lengkap dan selamat untuk memastikan pam air berfungsi mengikut keperluan tanah:',
    options: [
      'Mula -> Baca kelembapan tanah -> Jika kelembapan < paras minimum -> Hidupkan pam air selama 5 saat -> Hentikan pam -> Ulang semakan -> Tamat',
      'Mula -> Hidupkan pam air 24 jam tanpa henti -> Banjirkan tanaman -> Tamat',
      'Mula -> Matikan bekalan kuasa -> Baca suhu bilik -> Buang air dari tangki -> Tamat',
      'Mula -> Baca suis lampu -> Pasang siren kecemasan -> Matikan pam -> Tamat',
    ],
    correctAnswer: 'Mula -> Baca kelembapan tanah -> Jika kelembapan < paras minimum -> Hidupkan pam air selama 5 saat -> Hentikan pam -> Ulang semakan -> Tamat',
    explanation: 'Algoritma yang teratur membaca data persekitaran melalui penderia kelembapan, membuat keputusan berasaskan syarat, dan mengawal pam air secara berhemah tanpa pembaziran air.',
  },
  {
    id: 17,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP5',
    scenario: 'Murid menyambung motor servo ke pin 0 pada papan mikropengawal, tetapi bilah servo bergetar dan tidak berputar ke sudut 90 darjah seperti yang diarahkan dalam kod.',
    question: 'Apakah punca masalah teknikal dan sambungan litar yang paling kerap menyebabkan kegagalan fungsi motor servo ini?',
    options: [
      'Kekurangan voltan/arus bekalan kuasa bateri atau wayar bumi (GND/hitam) tidak disambungkan dengan sempurna ke pin negatif bersama',
      'Kerana bilah kipas diperbuat daripada plastik dan bukan besi waja',
      'Kerana kod atur cara ditulis dalam bahasa Melayu dan bukan bahasa Inggeris',
      'Kerana mikropengawal perlu dijemur di bawah panas matahari terlebih dahulu',
    ],
    correctAnswer: 'Kekurangan voltan/arus bekalan kuasa bateri atau wayar bumi (GND/hitam) tidak disambungkan dengan sempurna ke pin negatif bersama',
    explanation: 'Motor servo memerlukan arus elektrik yang mencukupi serta sambungan wayar isyarat, VCC (positif), dan Ground (GND) yang betul; litar bumi yang longgar menyebabkan isyarat PWM tidak stabil.',
  },
  {
    id: 18,
    topic: 'Teknologi Pertanian',
    tpLevel: 'TP6',
    scenario: 'Dalam inovasi sistem akuaponik kitaran tertutup yang menggabungkan ternakan ikan keli dan tanaman kailan:',
    question: 'Wajarkan bagaimana sisa kumuhan ikan dapat dimanfaatkan oleh tumbuhan sayuran dan bagaimana air dibersihkan semula untuk ikan:',
    options: [
      'Bakteria berfaedah menukar ammonia najis ikan kepada nitrat (baja tumbuhan), akar sayur menyerap nitrat dan menapis air kembali bersih untuk ikan',
      'Najis ikan terus menjadi racun dan membunuh semua rumpai air',
      'Air kotor dibuang keluar setiap 5 minit dan diganti dengan air suling',
      'Tumbuhan memakan ikan kecil manakala ikan memakan akar tumbuhan sampai habis',
    ],
    correctAnswer: 'Bakteria berfaedah menukar ammonia najis ikan kepada nitrat (baja tumbuhan), akar sayur menyerap nitrat dan menapis air kembali bersih untuk ikan',
    explanation: 'Sistem akuaponik menggunakan prinsip simbiotik: bakteria nitrifikasi menguraikan ammonia toksik daripada kumuhan ikan kepada nitrat yang menjadi sumber nutrien utama tumbuhan.',
  },
  {
    id: 19,
    topic: 'Artikel Jahitan',
    tpLevel: 'TP6',
    scenario: 'Sekumpulan murid mereka bentuk bekas penyimpan alatan serbaguna dengan poket berzip, ruang butang, dan pemegang gantung. Mereka perlu memilih fabrik yang tahan lasak dan tidak mudah koyak.',
    question: 'Berdasarkan ciri-ciri fizikal fabrik, bahan manakah yang paling sesuai dipilih untuk badan utama bekas tersebut?',
    options: [
      'Fabrik kanvas atau denim kerana seratnya tebal, kukuh, dan berdaya tahan tinggi menampung beban alatan',
      'Fabrik sutera lembut kerana berkilat dan licin dipegang',
      'Fabrik sifon nipis kerana ringan dan tembus cahaya',
      'Tisu kertas berlapis kerana murah dan senang dibentuk',
    ],
    correctAnswer: 'Fabrik kanvas atau denim kerana seratnya tebal, kukuh, dan berdaya tahan tinggi menampung beban alatan',
    explanation: 'Kain kanvas dan denim mempunyai tenunan yang kuat dan tahan geseran, menjadikannya pilihan fabrik terbaik bagi produk yang perlu memegang beban alatan berat.',
  },
  {
    id: 20,
    topic: 'Reka Bentuk Pengaturcaraan',
    tpLevel: 'TP6',
    scenario: 'Sebelum sesuatu produk mikropengawal dipasarkan kepada pengguna, apakah proses penting yang wajib dilakukan oleh jurutera pengaturcaraan mengikut disiplin RBT?',
    question: 'Pilih urutan pengujian dan pendokumentasian akhir yang paling tepat:',
    options: [
      'Menjalankan ujian simulasi kod -> Memuat turun ke perkakasan -> Menguji fungsi dalam persekitaran sebenar -> Mengesan & membaiki ralat (debugging) -> Mendokumentasikan laporan reka bentuk',
      'Menjual terus kepada murid tanpa menguji perkakasan',
      'Memadam kod atur cara asal dan mencuba nasib jika produk berfungsi',
      'Menggantikan bateri dengan suis manual tanpa sebarang pengaturcaraan',
    ],
    correctAnswer: 'Menjalankan ujian simulasi kod -> Memuat turun ke perkakasan -> Menguji fungsi dalam persekitaran sebenar -> Mengesan & membaiki ralat (debugging) -> Mendokumentasikan laporan reka bentuk',
    explanation: 'Pengujian sistematik (simulasi, ujian perkakasan, penyahpepijatan ralat, dan laporan) merupakan amalan standard dalam Standard Kandungan Pengaturcaraan KSSR RBT Tahun 5.',
  },
];

/**
 * Fisher-Yates shuffle array algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates the 20 questions with strictly randomized option choices (A, B, C, D)
 * so that the correct answer is uniformly distributed and never static!
 */
export function getPreparedQuestions(): Question[] {
  return RBT_QUESTIONS.map((q) => {
    const randomizedOptions = shuffleArray(q.options);
    return {
      ...q,
      options: randomizedOptions,
    };
  });
}
