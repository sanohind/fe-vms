import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitVisitorData, fetchEmployeeData, fetchSupplierData, searchSuppliers, Employee, Supplier } from '../../services/apiService';

interface VisitorData {
  visitor_id?: string;
  visitor_date: string;
  visitor_name: string;
  visitor_from: string;
  visitor_host: string;
  visitor_needs: string;
  visitor_amount: number;
  visitor_vehicle: string;
  department?: string;
}

const CheckInForm: React.FC = () => {
  // Define today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<VisitorData>({
    visitor_date: today, // Set default date to today
    visitor_name: '',
    visitor_from: '',
    visitor_host: '',
    visitor_needs: '',
    visitor_amount: 1,
    visitor_vehicle: '',
    department: '',
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [, setSuppliers] = useState<Supplier[]>([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState<Supplier[]>([]);
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchSuppliers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await fetchEmployeeData();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await fetchSupplierData();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'visitor_needs') {
      if (value === 'Delivery') {
        updatedFormData.visitor_host = 'Warehouse';
        updatedFormData.department = '';
        updatedFormData.visitor_from = ''; // Reset visitor_from when switching to Delivery
        setSuggestions([]);
      } else {
        if (updatedFormData.visitor_host === 'Warehouse') {
          updatedFormData.visitor_host = '';
          updatedFormData.department = '';
        }
      }
    }

    setFormData(updatedFormData);
  };

  // Removed unused handleSupplierChange function

  const handleSupplierSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSupplierSuggestions([]);
      return;
    }

    setIsSearchingSuppliers(true);
    try {
      const results = await searchSuppliers(searchTerm, 20);
      setSupplierSuggestions(results);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      setSupplierSuggestions([]);
    } finally {
      setIsSearchingSuppliers(false);
    }
  };

  const handleSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, visitor_from: value });
    
    // Trigger search if user is typing
    if (value.length >= 2) {
      handleSupplierSearch(value);
    } else {
      setSupplierSuggestions([]);
    }
  };

  const handleSupplierSuggestionClick = (supplier: Supplier) => {
    setFormData({ ...formData, visitor_from: supplier.value });
    setSupplierSuggestions([]);
  };

  const handleVisitorHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData.visitor_needs === 'Delivery') {
      return; // Do nothing if visitor_needs is 'Delivery'
    }
    const value = e.target.value;
    setFormData({ ...formData, visitor_host: value, department: '' });

    if (value.length > 0 && employees.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      const filteredSuggestions = employees.filter((employee) =>
        regex.test(employee.name)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: Employee) => {
    setFormData({
      ...formData,
      visitor_host: suggestion.name,
      department: suggestion.department,
    });
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const visitorData = { ...formData, department: formData.department || '' };
  
    try {
      const visitorId = await submitVisitorData(visitorData);
      console.log('Data submitted successfully, visitor ID:', visitorId);
      navigate(`/tablet/print/${visitorId}`);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <div className="flex justify-center items-center p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Tanggal */}
          <label className="block">
            <span className="text-gray-700">Tanggal:</span>
            <input
              type="date"
              name="visitor_date"
              min={today}
              value={formData.visitor_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </label>

          {/* 2. Nama */}
          <label className="block">
            <span className="text-gray-700">Nama:</span>
            <input
              type="text"
              name="visitor_name"
              value={formData.visitor_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </label>

          {/* 3. Keperluan */}
          <label className="block">
            <span className="text-gray-700">Keperluan:</span>
            <select
              name="visitor_needs"
              value={formData.visitor_needs}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>
                Pilih Keperluan
              </option>
              <option value="Meeting">Meeting</option>
              <option value="Delivery">Delivery</option>
              <option value="Contractor">Contractor</option>
              <option value="Sortir">Sortir</option>
            </select>
          </label>

          {/* 4. Dari - Conditional rendering based on visitor_needs */}
          <label className="block relative">
            <span className="text-gray-700">Dari:</span>
            {formData.visitor_needs === 'Delivery' ? (
              <div className="relative">
                <input
                  type="text"
                  name="visitor_from"
                  value={formData.visitor_from}
                  onChange={handleSupplierInputChange}
                  required
                  autoComplete="off"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ketik nama supplier untuk mencari..."
                />
                {isSearchingSuppliers && (
                  <div className="absolute right-2 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
                {supplierSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 mt-1 max-h-40 w-full overflow-y-auto rounded-md shadow-lg">
                    {supplierSuggestions.map((supplier, index) => (
                      <li
                        key={index}
                        onClick={() => handleSupplierSuggestionClick(supplier)}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{supplier.label}</div>
                        <div className="text-sm text-gray-600">Code: {supplier.code}</div>
                        {supplier.address && (
                          <div className="text-xs text-gray-500 truncate">{supplier.address}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <input
                type="text"
                name="visitor_from"
                value={formData.visitor_from}
                onChange={handleChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Masukkan asal visitor"
              />
            )}
          </label>

          {/* 5. Bertemu */}
          <label className="block relative">
            <span className="text-gray-700">Bertemu:</span>
            <input
              type="text"
              name="visitor_host"
              value={formData.visitor_host}
              onChange={handleVisitorHostChange}
              required
              autoComplete="off"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              readOnly={formData.visitor_needs === 'Delivery'}
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 mt-1 max-h-40 w-full overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion.name} - {suggestion.department}
                  </li>
                ))}
              </ul>
            )}
          </label>

          {/* 6. Jumlah Tamu */}
          <label className="block">
            <span className="text-gray-700">Jumlah Tamu:</span>
            <input
              type="number"
              name="visitor_amount"
              min="1"
              value={formData.visitor_amount}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </label>

          {/* 7. No Polisi */}
          <label className="block">
            <span className="text-gray-700">No Polisi:</span>
            <input
              type="text"
              name="visitor_vehicle"
              value={formData.visitor_vehicle}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-pink-700 text-white p-3 rounded-md hover:bg-pink-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckInForm;
