// Controller Area Network (CAN) frame decoder for the /lab/can instrument.
//
// CAN is the bus that carries the messages between a car's electronic control
// units — and it was designed with no authentication and no encryption, which
// is exactly why it's the target surface in my adversarial-IDS research. This
// decoder takes a raw frame (candump `ID#DATA` or space-separated hex) and
// breaks out its structure: arbitration ID, standard vs extended, RTR, DLC and
// a per-byte view. No semantics are invented — decoding payload meaning needs a
// vehicle-specific DBC — so it shows the wire structure, honestly.

export interface CanByte {
  hex: string;
  dec: number;
  bin: string;
  ascii: string;
}

export interface CanFrame {
  raw: string;
  idHex: string;
  idDec: number;
  idBits: string;
  extended: boolean;
  rtr: boolean;
  dlc: number;
  bytes: CanByte[];
  /** Lower arbitration ID wins bus arbitration → higher priority. */
  priorityNote: string;
  error?: string;
}

const STD_MASK = 0x7ff; // 11-bit
const EXT_MASK = 0x1fffffff; // 29-bit

function byteView(n: number): CanByte {
  const printable = n >= 0x20 && n <= 0x7e;
  return {
    hex: n.toString(16).toUpperCase().padStart(2, '0'),
    dec: n,
    bin: n.toString(2).padStart(8, '0'),
    ascii: printable ? String.fromCharCode(n) : '·',
  };
}

function hexToBytes(s: string): number[] | null {
  const clean = s.replace(/[^0-9a-f]/gi, '');
  if (clean.length === 0) return [];
  if (clean.length % 2 !== 0) return null;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 2) out.push(parseInt(clean.slice(i, i + 2), 16));
  return out;
}

export function decodeCanFrame(line: string): CanFrame | null {
  const raw = line.trim();
  if (!raw) return null;

  let idPart = '';
  let dataPart = '';
  let rtr = false;
  let explicitDlc: number | null = null;

  if (raw.includes('#')) {
    // candump format: 123#DEADBEEF, 18DAF110#02 03, 123#R (remote frame)
    const [id, ...rest] = raw.split('#');
    idPart = id.trim();
    const body = rest.join('#').trim();
    if (/^r/i.test(body)) {
      rtr = true;
      const n = body.slice(1).replace(/[^0-9]/g, '');
      explicitDlc = n ? parseInt(n, 10) : 0;
    } else {
      dataPart = body;
    }
  } else {
    // Space-separated: strip interface names and [dlc] brackets, keep hex.
    const bracket = raw.match(/\[(\d+)\]/);
    if (bracket) explicitDlc = parseInt(bracket[1], 10);
    const tokens = raw
      .replace(/\[(\d+)\]/g, ' ')
      .split(/\s+/)
      .filter((t) => /^[0-9a-fx]+$/i.test(t) && /[0-9a-f]/i.test(t))
      .map((t) => t.replace(/^0x/i, ''));
    if (tokens.length === 0) return { ...emptyFrame(raw), error: 'No CAN ID found.' };
    idPart = tokens[0];
    dataPart = tokens.slice(1).join('');
  }

  const idDec = parseInt(idPart, 16);
  if (isNaN(idDec)) return { ...emptyFrame(raw), error: `“${idPart}” is not a valid hex CAN ID.` };

  const extended = idPart.replace(/^0x/i, '').length > 3 || idDec > STD_MASK;
  const mask = extended ? EXT_MASK : STD_MASK;
  if (idDec > mask) {
    return {
      ...emptyFrame(raw),
      error: `ID 0x${idDec.toString(16).toUpperCase()} exceeds the ${extended ? '29' : '11'}-bit arbitration field.`,
    };
  }

  const bytes = rtr ? [] : hexToBytes(dataPart);
  if (bytes === null) return { ...emptyFrame(raw), error: 'Data field has an odd number of hex digits.' };
  if (bytes && bytes.length > 8) {
    return { ...emptyFrame(raw), error: 'Classic CAN carries at most 8 data bytes (got ' + bytes.length + ').' };
  }

  const dlc = rtr ? explicitDlc ?? 0 : bytes!.length;
  const idBitsLen = extended ? 29 : 11;

  return {
    raw,
    idHex: '0x' + idDec.toString(16).toUpperCase(),
    idDec,
    idBits: idDec.toString(2).padStart(idBitsLen, '0'),
    extended,
    rtr,
    dlc,
    bytes: (bytes ?? []).map(byteView),
    priorityNote:
      idDec <= 0x0ff
        ? 'very high bus priority'
        : idDec <= STD_MASK / 2
        ? 'high bus priority'
        : 'lower bus priority',
  };
}

function emptyFrame(raw: string): CanFrame {
  return {
    raw,
    idHex: '',
    idDec: 0,
    idBits: '',
    extended: false,
    rtr: false,
    dlc: 0,
    bytes: [],
    priorityNote: '',
  };
}

export function decodeCanCapture(text: string): CanFrame[] {
  return text
    .split(/\r?\n/)
    .map((l) => decodeCanFrame(l))
    .filter((f): f is CanFrame => f !== null);
}
