// Database Lengkap: 151 Pegawai Kecamatan Sukolilo & 7 Kelurahan
const dataPegawai = [
  { nama: "MUHAMMAD ARIES HILMI S.STP, M.KP", unit: "Kecamatan Sukolilo", telp: "+62817373093" },
  { nama: "YAYUK HESTININGRUM S.Sos", unit: "Kecamatan Sukolilo", telp: "+6282141141938" },
  { nama: "NOVIYANTI DWI HANDAYANI A.Md", unit: "Kecamatan Sukolilo", telp: "+6281230287582" },
  { nama: "Dra. Ec. GUSTI AYU NURAINI SUDIBYA MM", unit: "Kecamatan Sukolilo", telp: "+6281331344332" },
  { nama: "SUPRIONO S.Sos, MM", unit: "Kecamatan Sukolilo", telp: "+6282244146629" },
  { nama: "ATIK DWI RETNOWATI S.Sos", unit: "Kecamatan Sukolilo", telp: "+6287784572810" },
  { nama: "EKA YUNITA NURRINA", unit: "Kecamatan Sukolilo", telp: "+6287855853782" },
  { nama: "M. ISMAIL", unit: "Kecamatan Sukolilo", telp: "+6281330660422" },
  { nama: "RUSLAN", unit: "Kecamatan Sukolilo", telp: "+6285855061262" },
  { nama: "SUBANDI", unit: "Kecamatan Sukolilo", telp: "+6285852904466" },
  { nama: "SUYANI S.M.", unit: "Kecamatan Sukolilo", telp: "+6281235293327" },
  { nama: "TJIRA DESI SUSANTI", unit: "Kecamatan Sukolilo", telp: "+6281330572137" },
  { nama: "YULIANA S.Kom.", unit: "Kecamatan Sukolilo", telp: "+628135815325" },
  { nama: "ANDY FIRMANSYAH S.E.", unit: "Kecamatan Sukolilo", telp: "+6281226663839" },
  { nama: "BAYU SURYAWAN", unit: "Kecamatan Sukolilo", telp: "+6282140467770" },
  { nama: "DIMAS ARIF FITRIANSYAH", unit: "Kecamatan Sukolilo", telp: "+6282337022332" },
  { nama: "EKO BUDI PURNOMO", unit: "Kecamatan Sukolilo", telp: "+6282131323533" },
  { nama: "EVI DINDA SETYAWATI", unit: "Kecamatan Sukolilo", telp: "+6281333657949" },
  { nama: "HENDRA ARIWIBOWO", unit: "Kecamatan Sukolilo", telp: "+6283854974888" },
  { nama: "HERI KUSWANTO", unit: "Kecamatan Sukolilo", telp: "+6285708982597" },
  { nama: "IMAM SYAFII YUSUF", unit: "Kecamatan Sukolilo", telp: "+6288291824885" },
  { nama: "INAS ANDI SABILA", unit: "Kecamatan Sukolilo", telp: "+6282229510272" },
  { nama: "KACUNG ROSYIDI", unit: "Kecamatan Sukolilo", telp: "+6281333298470" },
  { nama: "MACHFUT HIDAYAT S.Sos.I", unit: "Kecamatan Sukolilo", telp: "+6281334511300" },
  { nama: "MADE SUTRISNO", unit: "Kecamatan Sukolilo", telp: "+6285655765787" },
  { nama: "MOCH HATTA", unit: "Kecamatan Sukolilo", telp: "+6289696348822" },
  { nama: "NUNIK INDAH HATI S.E", unit: "Kecamatan Sukolilo", telp: "+6285785644447" },
  { nama: "OKY IRAWATI", unit: "Kecamatan Sukolilo", telp: "+6281217475339" },
  { nama: "RESWANDHA ABDI PAMUNGKAS", unit: "Kecamatan Sukolilo", telp: "+6289686686046" },
  { nama: "RUSYDA MAULIDIA S.H.I.", unit: "Kecamatan Sukolilo", telp: "+6281335513695" },
  { nama: "SHOLIHIN", unit: "Kecamatan Sukolilo", telp: "+6281335513695" },
  { nama: "WARAS", unit: "Kecamatan Sukolilo", telp: "+62882009140037" },
  { nama: "ANDRI SUMANTORO", unit: "Kecamatan Sukolilo", telp: "+6282189171716" },
  { nama: "BUDI IRWANTO", unit: "Kecamatan Sukolilo", telp: "+6285648281333" },
  { nama: "MOHAMMAD IQBAL DZIKRI", unit: "Kecamatan Sukolilo", telp: "+6285710835528" },
  { nama: "ZAINUL ARIFIN", unit: "Kecamatan Sukolilo", telp: "+6283837200075" },
  { nama: "INDRIYANI SETIYAWATI S.Sos, M.Si.", unit: "Kelurahan Gebang Putih", telp: "+6282333526648" },
  { nama: "NOVITA INDRIYATI S.Sos", unit: "Kelurahan Gebang Putih", telp: "+628123284598" },
  { nama: "DJOKO SUSILO SE", unit: "Kelurahan Gebang Putih", telp: "+6282266509586" },
  { nama: "ERFANDA YUDIANTO SAP", unit: "Kelurahan Gebang Putih", telp: "+62895323996600" },
  { nama: "QURROTUL AINI S.Si.", unit: "Kelurahan Gebang Putih", telp: "+6282226562932" },
  { nama: "NUR IDAH", unit: "Kelurahan Gebang Putih", telp: "+62881026211785" },
  { nama: "SUCI KRISTANTI ST., M.AP.", unit: "Kelurahan Gebang Putih", telp: "+6285168608706" },
  { nama: "ACHMAD ZULFIKAR A.Md.", unit: "Kelurahan Gebang Putih", telp: "+6289621861611" },
  { nama: "ADITA PRAMASARI S.E.", unit: "Kelurahan Gebang Putih", telp: "+62822323419890" },
  { nama: "MOHAMMAD MACHRUS", unit: "Kelurahan Gebang Putih", telp: "+6285851195365" },
  { nama: "NUR HIDAYATI", unit: "Kelurahan Gebang Putih", telp: "+6289696786351" },
  { nama: "RACHMAT KURNIAWAN", unit: "Kelurahan Gebang Putih", telp: "+6282228857442" },
  { nama: "RIEFKI RIFANDI S.T.", unit: "Kelurahan Gebang Putih", telp: "+6285899298995" },
  { nama: "DJALAL", unit: "Kelurahan Gebang Putih", telp: "+6285857660339" },
  { nama: "LUTHFA RUSYDANIAH", unit: "Kelurahan Gebang Putih", telp: "+6285931242589" },
  { nama: "VITRIA FARISH MAYASARI , S.H., M.Kn., M.H.", unit: "Kelurahan Keputih", telp: "+6281334511300" },
  { nama: "ANANG PURWANTO SE", unit: "Kelurahan Keputih", telp: "+6281953655919" },
  { nama: "MARENDRA DJAJA SAPUTRA A.Md.TEM., S.M.", unit: "Kelurahan Keputih", telp: "+6285100889383" },
  { nama: "RINI AGUSTINI A.Md.Keb", unit: "Kelurahan Keputih", telp: "+6281230054403" },
  { nama: "RUMINI SH", unit: "Kelurahan Keputih", telp: "+6285707384800" },
  { nama: "SUMAJI", unit: "Kelurahan Keputih", telp: "+6285730096975" },
  { nama: "AYU FITRI NURSANTOSO", unit: "Kelurahan Keputih", telp: "+6285773730977" },
  { nama: "CHAMIM TOHARI", unit: "Kelurahan Keputih", telp: "+6281330646911" },
  { nama: "DWI CANDRA KURNIAWAN", unit: "Kelurahan Keputih", telp: "+6282231260421" },
  { nama: "GALIH PUTRA KUSUMA", unit: "Kelurahan Keputih", telp: "+6287728436807" },
  { nama: "IBNU NASIR S.Pd", unit: "Kelurahan Keputih", telp: "+6287753564548" },
  { nama: "MOCHAMAD ALI", unit: "Kelurahan Keputih", telp: "+6283857826119" },
  { nama: "SHEILA NUR SHABRINA S.KM", unit: "Kelurahan Keputih", telp: "+6282231346574" },
  { nama: "TOTOK GIARTO S.E.", unit: "Kelurahan Keputih", telp: "+6281313016423" },
  { nama: "TUTUT SELPIAH", unit: "Kelurahan Keputih", telp: "+6285182294766" },
  { nama: "VICKY DWI ANDRIANTO", unit: "Kelurahan Keputih", telp: "+6285143002053" },
  { nama: "MARTAM", unit: "Kelurahan Keputih", telp: "+6285100984700" },
  { nama: "ERNI AMINIATI S.Pi.M.H", unit: "Kelurahan Klampis Ngasem", telp: "+628113404812" },
  { nama: "JOELIANITA SETYOWATI S.KM", unit: "Kelurahan Klampis Ngasem", telp: "+6281263126330" },
  { nama: "WAHONO SH", unit: "Kelurahan Klampis Ngasem", telp: "+6282338002396" },
  { nama: "AGUNG BUDI SUPRIYANTO S.A.P.", unit: "Kelurahan Klampis Ngasem", telp: "+62895701694080" },
  { nama: "JUNI HARTATI", unit: "Kelurahan Klampis Ngasem", telp: "+6281231067029" },
  { nama: "RUDY ERWANTO", unit: "Kelurahan Klampis Ngasem", telp: "+6281235063646" },
  { nama: "ASRI DWI YULIANSARI", unit: "Kelurahan Klampis Ngasem", telp: "+6285707007109" },
  { nama: "DWI ARMANTO PANGESTU", unit: "Kelurahan Klampis Ngasem", telp: "+6282132324631" },
  { nama: "HASAN EKA SYAHPUTRA", unit: "Kelurahan Klampis Ngasem", telp: "+6281214040414" },
  { nama: "HUZAEN HARI SISWONO", unit: "Kelurahan Klampis Ngasem", telp: "+6282331406155" },
  { nama: "MOCHAMAD ARBA'I", unit: "Kelurahan Klampis Ngasem", telp: "+6285959809717" },
  { nama: "MULYATMI", unit: "Kelurahan Klampis Ngasem", telp: "+6285730065556" },
  { nama: "NIZA RACHMAWATI", unit: "Kelurahan Klampis Ngasem", telp: "+6285746035035" },
  { nama: "REDDY DAHANA PUTRA ARIFIN", unit: "Kelurahan Klampis Ngasem", telp: "+6281230701010" },
  { nama: "TITIN YUNIATI", unit: "Kelurahan Klampis Ngasem", telp: "+6281342552876" },
  { nama: "FRITA YUNY RAHMAWATI", unit: "Kelurahan Klampis Ngasem", telp: "+6282229403165" },
  { nama: "Ir. OKY YANUAR KUSUMA ATMAJA S.Kom, M.MT", unit: "Kelurahan Medokan Semampir", telp: "+628113394220" },
  { nama: "BAGYO WIDODO ST, M.MT.", unit: "Kelurahan Medokan Semampir", telp: "+6281357142769" },
  { nama: "FEBRIARI MEGAHAYATI S.KM., M.Ling.", unit: "Kelurahan Medokan Semampir", telp: "+6281231631003" },
  { nama: "SUGIANA SH", unit: "Kelurahan Medokan Semampir", telp: "+6289677434457" },
  { nama: "ANDRE YANUAR", unit: "Kelurahan Medokan Semampir", telp: "+6281330600712" },
  { nama: "SODRI", unit: "Kelurahan Medokan Semampir", telp: "+6287754331771" },
  { nama: "SOERJADI", unit: "Kelurahan Medokan Semampir", telp: "+6281235534322" },
  { nama: "A'IZIL FIRDAUS", unit: "Kelurahan Medokan Semampir", telp: "+62895406230401" },
  { nama: "ANISAH", unit: "Kelurahan Medokan Semampir", telp: "+6281615568522" },
  { nama: "APRIANTO SUSILAN", unit: "Kelurahan Medokan Semampir", telp: "+6289512216644" },
  { nama: "DITA SISKAWATY", unit: "Kelurahan Medokan Semampir", telp: "+6282234898321" },
  { nama: "FAUZIYA RAKHMAWATI", unit: "Kelurahan Medokan Semampir", telp: "+6285711918221" },
  { nama: "FITRA BAMBANG TRISULO", unit: "Kelurahan Medokan Semampir", telp: "+6283830445880" },
  { nama: "HENDRA SETIAWAN", unit: "Kelurahan Medokan Semampir", telp: "+6285732285264" },
  { nama: "HERRY KESWANTO", unit: "Kelurahan Medokan Semampir", telp: "+6282334341183" },
  { nama: "ROCHMAD ADI SETIAWAN", unit: "Kelurahan Medokan Semampir", telp: "+628155631994" },
  { nama: "SYAIFUL ROZAQ", unit: "Kelurahan Medokan Semampir", telp: "+6285808779392" },
  { nama: "DIDIET FITRASARI SE", unit: "Kelurahan Menur Pumpungan", telp: "+6288989239343" },
  { nama: "ASPENA NURMA CAHYAWULAN S.M.", unit: "Kelurahan Menur Pumpungan", telp: "+6282245787882" },
  { nama: "ISNU WARDANI KARTIKASARI SE", unit: "Kelurahan Menur Pumpungan", telp: "+6282231070816" },
  { nama: "LIES ANDALINA SS", unit: "Kelurahan Menur Pumpungan", telp: "+6281330615320" },
  { nama: "NUR RIZKI", unit: "Kelurahan Menur Pumpungan", telp: "+6281977939977" },
  { nama: "OKT DANUWORO", unit: "Kelurahan Menur Pumpungan", telp: "+6281343181752" },
  { nama: "SUGIANTO", unit: "Kelurahan Menur Pumpungan", telp: "+6281336266117" },
  { nama: "ADHI TAMA PUTRA, S.E.", unit: "Kelurahan Menur Pumpungan", telp: "+6282131446487" },
  { nama: "AKIYAR TRI CAHYONO, S.sos.", unit: "Kelurahan Menur Pumpungan", telp: "+6281334396972" },
  { nama: "DENIARTA ARIF RAHMAN", unit: "Kelurahan Menur Pumpungan", telp: "+6287721776070" },
  { nama: "DINI ANDILIAN ANITASARI, S.Pi.", unit: "Kelurahan Menur Pumpungan", telp: "+6285733553712" },
  { nama: "HERLINA NOVITA SARI", unit: "Kelurahan Menur Pumpungan", telp: "+6281240832070" },
  { nama: "MIFTACHUL INDAH HADI, A.Md.", unit: "Kelurahan Menur Pumpungan", telp: "+6281234536332" },
  { nama: "NURWEDIANTO", unit: "Kelurahan Menur Pumpungan", telp: "+6285156880607" },
  { nama: "ANDI PRADANA", unit: "Kelurahan Menur Pumpungan", telp: "+6289635863636" },
  { nama: "MARMIATI", unit: "Kelurahan Menur Pumpungan", telp: "+6282141306328" },
  { nama: "NOVY ASTIWIE SH", unit: "Kelurahan Nginden Jangkungan", telp: "+6285850133567" },
  { nama: "RIZKIANA FIBRIYANTI S.Sos", unit: "Kelurahan Nginden Jangkungan", telp: "+628977452676" },
  { nama: "ADI PRIYANTO", unit: "Kelurahan Nginden Jangkungan", telp: "+62895332370124" },
  { nama: "FITRIA PUSPITAWATY S.E", unit: "Kelurahan Nginden Jangkungan", telp: "+6285186689144" },
  { nama: "NETTI HERAWATI SP", unit: "Kelurahan Nginden Jangkungan", telp: "+6281216160185" },
  { nama: "ENDANG RAMENINGSIH S.A.P.", unit: "Kelurahan Nginden Jangkungan", telp: "+628121615338" },
  { nama: "MUHAMMAD ICHWAN S.Kom", unit: "Kelurahan Nginden Jangkungan", telp: "087846050226" },
  { nama: "SINGGIH BEKTI PAMUNGKAS", unit: "Kelurahan Nginden Jangkungan", telp: "081334314709" },
  { nama: "ROIS ALWAN", unit: "Kelurahan Nginden Jangkungan", telp: "085730947035" },
  { nama: "DEWI DAMAYANTI", unit: "Kelurahan Nginden Jangkungan", telp: "082139801669" },
  { nama: "OKTAFIA MAYANGSARI", unit: "Kelurahan Nginden Jangkungan", telp: "089539302418" },
  { nama: "DYON ADI PERMANA", unit: "Kelurahan Nginden Jangkungan", telp: "082233048902" },
  { nama: "SUDARSONO", unit: "Kelurahan Nginden Jangkungan", telp: "08563578799" },
  { nama: "ADI RAHMAN SALIM", unit: "Kelurahan Nginden Jangkungan", telp: "085640366703" },
  { nama: "AGUS PRIYANTO", unit: "Kelurahan Nginden Jangkungan", telp: "081336208900" },
  { nama: "ARI BAGUS PRASETYA", unit: "Kelurahan Nginden Jangkungan", telp: "085385632818" },
  { nama: "ABDULLAH", unit: "Kelurahan Nginden Jangkungan", telp: "+6281333833552" },
  { nama: "KENNY PIETER TUPAMAHU S.STP, MM", unit: "Kelurahan Semolowaru", telp: "+628993677763" },
  { nama: "HERI SOECIPTO S.E.", unit: "Kelurahan Semolowaru", telp: "+6281931598567" },
  { nama: "ALDIZA NOUVELLINTIANE RAHARDJO S.KM, M.Kes.", unit: "Kelurahan Semolowaru", telp: "+6281938124815" },
  { nama: "KUKUH SATRIYO WITJAKSONO S.H", unit: "Kelurahan Semolowaru", telp: "+6281230646483" },
  { nama: "MOCHAMAD FADLI", unit: "Kelurahan Semolowaru", telp: "+6281230646483" },
  { nama: "DARYADI", unit: "Kelurahan Semolowaru", telp: "+6285649400086" },
  { nama: "DEFI NATALINA", unit: "Kelurahan Semolowaru", telp: "+6282241925434" },
  { nama: "EKO SASONGKO", unit: "Kelurahan Semolowaru", telp: "+6285646042007" },
  { nama: "I PUTU LARRY DENTA BHASKARA", unit: "Kelurahan Semolowaru", telp: "+6285960514108" },
  { nama: "KURNIADI ANNAZZAL", unit: "Kelurahan Semolowaru", telp: "+6282257136690" },
  { nama: "MAFULAH HAMNON", unit: "Kelurahan Semolowaru", telp: "+6281237500547" },
  { nama: "MUHAMMAD FADHLILLAH", unit: "Kelurahan Semolowaru", telp: "+6282139708128" },
  { nama: "RIKI ARFIAN", unit: "Kelurahan Semolowaru", telp: "+62895339402202" },
  { nama: "SITI SOPIAH", unit: "Kelurahan Semolowaru", telp: "+6281249804088" },
  { nama: "TUTIK HANDAYANI", unit: "Kelurahan Semolowaru", telp: "+6285141172353" },
  { nama: "WAHYU WIDODO PRABOWO", unit: "Kelurahan Semolowaru", telp: "+62895616793696" },
  { nama: "MUNAWAROH", unit: "Kelurahan Semolowaru", telp: "+6281217823861" }
];

