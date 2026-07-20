// ---------------------------------------------------------------------------
// src/components/boletos/pdfBuilder.ts
//
// Escritor de PDF minimo, SEM dependencias externas.
//
// Por que nao usar uma lib (jsPDF/pdf-lib)? O projeto nao a tem instalada e
// adiciona-la quebraria o build ate um `npm install`. Um boleto precisa apenas
// de texto (Helvetica) e retangulos pretos (barras/linhas) — que sao triviais
// de emitir em PDF puro. Assim o build permanece verde e sem dependencias.
//
// Coordenadas expostas usam origem no TOPO-esquerda (mais intuitivo); a classe
// converte para o sistema do PDF (origem embaixo-esquerda) internamente.
// ---------------------------------------------------------------------------

interface TextOpts {
  bold?: boolean;
  /** 0 = preto, 1 = branco. Ex: 0.4 para rotulo cinza. */
  gray?: number;
  /** Alinhamento aproximado a direita a partir de x (largura estimada). */
  align?: 'left' | 'right';
}

/** Larguras medias dos glifos Helvetica (fracao do tamanho da fonte). */
const AVG_CHAR_WIDTH = 0.5;

function estimateTextWidth(text: string, size: number): number {
  return text.length * size * AVG_CHAR_WIDTH;
}

/** Remove acentos e caracteres nao-ASCII (Helvetica base nao os cobre com seguranca). */
function asciiFold(text: string): string {
  return text
    .normalize('NFD') // separa acentos em marcas combinantes (> 0x7e)
    .replace(/[^\x20-\x7e]/g, ''); // remove marcas combinantes e nao-ASCII
}

function escapePdfText(text: string): string {
  return asciiFold(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export class PdfDoc {
  readonly width: number;
  readonly height: number;
  private ops: string[] = ['0 g'];

  constructor(width = 595, height = 842) {
    this.width = width;
    this.height = height;
  }

  /** Texto com origem TOPO-esquerda (y cresce para baixo). */
  text(x: number, yTop: number, size: number, str: string, opts: TextOpts = {}): void {
    const font = opts.bold ? '/F2' : '/F1';
    const gray = opts.gray ?? 0;
    let px = x;
    if (opts.align === 'right') px = x - estimateTextWidth(asciiFold(str), size);
    const yPdf = this.height - yTop;
    if (gray !== 0) this.ops.push(`${gray} g`);
    this.ops.push(`BT ${font} ${size} Tf ${fmt(px)} ${fmt(yPdf)} Td (${escapePdfText(str)}) Tj ET`);
    if (gray !== 0) this.ops.push('0 g');
  }

  /** Retangulo preenchido (preto por padrao). Origem TOPO-esquerda. */
  rect(x: number, yTop: number, w: number, h: number, gray = 0): void {
    const yBottom = this.height - (yTop + h);
    if (gray !== 0) this.ops.push(`${gray} g`);
    this.ops.push(`${fmt(x)} ${fmt(yBottom)} ${fmt(w)} ${fmt(h)} re f`);
    if (gray !== 0) this.ops.push('0 g');
  }

  /** Linha horizontal fina. */
  hline(x: number, yTop: number, w: number, thickness = 0.8, gray = 0): void {
    this.rect(x, yTop, w, thickness, gray);
  }

  /** Serializa o documento em bytes de um PDF valido. */
  toBytes(): Uint8Array {
    const content = this.ops.join('\n');
    const objects: string[] = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] ` +
        '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    objects.forEach((body, i) => {
      offsets.push(pdf.length);
      pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.forEach((off) => {
      pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefStart}\n%%EOF`;

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
    return bytes;
  }
}

/** Formata numero para o stream (evita notacao cientifica / excesso de casas). */
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
