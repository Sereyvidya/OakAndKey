import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export async function exportFlyerPNG(
  node: HTMLElement,
  { filename }: { filename: string }
) {
  const dataUrl = await toPng(node, {
    backgroundColor: "#ffffff",
    pixelRatio: 3,
  });

  download(dataUrl, `${filename}.png`);
}

export async function exportFlyerPDF(
  node: HTMLElement,
  { filename }: { filename: string }
) {
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  const dataUrl = await toPng(node, {
    backgroundColor: "#ffffff",
    pixelRatio: 3,
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [width, height],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  pdf.save(`${filename}.pdf`);
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
