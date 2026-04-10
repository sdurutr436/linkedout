import { google } from "googleapis";

let _auth: InstanceType<typeof google.auth.JWT> | null | undefined;
function getAuth() {
  if (_auth !== undefined) return _auth;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

  _auth = email && key
    ? new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] })
    : null;

  return _auth;
}

let _headersEnsured = false;

export interface SheetRow {
  company: string;
  platform: string;
  date: string;
  time: string;
  contactPerson: string;
  companySummary: string;
  position: string;
  salary: string;
  status: string;
}

const HEADERS = [
  "Empresa",
  "Plataforma",
  "Fecha",
  "Hora",
  "Persona de contacto",
  "Resumen empresa",
  "Puesto",
  "Salario",
  "Estado",
];

export async function ensureHeaders(spreadsheetId: string): Promise<void> {
  const auth = getAuth();
  if (!auth) return;

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A1:I1",
  });

  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A1:I1",
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendRow(spreadsheetId: string, row: SheetRow): Promise<void> {
  const auth = getAuth();
  if (!auth) return;

  const sheets = google.sheets({ version: "v4", auth });

  if (!_headersEnsured) {
    await ensureHeaders(spreadsheetId);
    _headersEnsured = true;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A:I",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          row.company,
          row.platform,
          row.date,
          row.time,
          row.contactPerson,
          row.companySummary,
          row.position,
          row.salary,
          row.status,
        ],
      ],
    },
  });
}

export async function updateStatus(
  spreadsheetId: string,
  rowIndex: number,
  status: string
): Promise<void> {
  const auth = getAuth();
  if (!auth) return;

  const sheets = google.sheets({ version: "v4", auth });

  // rowIndex is 0-based (data rows), +2 for header row and 1-based indexing
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `I${rowIndex + 2}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}
