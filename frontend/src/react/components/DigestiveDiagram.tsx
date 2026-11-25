import React, { useState } from "react";

export const DigestiveDiagram: React.FC = () => {
  const [activePin, setActivePin] = useState<number | null>(2); // Default to pin 2 (Lambung)

  const organList = [
    { id: 1, name: "Rongga Mulut", desc: "Tempat pencernaan mekanik (gigi) & kimiawi (enzim ptialin)" },
    { id: 2, name: "Ventrikulus (Lambung)", desc: "Menghasilkan getah lambung: enzim pepsin, renin, dan asam HCl", isTarget: true },
    { id: 3, name: "Hepar (Hati)", desc: "Menghasilkan cairan empedu untuk mengemulsikan lemak" },
    { id: 4, name: "Intestinum (Usus Halus)", desc: "Penyerapan nutrisi makanan melalui vili-vili usus" },
  ];

  return (
    <div className="bg-[#FEFAF3] rounded-2xl border border-[#B8CFB3] p-4 space-y-3">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        {/* SVG Anatomi Diagram */}
        <div className="relative w-64 h-52 bg-white rounded-xl border border-[#B8CFB3] p-2 shadow-inner flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 240 200" className="w-full h-full">
            {/* Siluet Tubuh Manusia */}
            <path
              d="M120 15 C110 15 100 25 100 40 C100 50 105 60 115 65 L115 80 C80 90 70 120 70 180 L170 180 C170 120 160 90 125 80 L125 65 C135 60 140 50 140 40 C140 25 130 15 120 15 Z"
              fill="#FEFAF3"
              stroke="#B8CFB3"
              strokeWidth="2"
            />

            {/* Kerongkongan (Esofagus) */}
            <path d="M120 65 L120 100" stroke="#84A282" strokeWidth="4" strokeLinecap="round" />

            {/* Organ Hati (Hepar) - Kanan Atas Tubuh / Kiri di visual */}
            <path
              d="M95 100 C90 100 80 108 85 122 C90 130 110 130 115 120 C118 110 115 100 95 100 Z"
              fill={activePin === 3 ? "#F6E2E9" : "#fbeff3"}
              stroke="#84A282"
              strokeWidth="1.5"
              className="transition-colors duration-200 cursor-pointer"
              onClick={() => setActivePin(3)}
            />

            {/* Organ Lambung (Ventrikulus) - Organ Target (2) */}
            <path
              d="M120 98 C135 98 152 105 148 122 C145 136 128 135 118 130 C112 127 114 115 120 98 Z"
              fill={activePin === 2 ? "#84A282" : "#B8CFB3"}
              stroke={activePin === 2 ? "#60795e" : "#84A282"}
              strokeWidth="2"
              className="transition-colors duration-200 cursor-pointer filter drop-shadow-sm"
              onClick={() => setActivePin(2)}
            />

            {/* Usus Halus (Intestinum) */}
            <path
              d="M110 132 C95 135 95 150 105 155 C115 160 130 150 135 155 C140 160 125 170 118 172"
              fill="none"
              stroke={activePin === 4 ? "#60795e" : "#B8CFB3"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200 cursor-pointer"
              onClick={() => setActivePin(4)}
            />

            {/* Pin 1: Mulut */}
            <g className="cursor-pointer" onClick={() => setActivePin(1)}>
              <circle cx="120" cy="45" r="9" fill={activePin === 1 ? "#84A282" : "#B8CFB3"} />
              <text x="120" y="49" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                1
              </text>
            </g>

            {/* Pin 2: Lambung (Ventrikulus) */}
            <g className="cursor-pointer" onClick={() => setActivePin(2)}>
              <circle
                cx="138"
                cy="114"
                r="11"
                fill="#84A282"
                stroke="#FEFAF3"
                strokeWidth="2"
                className="animate-pulse"
              />
              <text x="138" y="118" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                2
              </text>
            </g>

            {/* Pin 3: Hati (Hepar) */}
            <g className="cursor-pointer" onClick={() => setActivePin(3)}>
              <circle cx="98" cy="114" r="9" fill={activePin === 3 ? "#84A282" : "#B8CFB3"} />
              <text x="98" y="118" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                3
              </text>
            </g>

            {/* Pin 4: Usus Halus (Intestinum) */}
            <g className="cursor-pointer" onClick={() => setActivePin(4)}>
              <circle cx="120" cy="155" r="9" fill={activePin === 4 ? "#84A282" : "#B8CFB3"} />
              <text x="120" y="159" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                4
              </text>
            </g>
          </svg>
        </div>

        {/* Keterangan Label Interaktif */}
        <div className="flex-1 space-y-2 w-full max-w-xs">
          <div className="flex items-center justify-between pb-1 border-b border-[#B8CFB3]/60">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Keterangan Label Skema
            </span>
            <span className="text-[10px] text-[#60795e] font-semibold">Klik organ/nomor</span>
          </div>

          <div className="space-y-1.5">
            {organList.map((organ) => {
              const isSelected = activePin === organ.id;
              return (
                <div
                  key={organ.id}
                  onClick={() => setActivePin(organ.id)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? "bg-[#B8CFB3]/25 border-[#84A282] text-[#60795e] shadow-sm"
                      : "bg-white border-[#B8CFB3] text-slate-700 hover:bg-[#FEFAF3]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? "bg-[#84A282] text-white" : "bg-[#FEFAF3] border border-[#B8CFB3] text-slate-700"
                      }`}
                    >
                      {organ.id}
                    </span>
                    <div>
                      <span className={`font-bold block ${isSelected ? "text-[#60795e]" : "text-slate-800"}`}>
                        {organ.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-[#60795e] block leading-tight mt-0.5">
                          {organ.desc}
                        </span>
                      )}
                    </div>
                  </div>
                  {organ.isTarget && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#84A282] text-white shadow-sm">
                      Target Soal
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-center text-slate-500 italic pt-1">
        Gambar 2.4: Skema Saluran dan Kelenjar Pencernaan Makanan Manusia
      </p>
    </div>
  );
};
