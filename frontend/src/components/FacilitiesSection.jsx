import React from 'react';
import { 
  Shield, CheckCircle2, AlertCircle, Sparkles, Building2, 
  Flame, Shirt, Droplets, Utensils, Car, Volume2, Clock 
} from 'lucide-react';

export default function FacilitiesSection() {
  const facilities = [
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      title: 'Rumput Sintetis & Vinyl Standar',
      desc: 'Permukaan lapangan lembut dan empuk meminimalkan risiko cedera dan lecet pada lutut serta engkel pemain.',
    },
    {
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      title: 'Alih Fungsi Gedung Serbaguna',
      desc: 'Dapat dialihfungsikan menjadi aula luas untuk resepsi pernikahan, syukuran, senam komunitas, atau gathering.',
    },
    {
      icon: <Droplets className="w-5 h-5 text-emerald-600" />,
      title: 'Ruang Ganti & Kamar Mandi Bersih',
      desc: 'Kamar mandi dengan shower air bersih mengalir, wastafel, dan loker penyimpanan pakaian pemain.',
    },
    {
      icon: <Shirt className="w-5 h-5 text-emerald-600" />,
      title: 'Musholla & Tempat Wudhu',
      desc: 'Area ibadah terpisah yang bersih, tenang, dan terawat lengkap dengan sajadah dan sarung.',
    },
    {
      icon: <Utensils className="w-5 h-5 text-emerald-600" />,
      title: 'Kantin & Minuman Berenergi',
      desc: 'Kantin penyedia air mineral dingin, minuman isotonik, kopi, dan makanan ringan untuk rehidrasi pemain.',
    },
    {
      icon: <Volume2 className="w-5 h-5 text-emerald-600" />,
      title: 'Sound System & Penerangan LED',
      desc: 'Penerangan lampu sorot LED berdaya terang tanpa silau serta audio sound system untuk pengumuman atau acara.',
    },
    {
      icon: <Car className="w-5 h-5 text-emerald-600" />,
      title: 'Area Parkir Luas & Aman',
      desc: 'Area parkir berpagar yang luas mampu menampung puluhan mobil dan ratusan sepeda motor.',
    },
    {
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      title: 'Tribun Penonton Nyaman',
      desc: 'Tribun bertingkat untuk suporter dan penonton menyaksikan jalannya pertandingan dengan leluasa.',
    },
  ];

  const rules = [
    'Wajib menggunakan sepatu futsal bertelapak karet/indoor (dilarang keras memakai sepatu sepak bola berpaku besi/pull).',
    'Dilarang merokok, membawa senjata tajam, obat terlarang, atau minuman beralkohol di seluruh area arena.',
    'Penyewa dimohon hadir 10–15 menit sebelum slot jam sewa dimulai agar tidak memotong durasi bermain sendiri.',
    'Menjaga kebersihan bersama dengan membuang botol minuman dan sampah pada tempat yang telah disediakan.',
    'Pembatalan atau permintaan reschedule jadwal sewa wajib diinformasikan ke pengelola minimal H-1 sebelum tanggal main.',
  ];

  return (
    <section id="fasilitas" className="py-14 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Bagian 03
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Fasilitas Arena & Peraturan Penyewaan
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Kenyamanan dan keamanan pengguna adalah prioritas utama Lasdo Family Futsal.
          </p>
        </div>

        {/* Grid Fasilitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {facilities.map((f, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all space-y-2"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center">
                {f.icon}
              </div>
              <h4 className="font-heading font-bold text-sm text-slate-900">
                {f.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Peraturan Sewa Lapangan */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-heading font-bold text-base text-white">
              Aturan & Ketertiban Penyewa Lasdo Family Futsal
            </h3>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
