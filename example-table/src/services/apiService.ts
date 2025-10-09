import axios from 'axios';

// Define the base API URL
const apiBaseUrl = 'http://127.0.0.1:8000/api';

// Define the Visitor and Employee interfaces
export interface Visitor {
  visitor_id: string;
  visitor_date: string;
  visitor_name: string;
  visitor_from: string;
  visitor_host: string;
  visitor_needs: string;
  visitor_amount: number;
  visitor_vehicle: string;
  department: string;
  visitor_checkin: string;
  visitor_checkout: string | null;
}

export interface Employee {
  name: string;
  nik: string;
  email: string;
  department: string;
  phone_number: string;
}

export interface Supplier {
  value: string;
  label: string;
  code: string;
  name: string;
  address: string;
  phone: string;
}

// Visitor API functions
export const fetchVisitorData = async (): Promise<Visitor[]> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/visitor`);
    return (response.data as { data: Visitor[] }).data;
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    return [];
  } 
};

export const submitVisitorData = async (
  visitor: Omit<Visitor, 'visitor_id' | 'visitor_checkin' | 'visitor_checkout'>
): Promise<string> => {
  try {
    const response = await axios.post(`${apiBaseUrl}/create`, visitor);
    // Access the visitor ID from response.data.data.visitor_id
    const responseData = response.data as { data: { visitor_id: string } };
    console.log('Visitor ID:', responseData.data.visitor_id); 
    return responseData.data.visitor_id;
  } catch (error) {
    console.error('Error submitting visitor data:', error);
    throw error;
  }
};

export const checkOutVisitor = async (visitorId: string): Promise<void> => {
  try {
    await axios.put(`${apiBaseUrl}/checkout/${visitorId}`);
  } catch (error) {
    console.error('Error checking out visitor:', error);
    throw error;
  }
};

export const allVisitor = async (): Promise<Visitor[]> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/index`);
    const responseData = response.data as { data: Visitor[] };
    return responseData.data;
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    throw error;
  }
};

export const getVisitorPrintData = async (visitorId: string): Promise<Visitor> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/print-data/${visitorId}`);
    return (response.data as { data: Visitor }).data;
  } catch (error) {
    console.error('Error fetching visitor print data:', error);
    throw error;
  }
};

// Employee API functions
export const fetchEmployeeData = async (): Promise<Employee[]> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/employee`);
    return (response.data as { data: Employee[] }).data;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return [];
  }
};

export const submitEmployeeData = async (employee: Employee): Promise<void> => {
  try {
    await axios.post(`${apiBaseUrl}/createemployee`, employee);
  } catch (error) {
    console.error('Error submitting employee data:', error);
    throw error;
  }
};

export const editEmployeeData = async (nik: string): Promise<Employee> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/edit/${nik}`);
    return (response.data as { data: Employee }).data;
  } catch (error) {
    console.error('Error fetching employee data for editing:', error);
    throw error;
  }
};

export const updateEmployeeData = async (
  nik: string,
  data: Pick<Employee, 'phone_number' | 'department' | 'email'>
): Promise<void> => {
  try {
    await axios.put(`${apiBaseUrl}/update/${nik}`, data);
  } catch (error) {
    console.error('Error updating employee data:', error);
    throw error;
  }
};

export const deleteEmployeeData = async (nik: string): Promise<void> => {
  try {
    await axios.delete(`${apiBaseUrl}/delete/${nik}`);
  } catch (error) {
    console.error('Error deleting employee data:', error);
    throw error;
  }
};

// Supplier API functions
export const fetchSupplierData = async (): Promise<Supplier[]> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/supplier/`);
    return (response.data as { data: Supplier[] }).data;
  } catch (error) {
    console.error('Error fetching supplier data:', error);
    return [];
  }
};

export const getSupplierByCode = async (bpCode: string): Promise<Supplier | null> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/supplier/${bpCode}`);
    return (response.data as { data: Supplier }).data;
  } catch (error) {
    console.error('Error fetching supplier by code:', error);
    return null;
  }
};

export const searchSuppliers = async (searchTerm: string, limit: number = 50): Promise<Supplier[]> => {
  try {
    const response = await axios.get(`${apiBaseUrl}/supplier/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`);
    return (response.data as { data: Supplier[] }).data;
  } catch (error) {
    console.error('Error searching suppliers:', error);
    return [];
  }
};
