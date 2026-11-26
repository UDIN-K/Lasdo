import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import hallImg from '../assets/images/venue_multipurpose_hall_1795716184581.jpg';

export default function FacilitiesSection() {
  const [imgError, setImgError] = useState(false);

  const facilityGroups = [
    {
      title: 'Lapangan Futsal Indoor',
      items: [
        'Rumput sintetis standar indoor lengkap dengan jaring pengaman keliling.',
        'Lampu sorot LED terang dan merata untuk jadwal bermain malam.',
        'Bangku pemain dan area duduk penonton di sisi lapangan.',
      ],
    },
    {
      title: 'Gedung Serbaguna',
      items: [
        'Ruang indoor luas untuk acara keluarga, syukuran warga, senam komunitas, dan gathering.',
        'Tersedia perangkat sound system dan mikrofon acara.',
      ],
    },
    {
      title: 'Kenyamanan & Parkir',
      items: [
        'Ruang ganti, kamar mandi shower air bersih, dan musholla terpisah.',
        'Kantin penyedia minuman dingin dan makanan ringan.',
        'Halaman parkir berpagar untuk mobil dan sepeda motor.',
      ],
    },
  ];

  const rules = [
    'Gunakan sepatu futsal bersol karet/indoor (dilarang sepatu bola berpaku/pull).',
    'Dilarang merokok atau membawa minuman beralkohol di seluruh area lapangan dan gedung.',
    'Datang 10–15 menit sebelum jadwal main agar durasi sewa tidak terpotong.',
    'Buang sampah dan botol minuman pada tempat yang telah disediakan.',
    'Pembatalan atau perubahan jadwal (reschedule) maksimal H-1 melalui pengelola.',
  ];

  return (
    <section id="fasilitas" className="py-12 bg-[#fafaf8] border-b border-stone-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Fasilitas & Tata Tertib
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 mt-1.5">
            Sarana yang tersedia untuk pertandingan futsal maupun penyewaan acara warga.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-stretch mb-10">
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex-1 min-h-[250px] rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
              {!imgError ? (
                <img
                  src={hallImg}
                  alt="Gedung serbaguna dan ruang acara indoor Lasdo Family Futsal"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full lg:h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-stone-100 text-zinc-700 p-6 text-center">
                  <Building2 className="w-10 h-10 text-emerald-700 mb-2" />
                  <p className="font-heading font-bold">Gedung Serbaguna Lasdo</p>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2.5">
              Area gedung serbaguna Lasdo Family Futsal yang dapat disewa per jam untuk acara keluarga dan pertemuan warga.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white rounded-lg border border-stone-200 divide-y divide-stone-200">
            {facilityGroups.map((group) => (
              <div key={group.title} className="p-5 sm:p-6 space-y-2">
                <h3 className="font-heading font-bold text-base text-zinc-900">
                  {group.title}
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-600 list-disc list-inside marker:text-emerald-700">
                  {group.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tata Tertib */}
        <div className="bg-white p-6 sm:p-7 rounded-lg border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-stone-200">
            <h3 className="font-heading font-bold text-lg text-zinc-900">
              Tata Tertib Penyewa
            </h3>
            <span className="text-xs text-zinc-500">
              Berlaku untuk seluruh penyewa lapangan dan gedung
            </span>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs sm:text-sm text-zinc-700">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="font-heading text-xs font-bold text-emerald-800 shrink-0 mt-0.5 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
