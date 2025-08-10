"use client";
import { useState, useEffect } from "react";

export default function TermsAndPolicyCard() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("terms_seen");
    if (!hasSeen) {
      setIsOpen(true);
      sessionStorage.setItem("terms_seen", "true");
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close Melayang */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 bg-white/70 hover:bg-red-500 cursor-pointer hover:text-white text-gray-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition"
              aria-label="Tutup"
            >
              ✕
            </button>

            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-blue-800">
                Syarat & Ketentuan
              </h2>
            </div>

            {/* Konten */}
            <div className="p-6 overflow-y-auto text-sm space-y-6 text-blue-800">
              <section>
                <p>
                  Dengan mengakses dan menggunakan layanan Buku Tamu Digital
                  BMKG Provinsi Bengkulu, Anda dianggap telah membaca, memahami,
                  dan menyetujui semua ketentuan berikut:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    Layanan ini digunakan untuk mencatat kunjungan secara
                    digital.
                  </li>
                  <li>Pengguna wajib mengisi data secara jujur dan akurat.</li>
                  <li>
                    BMKG berhak menggunakan data untuk evaluasi layanan dan
                    keperluan internal.
                  </li>
                  <li>
                    Kami tidak akan membagikan data kepada pihak ketiga tanpa
                    izin, kecuali diwajibkan oleh hukum.
                  </li>
                  <li>
                    Keamanan data dijaga sesuai standar dan dapat diminta
                    penghapusan jika diperlukan.
                  </li>
                  <li>
                    Perubahan kebijakan dapat dilakukan sewaktu-waktu dan akan
                    diumumkan di situs ini.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-lg">Kebijakan Privasi</h3>
                <p>Kami mengumpulkan informasi sebagai berikut:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Nama lengkap</li>
                  <li>Jabatan / Instansi</li>
                  <li>Email & Nomor Telepon</li>
                  <li>Tujuan kunjungan & waktu</li>
                  <li>Tanda tangan digital</li>
                </ul>
                <p className="mt-2">
                  Informasi tersebut digunakan hanya untuk kepentingan internal
                  BMKG Provinsi Bengkulu, termasuk keperluan statistik,
                  keamanan, dan peningkatan pelayanan publik. Anda memiliki hak
                  atas data Anda.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="border-t p-6 flex justify-end bg-gray-50">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition shadow cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
