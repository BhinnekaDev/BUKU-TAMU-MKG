"use client";
import BgPage from "@/components/BgPage";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Stasiun = {
  ID_Stasiun: string;
  Nama_Stasiun: string;
};

export default function Home() {
  const router = useRouter();
  const [stasiunList, setStasiunList] = useState<Stasiun[]>([]);

  const handlePilihStasiun = (idStasiun: string, namaStasiun: string) => {
    sessionStorage.setItem("selectedStasiunId", idStasiun);
    sessionStorage.setItem("selectedStasiunName", namaStasiun);
    router.push("/beranda");
  };

  useEffect(() => {
    const fetchStasiun = async () => {
      try {
        const res = await fetch(
          "https://buku-tamu-mkg-database.vercel.app/api/pengunjung"
        );
        const json = await res.json();
        const data = json.data;

        const ordered = ["Meteorologi", "Klimatologi", "Geofisika"];
        const sorted = ordered
          .map((nama) => data.find((s: Stasiun) => s.Nama_Stasiun === nama))
          .filter(Boolean);

        setStasiunList(sorted);
      } catch (err) {
        console.error("Gagal memuat data stasiun", err);
      }
    };

    fetchStasiun();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-blue-900 overflow-x-hidden box-border">
      <BgPage className="flex-1 flex flex-col items-center justify-start w-full pt-8 pb-20 overflow-x-hidden">
        {/* Logo BMKG */}
        <div className="mt-16 flex justify-center">
          <Image
            src="/LogoBmkg.png"
            alt="Logo Bmkg"
            width={121}
            height={109}
            className="w-[100px] h-[84px] sm:w-[110px] sm:h-[96px] md:w-[121px] md:h-[109px] object-contain"
          />
        </div>

        {/* Judul dan Subjudul */}
        <div className="text-center text-white px-4 pt-8 sm:pt-10 max-w-5xl w-full">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-3">
            BUKU TAMU DIGITAL BMKG <br />
            PROVINSI BENGKULU
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl font-light mb-10">
            Silakan pilih stasiun yang Anda kunjungi:
          </h2>
        </div>

        {/* Grid Card */}
        <div className="container px-4 grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          {stasiunList.map((stasiun) => (
            <div key={stasiun.ID_Stasiun} className="w-full">
              <Card
                image={
                  stasiun.Nama_Stasiun === "Meteorologi"
                    ? "/GedungMeteo.png"
                    : stasiun.Nama_Stasiun === "Klimatologi"
                    ? "/GedungKlima.png"
                    : "/GedungGeo.png"
                }
                text={`STASIUN ${stasiun.Nama_Stasiun.toUpperCase()}`}
                logo="/LogoBmkgSmall.png"
                textColor="bg-gradient-to-r from-[#1A6EB5] to-[#073CA4] bg-clip-text text-transparent"
                onclick={() =>
                  handlePilihStasiun(stasiun.ID_Stasiun, stasiun.Nama_Stasiun)
                }
              />
            </div>
          ))}
        </div>
      </BgPage>

      {/* Footer tetap di bawah */}
      <Footer />
    </div>
  );
}
