const ICON: Record<string, string> = {
  website: "M3 4h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm6 16h6v1.6H9z",
  house: "M12 3 2.5 11H5v10h5v-6h4v6h5V11h2.5z",
  doc: "M6 2h9l5 5v14.2A.8.8 0 0 1 19.2 22H6a.8.8 0 0 1-.8-.8V2.8A.8.8 0 0 1 6 2Zm2 9h8v1.8H8zm0 4h8v1.8H8z",
  search: "M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z",
  pin: "M12 2c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z",
  share: "M18 15.9a3 3 0 0 0-2.4 1.2l-6-3.1a3 3 0 0 0 0-2.2l6-3.1A3 3 0 1 0 15 6l-6 3.1a3 3 0 1 0 0 5.8l6 3.1A3 3 0 1 0 18 15.9Z",
  star: "m12 2 2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.7 6.1 20.6l1.3-6.6L2.5 8.9l6.6-.8z",
};

const CENTERS: { k: string; c: string; icon: string; d: string }[] = [
  { k: "Website", c: "--c-crown", icon: "website", d: "Rumah digital Anda — satu situs profesional tempat calon pembeli mengenal dan mempercayai Anda." },
  { k: "Listing", c: "--c-eye", icon: "house", d: "Semua properti Anda tertata rapi; tiap unit punya halaman & skornya sendiri agar mudah ditemukan." },
  { k: "Konten", c: "--c-throat", icon: "doc", d: "Artikel & video yang membuat Anda relevan dan sering muncul saat orang mencari." },
  { k: "SEO", c: "--c-heart", icon: "search", d: "Seberapa mudah Anda muncul di Google saat calon pembeli mengetik pencarian." },
  { k: "GEO", c: "--c-solar", icon: "pin", d: "Kehadiran di mesin pencari AI (seperti ChatGPT & Google AI) — muncul saat AI menjawab “agen properti di area ini”." },
  { k: "Social", c: "--c-sacral", icon: "share", d: "Jangkauan dan interaksi Anda di media sosial — Instagram, TikTok, Facebook." },
  { k: "Reputasi", c: "--c-root", icon: "star", d: "Kepercayaan yang Anda bangun dari waktu ke waktu — ulasan, konsistensi, dan rekam jejak." },
];

export function CenterPills() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {CENTERS.map((c) => (
        <button key={c.k} className="cpill" type="button" aria-label={`${c.k}: ${c.d}`}>
          <span className="cpill-ic" style={{ color: `var(${c.c})` }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d={ICON[c.icon]} />
            </svg>
          </span>
          {c.k}
          <span className="cpill-tip" role="tooltip">{c.d}</span>
        </button>
      ))}
      <style>{`
        .cpill{ position:relative; display:inline-flex; align-items:center; gap:8px; font:inherit; font-size:.9rem;
          padding:.42rem .9rem .42rem .55rem; border-radius:999px; border:1px solid var(--line-2);
          background:var(--surface); color:var(--ink); cursor:default; transition:border-color .15s, transform .15s; }
        .cpill:hover, .cpill:focus-visible{ border-color:var(--brand); transform:translateY(-1px); outline:none; }
        .cpill-ic{ display:inline-grid; place-items:center; width:24px; height:24px; border-radius:50%;
          background:color-mix(in oklab, currentColor 14%, var(--surface)); }
        .cpill-tip{ position:absolute; bottom:calc(100% + 12px); left:50%; transform:translateX(-50%) translateY(4px);
          width:250px; max-width:78vw; background:var(--ink); color:var(--bg); font-size:.82rem; line-height:1.45;
          text-align:left; padding:11px 13px; border-radius:12px; box-shadow:var(--shadow); z-index:20;
          opacity:0; visibility:hidden; transition:opacity .16s, transform .16s; pointer-events:none; }
        .cpill-tip::after{ content:""; position:absolute; top:100%; left:50%; transform:translateX(-50%);
          border:7px solid transparent; border-top-color:var(--ink); }
        .cpill:hover .cpill-tip, .cpill:focus-visible .cpill-tip{ opacity:1; visibility:visible; transform:translateX(-50%) translateY(0); }
      `}</style>
    </div>
  );
}
