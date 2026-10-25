/* eslint-disable */
// Extracts plain text from an uploaded pitch deck (PDF or PPTX) so it can be passed to the
// report engine alongside the four answers. Text only: images and charts are not read.
import { extractText, getDocumentProxy } from 'unpdf';
import JSZip from 'jszip';

export const MAX_DECK_CHARS = 15000;

const decodeXml = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

async function pdfText(buf: Uint8Array) {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return String(text || '');
}

async function pptxText(buf: Uint8Array) {
  const zip = await JSZip.loadAsync(buf);
  const slides = Object.keys(zip.files)
    .map(name => ({ name, n: Number((name.match(/^ppt\/slides\/slide(\d+)\.xml$/) || [])[1]) }))
    .filter(f => f.n)
    .sort((a, b) => a.n - b.n);
  const parts: string[] = [];
  for (const f of slides) {
    const xml = await zip.files[f.name].async('string');
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m => decodeXml(m[1]).trim()).filter(Boolean);
    if (runs.length) parts.push(`Slide ${f.n}: ${runs.join(' ')}`);
  }
  return parts.join('\n');
}

export async function extractDeckText(buf: Uint8Array, fileName: string): Promise<string> {
  const raw = /\.pdf$/i.test(fileName) ? await pdfText(buf) : /\.pptx$/i.test(fileName) ? await pptxText(buf) : '';
  return raw.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_DECK_CHARS);
}
