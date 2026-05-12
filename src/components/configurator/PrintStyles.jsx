/**
 * PrintStyles — Injects @media print CSS so window.print() renders
 * the same professional layout as the generated PDF.
 */
export default function PrintStyles() {
  return (
    <style>{`
      @media print {
        /* Hide everything except the summary content */
        body > * { display: none !important; }
        #print-summary { display: block !important; }

        /* Reset page */
        @page {
          size: A4 portrait;
          margin: 16mm 16mm 20mm 16mm;
        }

        body {
          background: #fdf9f4 !important;
          color: #2d1e0f !important;
          font-family: Helvetica, Arial, sans-serif !important;
          font-size: 10pt !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* ── Header ── */
        .print-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 2px solid #d28232 !important;
          padding-bottom: 8px !important;
          margin-bottom: 16px !important;
        }
        .print-logo { height: 40px !important; object-fit: contain !important; }
        .print-header-right { text-align: right !important; font-size: 8pt !important; color: #a58c73 !important; }

        /* ── Title ── */
        .print-title {
          text-align: center !important;
          margin-bottom: 14px !important;
        }
        .print-title h1 {
          font-size: 22pt !important;
          font-weight: bold !important;
          color: #b45309 !important;
          margin: 0 !important;
        }
        .print-title p {
          font-size: 10pt !important;
          color: #6e5540 !important;
          margin: 2px 0 0 !important;
        }
        .print-title-line {
          width: 56mm !important;
          height: 0.6mm !important;
          background: #d28232 !important;
          margin: 6px auto 0 !important;
        }

        /* ── Metric cards row ── */
        .print-metrics {
          display: flex !important;
          gap: 4mm !important;
          margin-bottom: 14px !important;
        }
        .print-metric-card {
          flex: 1 !important;
          background: #f7f1e9 !important;
          border: 0.3mm solid #dcd9bb !important;
          border-radius: 3mm !important;
          padding: 4mm !important;
          text-align: center !important;
        }
        .print-metric-label {
          font-size: 6.5pt !important;
          color: #a58c73 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.04em !important;
        }
        .print-metric-value {
          font-size: 10pt !important;
          font-weight: bold !important;
          color: #2d1e0f !important;
          margin-top: 2px !important;
        }

        /* ── Section title ── */
        .print-section-title {
          background: #f7f1e9 !important;
          border: 0.3mm solid #dcd9bb !important;
          border-radius: 2mm !important;
          padding: 2.5mm 4mm !important;
          display: flex !important;
          align-items: center !important;
          margin-bottom: 4mm !important;
          margin-top: 6mm !important;
          page-break-inside: avoid !important;
        }
        .print-section-bar {
          width: 3.5mm !important;
          height: 9mm !important;
          background: #b45309 !important;
          border-radius: 1mm !important;
          margin-right: 3mm !important;
          flex-shrink: 0 !important;
        }
        .print-section-title span {
          font-size: 8.5pt !important;
          font-weight: bold !important;
          color: #b45309 !important;
        }

        /* ── Data rows ── */
        .print-row {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 2mm 4mm !important;
          border-bottom: 0.15mm solid #dcd9bb !important;
          font-size: 8pt !important;
          page-break-inside: avoid !important;
        }
        .print-row.shaded { background: #faf6f0 !important; }
        .print-row-label { color: #6e5540 !important; }
        .print-row-value { font-weight: bold !important; color: #2d1e0f !important; }

        /* ── Total row ── */
        .print-total-row {
          background: #b45309 !important;
          border-radius: 2mm !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 3mm 6mm !important;
          margin-top: 4mm !important;
          page-break-inside: avoid !important;
        }
        .print-total-row span {
          font-size: 11pt !important;
          font-weight: bold !important;
          color: #ffffff !important;
        }

        /* ── Disclaimer ── */
        .print-disclaimer {
          background: #fdf9f4 !important;
          border: 0.3mm solid #dcd9bb !important;
          border-radius: 2mm !important;
          padding: 4mm !important;
          margin-top: 6mm !important;
          font-size: 7pt !important;
          color: #a58c73 !important;
          page-break-inside: avoid !important;
        }

        /* ── Footer ── */
        .print-footer {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          border-top: 0.5mm solid #d28232 !important;
          background: #fdf9f4 !important;
          padding: 3mm 16mm !important;
          display: flex !important;
          justify-content: space-between !important;
          font-size: 6.5pt !important;
          color: #a58c73 !important;
        }

        /* Page break helpers */
        .print-page-break { page-break-before: always !important; }
        .no-break { page-break-inside: avoid !important; }
      }

      /* Hide print area when not printing */
      @media screen {
        #print-summary { display: none !important; }
      }
    `}</style>
  );
}