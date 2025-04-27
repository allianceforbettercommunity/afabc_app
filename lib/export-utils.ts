import { createClient } from '@/lib/supabase/client';

// Generic function to convert an array of objects to CSV
export function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers from first item
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const item of data) {
    const values = headers.map(header => {
      const value = item[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } 
      
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = value.replace(/"/g, '""');
        return /[,\n\r"]/.test(value) ? `"${escaped}"` : escaped;
      }
      
      return value;
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Function to download CSV
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export database table to CSV
export async function exportTable(tableName: string) {
  const supabase = createClient();
  const currentDate = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
      
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.warn(`No data found in ${tableName}`);
      return false;
    }
    
    const csv = convertToCSV(data);
    const filename = `${tableName}_${currentDate}.csv`;
    downloadCSV(csv, filename);
    
    return true;
  } catch (err) {
    console.error(`Error exporting ${tableName}:`, err);
    return false;
  }
}

// Export all data as separate CSVs
export async function exportAllData() {
  // Tables to export
  const tables = ['parents', 'issues', 'programs', 'sessions', 'attendance'];
  
  // Export each table
  for (const table of tables) {
    await exportTable(table);
  }
  
  return true;
} 