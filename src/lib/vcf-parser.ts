// src/lib/vcf-parser.ts
// VCF vCard parser — suporta vCard 2.1 e 3.0, quoted-printable, linhas quebradas

export interface ParsedContact {
  name: string | null
  phone: string | null
  email: string | null
}

/**
 * Decodifica quoted-printable para UTF-8.
 * Formato usado pelo vCard 2.1 para acentos e caracteres especiais.
 * Ex: =52=61=C3=A7=C3=A3=6F → "Ração"
 */
function decodeQuotedPrintable(input: string): string {
  // Remove soft line breaks (=\n ou =\r\n)
  const unwrapped = input.replace(/=\r?\n/g, '')

  // Converte para bytes
  const bytes: number[] = []
  let i = 0
  while (i < unwrapped.length) {
    if (unwrapped[i] === '=' && i + 2 < unwrapped.length) {
      const hex = unwrapped.slice(i + 1, i + 3)
      if (/^[\da-fA-F]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16))
        i += 3
        continue
      }
    }
    bytes.push(unwrapped.charCodeAt(i))
    i++
  }

  // Interpreta os bytes como UTF-8
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
  } catch {
    // Fallback Latin-1 caso algum byte não seja UTF-8 válido
    return bytes.map((b) => String.fromCharCode(b)).join('')
  }
}

/**
 * Pré-processa o conteúdo bruto do .vcf:
 * - Remove soft breaks (=\n ou =\r\n) — usados no vCard 2.1
 * - Unfold linhas continuadas (começam com espaço ou tab)
 */
function preprocessVcf(content: string): string {
  let result = content.replace(/=\r?\n/g, '')
  result = result.replace(/\r?\n[ \t]/g, '')
  return result
}

/**
 * Extrai nome (FN), telefone (TEL com preferência CELL) e email de um bloco vCard.
 */
function parseVcardBlock(block: string): ParsedContact {
  /* ─── FN (nome completo) ─── */
  const fnLine = block.match(/^FN(?:[^:]*):(.+)/im)
  let name: string | null = null

  if (fnLine) {
    const rawValue = fnLine[1]!.trim()
    const isQp = /ENCODING=QUOTED-PRINTABLE/i.test(fnLine[0]!)
    name = isQp ? decodeQuotedPrintable(rawValue).trim() : rawValue
  }

  /* ─── TEL (telefone) - prefere CELL ─── */
  const telLines = block.match(/^(?:item\d+\.)?TEL[^:]*:.+$/gim)
  let phone: string | null = null

  if (telLines) {
    for (const line of telLines) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) continue
      const value = line.slice(colonIdx + 1).trim()
      if (!value) continue

      const header = line.slice(0, colonIdx) // ex: "TEL;CELL;PREF" ou "TEL;X-Celular"
      const params = header.includes(';') ? header.slice(header.indexOf(';')) : ''
      const isCellular = /CELL/i.test(params) || /celular/i.test(params)

      if (isCellular && !phone) {
        phone = value
      }
      if (!phone) {
        phone = value // fallback: qualquer telefone
      }
    }
  }

  /* ─── EMAIL ─── */
  const emailMatch = block.match(/^(?:item\d+\.)?EMAIL(?:[^:]*):(.+)/im)
  const email = emailMatch?.[1]?.trim()?.toLowerCase() ?? null

  return { name, phone, email }
}

/**
 * Parseia o conteúdo completo de um arquivo .vcf e retorna todos os contatos.
 * Suporta vCard 2.1 e 3.0, quoted-printable, múltiplos telefones,
 * linhas quebradas e carrier codes.
 */
export function parseVcfContacts(content: string): ParsedContact[] {
  const processed = preprocessVcf(content)
  const blocks = processed.match(/BEGIN:VCARD[\s\S]*?END:VCARD/g)
  if (!blocks) return []

  return blocks.map(parseVcardBlock)
}