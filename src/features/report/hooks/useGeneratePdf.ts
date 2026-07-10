// src/features/report/hooks/useGeneratePdf.ts
import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function useGeneratePdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const generatePdf = useCallback(
    async (filename = 'relatorio-financeiro.pdf') => {
      const el = printRef.current;
      if (!el) return;

      setIsGenerating(true);

      try {
        // Aguarda recharts renderizar os SVGs no DOM offscreen
        await new Promise((r) => setTimeout(r, 800));

        const canvas = await html2canvas(el, {
          scale: 2, // retina
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth();  // 210 mm
        const pdfH = pdf.internal.pageSize.getHeight(); // 297 mm

        // Escala: largura do canvas → largura do PDF
        const ratio = pdfW / canvas.width;
        const totalHeight = canvas.height * ratio;

        if (totalHeight <= pdfH) {
          // Cabe em 1 página
          pdf.addImage(imgData, 'PNG', 0, 0, pdfW, totalHeight);
        } else {
          // Multi-páginas — recorta o canvas em fatias
          let remaining = totalHeight;
          let srcY = 0;
          let firstPage = true;

          while (remaining > 0) {
            if (!firstPage) pdf.addPage();
            firstPage = false;

            const pageHeight = Math.min(pdfH, remaining);
            const sliceH = pageHeight / ratio;

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceH;
            const ctx = sliceCanvas.getContext('2d')!;
            ctx.drawImage(
              canvas,
              0, srcY, canvas.width, sliceH,
              0, 0, canvas.width, sliceH,
            );

            const pageImg = sliceCanvas.toDataURL('image/png');
            pdf.addImage(pageImg, 'PNG', 0, 0, pdfW, pageHeight);

            srcY += sliceH;
            remaining -= pageHeight;
          }
        }

        pdf.save(filename);
      } catch (err) {
        console.error('[useGeneratePdf]', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { printRef, generatePdf, isGenerating };
}