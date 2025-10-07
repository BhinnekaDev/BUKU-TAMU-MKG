"use client";
interface DataBukuTamu {
  Nama_Depan_Pengunjung: string;
  Nama_Belakang_Pengunjung?: string;
  Email_Pengunjung?: string;
  email?: string;
  No_Telepon_Pengunjung: string;
  id_stasiun: string;
}

import Button from "@/components/Button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

function formatWaktuKunjungan(tanggal: string, jam: string): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dateObj = new Date(tanggal);
  const dayName = days[dateObj.getDay()];
  const date = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const jamFormatted = jam.replace(":", ".");
  return `${dayName}, ${date} ${monthName} ${year}, ${jamFormatted}`;
}

export default function CardForm() {
  const router = useRouter();
  const signatureRef = useRef<SignatureCanvas>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [alamat, setAlamat] = useState("");
  const [asalInstansi, setAsalInstansi] = useState("");
  const [formData, setFormData] = useState({
    asalpengunjung: "",
    tujuan: "",
  });
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [dataBukuTamu, setDataBukuTamu] = useState<DataBukuTamu | null>(null);
  const [stasiunName, setStasiunName] = useState("");

  // Ambil data & update waktu real-time
  useEffect(() => {
    const storedData = sessionStorage.getItem("dataBukuTamu");
    const storedStasiunName = sessionStorage.getItem("selectedStasiunName");
    if (storedData) setDataBukuTamu(JSON.parse(storedData));
    if (storedStasiunName) setStasiunName(storedStasiunName);

    const interval = setInterval(() => {
      setSelectedDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Perbaiki presisi pena (DPI aware)
  useEffect(() => {
    const resizeCanvas = () => {
      const canvasEl = signatureRef.current?.getCanvas();
      const sigPad = signatureRef.current;

      if (!canvasEl || !sigPad) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = canvasEl.offsetWidth;
      const height = canvasEl.offsetHeight;

      canvasEl.width = width * ratio;
      canvasEl.height = height * ratio;

      const ctx = canvasEl.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);

      const data = sigPad.toData();
      sigPad.clear();
      sigPad.fromData(data);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const handleSignatureEnd = () => {
    const canvas = signatureRef.current?.getCanvas();
    const isEmpty = signatureRef.current?.isEmpty();

    if (!canvas || isEmpty) {
      setHasSigned(false);
      setSignatureFile(null);
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "tanda_tangan.png", {
          type: "image/png",
        });
        setSignatureFile(file);
        setHasSigned(true);
      }
    }, "image/png");
  };

  const getStasiunImage = () => {
    switch (stasiunName.toLowerCase()) {
      case "klimatologi":
        return "/KLIMATOLOGI.png";
      case "meteorologi":
        return "/METEOROLOGI.png";
      case "geofisika":
        return "/GEOFISIKA.png";
    }
  };

  const isFormValid = () =>
    alamat.trim() &&
    formData.asalpengunjung.trim() &&
    formData.tujuan.trim() &&
    hasSigned &&
    signatureFile !== null;

  const getTanggalDanJam = () => {
    if (!selectedDate) return { tanggal: "", jam: "" };
    const tanggalISO = selectedDate.toISOString().split("T")[0];
    const jam = format(selectedDate, "HH:mm");
    return { tanggal: tanggalISO, jam };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid() || !dataBukuTamu) {
      alert("Lengkapi semua data terlebih dahulu.");
      return;
    }

    // Ambil dan validasi email
    const email = dataBukuTamu.Email_Pengunjung || dataBukuTamu.email || "";
    const emailCleaned = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailCleaned)) {
      alert("Format email tidak valid. Mohon periksa kembali.");
      return;
    }

    // Validasi data wajib dari sessionStorage
    if (
      !dataBukuTamu.Nama_Depan_Pengunjung ||
      !dataBukuTamu.No_Telepon_Pengunjung
    ) {
      alert("Nama depan dan no telepon wajib diisi.");
      return;
    }

    const { tanggal, jam } = getTanggalDanJam();
    const waktu_kunjungan = formatWaktuKunjungan(tanggal, jam);

    const form = new FormData();
    form.append(
      "Nama_Depan_Pengunjung",
      (dataBukuTamu.Nama_Depan_Pengunjung || "").trim()
    );
    form.append(
      "Nama_Belakang_Pengunjung",
      (dataBukuTamu.Nama_Belakang_Pengunjung || "").trim()
    );
    form.append("Email_Pengunjung", emailCleaned);
    form.append(
      "No_Telepon_Pengunjung",
      (dataBukuTamu.No_Telepon_Pengunjung || "").trim()
    );
    form.append("id_stasiun", dataBukuTamu.id_stasiun || "");
    form.append("Asal_Pengunjung", formData.asalpengunjung.trim());
    form.append("tujuan", formData.tujuan.trim());
    form.append("waktu_kunjungan", waktu_kunjungan);
    form.append("tanda_tangan", signatureFile!, "tanda_tangan.png");

    if (alamat.trim()) form.append("Alamat_Lengkap", alamat.trim());
    if (asalInstansi.trim()) form.append("Asal_Instansi", asalInstansi.trim());

    try {
      const response = await fetch(
        "https://buku-tamu-mkg-database.vercel.app/api/pengunjung/isi-buku-tamu",
        { method: "POST", body: form }
      );

      if (response.ok) {
        setShowModal(true);
      } else {
        const errorText = await response.text();
        console.error("Gagal kirim data:", errorText);
        alert("Gagal mengirim data. Periksa kembali isian Anda.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat mengirim data.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => router.push("/"), 3000);
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen px-4 sm:px-6">
        <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex-col md:flex-row">
          <div className="hidden md:block w-full md:w-1/2">
            <Image
              src={getStasiunImage() || "/fallback.png"} // jaga-jaga jika undefined
              alt={`Gedung ${stasiunName}`}
              width={600} // sesuaikan dengan ukuran real
              height={400}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
              Yuk, Isi Buku Tamu Dulu!
            </h1>
            <p className="text-sm text-blue-800 mb-6 sm:mb-8">
              Data kunjungan kamu membantu kami memberikan pelayanan yang lebih
              baik dan tertata.
            </p>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full">
                  <label className="text-sm text-blue-800 font-medium mb-1">
                    Asal Pengunjung
                  </label>
                  <select
                    value={formData.asalpengunjung}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        asalpengunjung: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 text-sm border border-blue-300 rounded-xl text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Pilih Asal Pengunjung{" "}
                    </option>
                    <option value="BMKG">BMKG</option>
                    <option value="Pemerintah Pusat/Pemerintah Daerah">
                      Pemerintah Pusat/Pemerintah Daerah
                    </option>
                    <option value="Umum">Umum</option>
                    <option value="Universitas">Universitas</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="text-sm text-blue-800 font-medium mb-1">
                    Waktu Kedatangan
                  </label>
                  <div className="w-full px-4 py-2 text-sm border border-blue-300 rounded-xl bg-gray-100 text-blue-800">
                    {selectedDate
                      ? format(selectedDate, "EEEE, d MMMM yyyy, HH.mm", {
                          locale: id,
                        })
                      : "Memuat..."}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-800 font-medium mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Raya Bengkulu No. 1, Bengkulu"
                  rows={2}
                  className="w-full px-4 py-2 text-sm border border-blue-300 rounded-xl text-blue-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-blue-800 font-medium mb-1">
                  Asal Instansi
                </label>
                <input
                  type="text"
                  value={asalInstansi}
                  onChange={(e) => setAsalInstansi(e.target.value)}
                  placeholder="Contoh: Dinas Perhubungan Bengkulu"
                  className="w-full px-4 py-2 text-sm border border-blue-300 rounded-xl text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-blue-800 font-medium mb-1">
                  Tujuan Kunjungan
                </label>
                <textarea
                  value={formData.tujuan}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan: e.target.value })
                  }
                  rows={2}
                  placeholder="Contoh: Mengikuti rapat koordinasi"
                  className="w-full px-4 py-2 text-sm border border-blue-300 rounded-xl text-blue-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-blue-800 font-medium mb-1">
                  Tanda Tangan Langsung
                </label>
                <div className="border border-dashed border-blue-400 rounded-xl overflow-hidden">
                  <SignatureCanvas
                    penColor="black"
                    ref={signatureRef}
                    velocityFilterWeight={0.7}
                    minWidth={1}
                    maxWidth={2.5}
                    onEnd={handleSignatureEnd}
                    canvasProps={{
                      className: "w-full h-36 sm:h-40 bg-white touch-none",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signatureRef.current?.clear();
                    setHasSigned(false);
                    setSignatureFile(null);
                  }}
                  className="mt-2 text-xs text-blue-700 underline hover:text-blue-900"
                >
                  Hapus Tanda Tangan
                </button>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <Button
                  type="button"
                  text="Batalkan"
                  onClick={() => router.push("/")}
                  stylebutton="bg-blue-900 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-800 w-full sm:w-auto"
                />
                <Button
                  type="submit"
                  text="Kirim"
                  disabled={!isFormValid()}
                  stylebutton={`bg-blue-900 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-800 w-full sm:w-auto ${
                    !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Terima Kasih!
            </h2>
            <p className="text-sm text-blue-800 mb-4">
              Data kunjungan kamu berhasil dikirim.
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-4 bg-blue-900 text-white py-2 px-4 rounded-xl hover:bg-blue-800 transition duration-200"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </>
  );
}
