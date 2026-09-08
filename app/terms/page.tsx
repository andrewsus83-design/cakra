import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Ketentuan penggunaan platform cakra: layanan, akun, langganan & pembayaran, kepemilikan konten, dan tanggung jawab.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <LegalDoc
      title="Syarat & Ketentuan"
      updated="9 September 2026"
      intro="Syarat & Ketentuan ini mengatur penggunaan Anda atas platform cakra. Dengan membuat akun atau menggunakan layanan kami, Anda menyetujui ketentuan berikut. Mohon baca dengan saksama."
      sections={[
        { h: "Penerimaan ketentuan", body: [
          "Dengan mengakses atau menggunakan cakra, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini beserta Kebijakan Privasi kami.",
        ] },
        { h: "Layanan cakra", body: [
          "cakra adalah platform kehadiran digital untuk agen properti: pembuatan website, manajemen listing, studio video & konten AI, pustaka aset, dan pengukuran kehadiran (Skor Cakra). Fitur dapat berkembang dari waktu ke waktu.",
        ] },
        { h: "Akun Anda", body: [
          "Anda bertanggung jawab menjaga kerahasiaan kredensial akun dan atas semua aktivitas di dalamnya. Anda setuju memberikan informasi yang akurat dan memperbaruinya bila berubah.",
        ] },
        { h: "Langganan & pembayaran", body: [
          "cakra menawarkan paket Gratis dan paket berbayar Pro seharga Rp 300.000 per bulan. Rincian dan cakupan tiap paket tersedia di halaman Harga.",
          "Langganan berbayar diperpanjang otomatis setiap periode hingga Anda membatalkannya. Anda dapat berhenti kapan saja tanpa penalti; akses berbayar berlaku hingga akhir periode yang telah dibayar.",
          "Harga dapat berubah sewaktu-waktu, dengan pemberitahuan sebelumnya. Pajak yang berlaku dapat ditambahkan sesuai ketentuan.",
        ] },
        { h: "Konten Anda", body: [
          "Anda tetap menjadi pemilik atas konten dan data yang Anda unggah atau hasilkan. Anda memberi cakra lisensi terbatas untuk menyimpan, memproses, dan menampilkan konten tersebut semata-mata untuk menjalankan layanan bagi Anda.",
          "Anda bertanggung jawab atas keakuratan dan legalitas konten Anda — termasuk memastikan klaim tetap akurat dan foto tidak menyesatkan.",
        ] },
        { h: "Konten yang dihasilkan AI", body: [
          "Fitur AI menghasilkan draf awal (teks, artikel, video). Anda wajib meninjau dan menyunting hasil sebelum menerbitkannya, dan Anda bertanggung jawab penuh atas versi final yang Anda terbitkan.",
        ] },
        { h: "Penggunaan yang dilarang", body: [
          "Anda setuju untuk tidak menggunakan cakra untuk kegiatan melanggar hukum, menyesatkan konsumen, melanggar hak kekayaan intelektual pihak lain, menyebarkan spam, atau mengganggu keamanan dan integritas platform.",
        ] },
        { h: "Kekayaan intelektual cakra", body: [
          "Merek, logo, perangkat lunak, dan materi platform cakra adalah milik cakra dan dilindungi hukum. Ketentuan ini tidak mengalihkan hak apa pun atas kekayaan intelektual cakra kepada Anda.",
        ] },
        { h: "Ketersediaan & tanpa jaminan peringkat", body: [
          "Kami berupaya menjaga layanan tetap tersedia, namun tidak menjamin operasi tanpa gangguan. cakra membangun fondasi agar Anda lebih mudah ditemukan, tetapi tidak menjamin peringkat tertentu di Google maupun mesin pencari AI — tidak ada pihak yang dapat menjamin hal itu.",
        ] },
        { h: "Batasan tanggung jawab", body: [
          "Sepanjang diizinkan hukum, cakra tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan. Layanan disediakan sebagaimana adanya.",
        ] },
        { h: "Penghentian", body: [
          "Anda dapat berhenti kapan saja. Kami dapat menangguhkan atau menghentikan akun yang melanggar ketentuan ini, dengan pemberitahuan bila memungkinkan.",
        ] },
        { h: "Kepemilikan & portabilitas data", body: [
          "Website, domain, konten, dan data prospek Anda tetap milik Anda. Anda dapat mengekspor atau menghapusnya kapan saja saat berhenti berlangganan.",
        ] },
        { h: "Hukum yang berlaku", body: [
          "Syarat & Ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa akan diselesaikan sesuai ketentuan hukum yang berlaku.",
        ] },
        { h: "Perubahan ketentuan", body: [
          "Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Perubahan penting akan kami beri tahukan sebelum berlaku, dan penggunaan Anda yang berlanjut berarti Anda menerima ketentuan yang diperbarui.",
        ] },
      ]}
    />
  );
}
