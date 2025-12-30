import { supabase } from '../lib/supabase';

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj?.map(item => toCamelCase(item));
  }
  
  const camelObj = {};
  Object.keys(obj)?.forEach(key => {
    const camelKey = key?.replace(/_([a-z])/g, (_, letter) => letter?.toUpperCase());
    camelObj[camelKey] = typeof obj?.[key] === 'object' ? toCamelCase(obj?.[key]) : obj?.[key];
  });
  return camelObj;
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj?.map(item => toSnakeCase(item));
  }
  
  const snakeObj = {};
  Object.keys(obj)?.forEach(key => {
    const snakeKey = key?.replace(/[A-Z]/g, letter => `_${letter?.toLowerCase()}`);
    snakeObj[snakeKey] = typeof obj?.[key] === 'object' ? toSnakeCase(obj?.[key]) : obj?.[key];
  });
  return snakeObj;
};

export const dataImportService = {
  // Upload file to storage
  async uploadFile(file, userId) {
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}-${file?.name}`;
    
    const { data, error } = await supabase?.storage?.from('data-imports')?.upload(filePath, file);
    
    if (error) throw error;
    return data?.path;
  },

  // Create import record
  async createImport(importData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const snakeData = toSnakeCase({
      ...importData,
      userId: user?.id
    });
    
    const { data, error } = await supabase?.from('data_imports')?.insert(snakeData)?.select()?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  // Get all imports for user
  async getUserImports() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase?.from('data_imports')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data);
  },

  // Update import status
  async updateImportStatus(importId, status, updateData = {}) {
    const snakeData = toSnakeCase({
      status,
      ...updateData
    });
    
    const { data, error } = await supabase?.from('data_imports')?.update(snakeData)?.eq('id', importId)?.select()?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  // Bulk create clients
  async bulkCreateClients(clientsData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const clientsWithUser = clientsData?.map(client => ({
      ...toSnakeCase(client),
      user_id: user?.id
    }));
    
    const { data, error } = await supabase?.from('clients')?.insert(clientsWithUser)?.select();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  // Bulk create invoices
  async bulkCreateInvoices(invoicesData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const invoicesWithUser = invoicesData?.map(invoice => ({
      ...toSnakeCase(invoice),
      user_id: user?.id
    }));
    
    const { data, error } = await supabase?.from('invoices')?.insert(invoicesWithUser)?.select();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  // Bulk create expenses (using existing financial_transactions)
  async bulkCreateExpenses(expensesData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const expensesWithUser = expensesData?.map(expense => ({
      ...toSnakeCase(expense),
      user_id: user?.id,
      transaction_type: 'expense'
    }));
    
    const { data, error } = await supabase?.from('financial_transactions')?.insert(expensesWithUser)?.select();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  // Get signed URL for downloaded file
  async getFileUrl(filePath) {
    const { data, error } = await supabase?.storage?.from('data-imports')?.createSignedUrl(filePath, 3600);
    
    if (error) throw error;
    return data?.signedUrl;
  },

  // Delete import file
  async deleteFile(filePath) {
    const { error } = await supabase?.storage?.from('data-imports')?.remove([filePath]);
    
    if (error) throw error;
  }
};