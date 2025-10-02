import { Document, ImageRun, Packer, Paragraph } from "docx"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"

function dataURLtoArrayBuffer(dataURL: string) {
  const byteString = atob(dataURL.split(",")[1] || "")
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return ab
}

export async function exportReportAsPDF(containerId: string, filename = "report.pdf") {
  const node = document.getElementById(containerId)
  if (!node) return
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = dataUrl
  await img.decode()

  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const ratio = Math.min(pageWidth / img.width, pageHeight / img.height)
  const imgWidth = img.width * ratio
  const imgHeight = img.height * ratio
  const x = (pageWidth - imgWidth) / 2
  const y = (pageHeight - imgHeight) / 2

  pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight)
  pdf.save(filename)
}

export async function exportReportAsDOCX(containerId: string, filename = "report.docx") {
  const node = document.getElementById(containerId)
  if (!node) return
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })

  const imageBuffer = dataURLtoArrayBuffer(dataUrl)
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: { width: 600, height: 800 },
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
