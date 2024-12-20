import { google } from "googleapis";

// The ID of your spreadsheet (can be found in the URL of your spreadsheet)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME; // Change "Sheet1" to your target sheet name

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

export async function sendDataToSpreadsheet({
  startDateTime,
  endDateTime,
}: {
  startDateTime: string;
  endDateTime: string;
}) {
  try {
    // Create a client for the Sheets API
    const sheets = google.sheets({
      version: "v4",
      auth: await getAuthClient(),
    });

    // Define the row data to append
    const values = [[startDateTime, endDateTime]];

    // Append the row
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
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
}
