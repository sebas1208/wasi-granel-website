/**
 * The stylized vector map from the "Contacto y Sucursales" mockup — parks, roads and Riobamba-area
 * landmark labels, with a marker pill for the store. This is decoration, not a real map: the mockup
 * draws it by hand rather than embedding Google Maps. The "Cómo llegar" button beside it links to the
 * store's real address.
 *
 * The mockup has two of these (Riobamba + Quito). Quito does not exist, and both of our stores are in
 * Riobamba, so there is one map and only the marker label changes.
 */
export function StoreMap({ marker }: { marker: string }) {
  return (
    <div className="w-full h-full relative" data-testid="store-map">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 500" aria-hidden="true">
        <rect fill="#edf3ec" height="100%" width="100%" />
        {/* Green areas */}
        <path d="M 40 40 Q 90 20, 160 50 T 220 120 T 110 200 Z" fill="#d9ebd7" />
        <path d="M 420 80 Q 480 30, 560 60 T 580 200 T 450 250 Z" fill="#d9ebd7" />
        <path d="M 390 320 Q 470 290, 560 360 T 520 480 T 360 450 Z" fill="#e2eedf" />
        <path d="M 40 380 Q 120 330, 180 410 T 100 490 Z" fill="#d9ebd7" />
        {/* Primary roads */}
        <path d="M -20 150 C 150 160, 300 130, 620 170" fill="none" stroke="#ffffff" strokeWidth="14" />
        <path d="M -20 150 C 150 160, 300 130, 620 170" fill="none" stroke="#fbd995" strokeWidth="7" />
        <path d="M 280 -20 C 310 160, 290 320, 330 520" fill="none" stroke="#ffffff" strokeWidth="16" />
        <path d="M 280 -20 C 310 160, 290 320, 330 520" fill="none" stroke="#fbd995" strokeWidth="8" />
        {/* Secondary roads */}
        <path d="M 50 -10 L 150 510 M 180 -10 L 220 510 M 420 -10 L 460 510 M 520 -10 L 550 510" fill="none" stroke="#ffffff" strokeWidth="7" />
        <path d="M -10 60 L 610 80 M -10 260 L 610 240 M -10 360 L 610 390 M -10 440 L 610 430" fill="none" stroke="#ffffff" strokeWidth="6" />
        {/* Landmark labels */}
        <text fill="#697669" fontSize="11" fontWeight="700" x="180" y="70">San Andrés</text>
        <text fill="#697669" fontSize="11" fontWeight="700" x="390" y="80">Guano</text>
        <text fill="#8d9b8d" fontSize="10" fontWeight="600" x="220" y="170">Lican</text>
        <text fill="#8d9b8d" fontSize="10" fontWeight="600" x="440" y="240">Parque Lineal Chibunga</text>
        <text fill="#8d9b8d" fontSize="10" fontWeight="600" x="240" y="380">Cacha</text>
        <text fill="#697669" fontSize="11" fontWeight="700" x="450" y="420">Chambo</text>
      </svg>

      {/* Store marker */}
      <div className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="px-3.5 py-1.5 bg-[#241a0d] text-white text-xs font-headline font-bold rounded-lg shadow-xl flex items-center gap-2 border border-white/20 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fcbf00] animate-ping" />
          {marker}
        </div>
        <div className="w-3.5 h-3.5 bg-[#241a0d] rotate-45 -mt-1.5 shadow-md" />
      </div>
    </div>
  )
}
