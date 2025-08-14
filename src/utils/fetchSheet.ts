// Google Sheets API integration with multiple authentication methods
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const SERVICE_ACCOUNT_EMAIL = import.meta.env.VITE_SERVICE_ACCOUNT_EMAIL;

interface SheetData {
  [key: string]: any;
}

export async function fetchSheetData(sheetName: string): Promise<SheetData[]> {
  if (!SPREADSHEET_ID) {
    console.warn('Spreadsheet ID not configured. Using mock data.');
    return getMockData(sheetName);
  }

  // Try service account first (more secure), then fall back to API key
  if (SERVICE_ACCOUNT_EMAIL) {
    try {
      return await fetchWithServiceAccount(sheetName);
    } catch (error) {
      console.warn('Service account failed, trying API key...', error);
    }
  }

  if (GOOGLE_SHEETS_API_KEY) {
    try {
      return await fetchWithApiKey(sheetName);
    } catch (error) {
      console.error('API key also failed:', error);
    }
  }

  console.log('Falling back to mock data...');
  return getMockData(sheetName);
}

async function fetchWithServiceAccount(sheetName: string): Promise<SheetData[]> {
  // This would require a backend server to handle service account authentication
  // For now, we'll use the API key method but log that service account is preferred
  console.log('Service account authentication preferred but not implemented in frontend');
  throw new Error('Service account requires backend implementation');
}

async function fetchWithApiKey(sheetName: string): Promise<SheetData[]> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_SHEETS_API_KEY}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HTTP error! status: ${response.status}, message: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.values || data.values.length === 0) {
    console.warn(`No data found in sheet: ${sheetName}`);
    return [];
  }

  // Convert array of arrays to array of objects
  const headers = data.values[0];
  const rows = data.values.slice(1);
  
  return rows.map((row: any[]) => {
    const obj: SheetData = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Fallback mock data when Google Sheets is not configured
function getMockData(sheetName: string): SheetData[] {
  const mockData = {
    "Net Sale": [
      { "Gross Sale": "12500", "Net Income": "11250", "Date": "2024-01-01" },
      { "Gross Sale": "13800", "Net Income": "12420", "Date": "2024-01-02" },
      { "Gross Sale": "15200", "Net Income": "13680", "Date": "2024-01-03" },
      { "Gross Sale": "11800", "Net Income": "10620", "Date": "2024-01-04" },
      { "Gross Sale": "14500", "Net Income": "13050", "Date": "2024-01-05" },
    ],
    "Expenses": [
      { "Amount": "3200", "Category": "Ingredients", "Date": "2024-01-01" },
      { "Amount": "1800", "Category": "Utilities", "Date": "2024-01-01" },
      { "Amount": "1200", "Category": "Rent", "Date": "2024-01-01" },
      { "Amount": "800", "Category": "Marketing", "Date": "2024-01-01" },
      { "Amount": "600", "Category": "Miscellaneous", "Date": "2024-01-01" },
    ],
    "Salaries": [
      { "Amount": "4500", "Employee": "Chef", "Date": "2024-01-01" },
      { "Amount": "3200", "Employee": "Server 1", "Date": "2024-01-01" },
      { "Amount": "3200", "Employee": "Server 2", "Date": "2024-01-01" },
      { "Amount": "2800", "Employee": "Cashier", "Date": "2024-01-01" },
      { "Amount": "2400", "Employee": "Cleaner", "Date": "2024-01-01" },
    ],
  };

  return mockData[sheetName as keyof typeof mockData] || [];
}

// Helper function to get all available sheets
export async function getAvailableSheets(): Promise<string[]> {
  if (!SPREADSHEET_ID) {
    return ["Net Sale", "Expenses", "Salaries"];
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${GOOGLE_SHEETS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sheets?.map((sheet: any) => sheet.properties.title) || [];
  } catch (error) {
    console.error(`Error fetching sheet names: ${error}`);
    return ["Net Sale", "Expenses", "Salaries"];
  }
}
