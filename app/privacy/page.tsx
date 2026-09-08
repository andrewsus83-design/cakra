import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Bagaimana cakra mengumpulkan, menggunakan, menyimpan, dan melindungi data Anda — selaras dengan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <LegalDoc
      title="Kebijakan Privasi"
      updated="9 September 2026"
      intro="Kebijakan ini menjelaskan bagaimana cakra mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda, serta hak-hak Anda atasnya. Kami memproses data secara selaras dengan Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Dengan menggunakan cakra, Anda menyetujui praktik yang diuraikan di sini."
      sections={[
        { h: "Data yang kami kumpulkan", body: [
          "Data akun: nama, email, nomor WhatsApp, dan kata sandi yang Anda buat.",
          "Data profil & konten: area layanan, brand, listing, foto, teks, serta materi lain yang Anda unggah atau hasilkan melalui platform.",
          "Data prospek (lead): informasi calon pembeli yang masuk melalui situs yang Anda kelola — misalnya nama dan kontak yang mereka kirimkan.",
          "Data teknis: log penggunaan, jenis perangkat, dan cookie fungsional (mis. preferensi tema dan sesi login).",
        ] },
        { h: "Bagaimana kami menggunakan data", body: [
          "Untuk menyediakan dan menjalankan layanan: membangun website, listing, video, dan konten Anda; mengoptimasi kehadiran Anda di pencarian; serta menghitung Skor Cakra.",
          "Untuk berkomunikasi dengan Anda mengenai akun, pembaruan layanan, dan dukungan.",
          "Untuk menjaga keamanan, mencegah penyalahgunaan, dan mematuhi kewajiban hukum.",
          "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak mana pun.",
        ] },
        { h: "Dasar pemrosesan", body: [
          "Kami memproses data berdasarkan persetujuan Anda, pelaksanaan perjanjian layanan, kepentingan sah yang wajar, dan/atau kepatuhan terhadap hukum yang berlaku, sesuai UU PDP.",
        ] },
        { h: "Berbagi data dengan pihak ketiga", body: [
          "Kami dapat membagikan data secara terbatas kepada penyedia layanan yang membantu kami mengoperasikan platform — misalnya hosting, penyedia model AI, dan pemroses pembayaran — yang terikat kewajiban kerahasiaan dan hanya boleh menggunakan data untuk tujuan yang kami tetapkan.",
          "Kami dapat mengungkapkan data bila diwajibkan oleh hukum atau proses hukum yang sah.",
        ] },
        { h: "Penyimpanan & keamanan", body: [
          "Data dilindungi dengan langkah keamanan yang wajar, termasuk enkripsi saat transit dan kontrol akses. Tidak ada sistem yang sepenuhnya bebas risiko, namun kami berupaya menjaga data Anda secara bertanggung jawab.",
          "Kami menyimpan data selama akun Anda aktif atau sepanjang diperlukan untuk tujuan yang dijelaskan di sini, kecuali hukum mengharuskan penyimpanan lebih lama.",
        ] },
        { h: "Hak Anda", body: [
          "Anda berhak mengakses, memperbaiki, memperbarui, mengekspor, dan menghapus data pribadi Anda, serta menarik persetujuan kapan saja. Anda juga dapat mengajukan keberatan atas pemrosesan tertentu.",
          "Untuk menjalankan hak-hak ini, hubungi kami di halo@cakra.xyz. Kami akan menanggapi dalam waktu yang wajar sesuai UU PDP.",
        ] },
        { h: "Data prospek (lead) calon pembeli", body: [
          "Untuk data calon pembeli yang masuk melalui situs Anda, Anda (agen) bertindak sebagai pengendali data dan cakra sebagai pemroses. Anda bertanggung jawab menggunakan data tersebut secara sah dan menghormati privasi calon pembeli.",
        ] },
        { h: "Cookie", body: [
          "Kami menggunakan cookie/penyimpanan lokal seminimal mungkin untuk fungsi dasar seperti mengingat preferensi tema dan menjaga sesi Anda tetap masuk. Kami tidak menggunakannya untuk pelacakan iklan lintas situs.",
        ] },
        { h: "Kepemilikan & portabilitas", body: [
          "Website, domain, konten, dan data prospek yang Anda hasilkan tetap milik Anda. Anda dapat mengekspor atau menghapusnya kapan saja bila berhenti berlangganan.",
        ] },
        { h: "Perubahan kebijakan", body: [
          "Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan penting akan kami beri tahukan melalui email atau di dalam aplikasi sebelum berlaku.",
        ] },
      ]}
    />
  );
}