// Guard khusus scanner: jangan kirim request Gemini baru sebelum request sebelumnya selesai.
// Ini mencegah request menumpuk saat respons AI lebih lama dari interval scan.
(function installGeminiScanGuard() {
  const nativeSetInterval = window.setInterval.bind(window);
  let scannerIntervalId = null;

  window.setInterval = function(callback, delay, ...args) {
    if (typeof callback === 'function' && callback.name === 'KirimKeGemini') {
      let requestSedangBerjalan = false;

      scannerIntervalId = nativeSetInterval(async () => {
        if (requestSedangBerjalan) return;
        requestSedangBerjalan = true;
        try {
          await callback(...args);
        } finally {
          requestSedangBerjalan = false;
        }
      }, delay);

      return scannerIntervalId;
    }

    return nativeSetInterval(callback, delay, ...args);
  };

  // Ubah error HTTP Gemini menjadi response JSON yang bisa dibaca kode lama,
  // lalu tampilkan status yang lebih informatif tanpa membeberkan secret.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const isGeminiFunction = url.includes('/.netlify/functions/gemini');

    if (!isGeminiFunction) return nativeFetch(input, init);

    const response = await nativeFetch(input, init);
    if (response.ok) return response;

    let payload = {};
    try {
      payload = await response.clone().json();
    } catch (_) {}

    const status = response.status;
    let pesan = `⚠️ Gemini gagal (HTTP ${status})`;
    if (status === 401) pesan = '⚠️ API key Gemini ditolak (401)';
    else if (status === 403) pesan = '⚠️ Akses Gemini ditolak (403)';
    else if (status === 429) pesan = '⚠️ Batas penggunaan Gemini tercapai (429)';
    else if (status >= 500) pesan = '⚠️ Server AI sedang bermasalah. Coba lagi.';

    setTimeout(() => {
      const statusText = document.getElementById('status-text');
      if (statusText) statusText.textContent = pesan;

      // Untuk auth error, hentikan loop supaya tidak terus membombardir API.
      if ((status === 401 || status === 403) && scannerIntervalId) {
        clearInterval(scannerIntervalId);
      }
    }, 0);

    return new Response(JSON.stringify({
      error: payload?.error || pesan,
      status
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
