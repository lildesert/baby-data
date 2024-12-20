import { google } from "googleapis";

// The ID of your spreadsheet (can be found in the URL of your spreadsheet)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const FOOD_SHEET_NAME = process.env.FOOD_SHEET_NAME;
const WC_SHEET_NAME = process.env.WC_SHEET_NAME;

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

export async function sendFoodDataToSpreadsheet({
  startDateTime,
  endDateTime,
}: {
  startDateTime: string;
  endDateTime: string;
}) {
  const values = [[startDateTime, endDateTime]];
  await sendDataToSpreadsheet({
    sheetName: FOOD_SHEET_NAME,
    values,
  });
}

export async function sendWCDataToSpreadsheet({
  startDateTime,
  hasPeed,
  hasPooped,
}: {
  startDateTime: string;
  hasPeed: boolean;
  hasPooped: boolean;
}) {
  const values = [
    [startDateTime, formatBoolean(hasPeed), formatBoolean(hasPooped)],
  ];
  await sendDataToSpreadsheet({
    sheetName: WC_SHEET_NAME,
    values,
  });
}

const formatBoolean = (value: boolean) => (value ? "Oui" : "Non");

const sendDataToSpreadsheet = async ({
  sheetName,
  values,
}: {
  sheetName: string | undefined;
  values: string[][];
}) => {
  try {
    // Create a client for the Sheets API
    const sheets = google.sheets({
      version: "v4",
      auth: await getAuthClient(),
    });

    // Append the row
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: values,
      },
    });

    console.log("Row appended:", response.data);
  } catch (error) {
    console.error("Error appending row:", error);
  }
};
