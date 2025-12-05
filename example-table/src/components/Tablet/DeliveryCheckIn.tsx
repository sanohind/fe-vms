import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDeliveryData, submitVisitorData, fetchVisitorData, DeliveryData, Visitor } from '../../services/apiService';
import logoSanoh from '/logo-sanoh.png';

const DeliveryCheckIn: React.FC = () => {
  const [deliveryData, setDeliveryData] = useState<DeliveryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeTime = (time?: string | null) => (time ?? '').trim();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery data and visitor data in parallel
      const [deliveryData, visitorData] = await Promise.all([
        fetchDeliveryData(),
        fetchVisitorData()
      ]);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Get list of delivery visitors that already checked in today
      const checkedInDeliveries = visitorData
        .filter((visitor: Visitor) => 
          visitor.visitor_date === today && 
          visitor.visitor_needs === 'Delivery' &&
          visitor.visitor_checkin !== null
        )
        .map((visitor: Visitor) => ({
          driver_name: visitor.visitor_name,
          plat_number: visitor.visitor_vehicle,
          plan_delivery_time: visitor.plan_delivery_time ?? null,
        }));
      
      // Filter out deliveries that already checked in
      // Match by driver_name and plat_number
      const filteredData = deliveryData.filter((delivery) => {
        const isCheckedIn = checkedInDeliveries.some(
          (checkedIn) =>
            checkedIn.driver_name === delivery.driver_name &&
            checkedIn.plat_number === delivery.plat_number &&
            normalizeTime(checkedIn.plan_delivery_time) === normalizeTime(delivery.plan_delivery_time)
        );
        return !isCheckedIn;
      });
      
      // Sort by plan_delivery_time
      const sortedData = [...filteredData].sort((a, b) => {
        const timeA = a.plan_delivery_time || '';
        const timeB = b.plan_delivery_time || '';
        return timeA.localeCompare(timeB);
      });
      
      setDeliveryData(sortedData);
    } catch (error) {
      console.error('Error fetching delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (delivery: DeliveryData) => {
    try {
      setCheckingIn(delivery.no_dn);
      
      // Prepare visitor data
      // For Delivery, visitor_from should contain supplier_code (bp_code) if available
      // Backend will look up the supplier name from business_partner table
      const today = new Date().toISOString().split('T')[0];
      const visitorData = {
        visitor_date: today,
        visitor_name: delivery.driver_name,
        visitor_from: delivery.supplier_code || delivery.supplier_name || '',
        visitor_host: 'Warehouse',
        visitor_needs: 'Delivery',
        visitor_amount: 1,
        visitor_vehicle: delivery.plat_number,
        plan_delivery_time: delivery.plan_delivery_time || null,
        department: '',
      };

      // Submit check-in
      const visitorId = await submitVisitorData(visitorData);
      console.log('Delivery check-in successful, visitor ID:', visitorId);
      
      // Navigate to print page
      navigate(`/tablet/print/${visitorId}`);
    } catch (error) {
      console.error('Error checking in delivery:', error);
      alert('Gagal melakukan check-in. Silakan coba lagi.');
    } finally {
      setCheckingIn(null);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    // Format time from HH:mm:ss to HH:mm
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const totalPages = Math.ceil(deliveryData.length / itemsPerPage);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = deliveryData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto p-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Sanoh Logo on the left */}
        <img src={logoSanoh} alt="Sanoh Logo" className="w-24" />

        {/* Centered "Delivery Check-In" text */}
        <h2 className="text-2xl font-bold text-center flex-1">Delivery Check-In</h2>

        {/* Button Kembali */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/tablet/checkin')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-400 focus:outline-none"
          >
            Kembali
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Delivery List */}
      {!loading && (
        <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full mt-6">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-blue-950 text-base text-white border-white-900">
              <tr>
                <th className="py-3 text-center border-b border-b-gray-400">No</th>
                <th className="py-3 text-center border-b border-b-gray-400">Driver Name</th>
                <th className="py-3 text-center border-b border-b-gray-400">Plat Number</th>
                <th className="py-3 text-center border-b border-b-gray-400">Jam Kedatangan</th>
                <th className="py-3 text-center border-b border-b-gray-400">Supplier</th>
                <th className="py-3 text-center border-b border-b-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDeliveries.length > 0 ? (
                currentDeliveries.map((delivery, index) => (
                  <tr
                    key={delivery.no_dn}
                    className="bg-green-50 border-b hover:bg-green-100"
                  >
                    <td className="px-2 py-3 text-center text-sm">{indexOfFirstItem + index + 1}</td>
                    <td className="px-2 py-3 text-center text-sm font-medium">
                      {delivery.driver_name || '-'}
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      {delivery.plat_number || '-'}
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      {formatTime(delivery.plan_delivery_time)}
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      {delivery.supplier_name || '-'}
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleCheckIn(delivery)}
                          disabled={checkingIn === delivery.no_dn}
                          className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none ${
                            checkingIn === delivery.no_dn
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {checkingIn === delivery.no_dn ? 'Memproses...' : 'Check-In'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Tidak ada data delivery untuk hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

{/* Pagination */}
{!loading && deliveryData.length > itemsPerPage && (
        <div className="flex justify-end mt-6 items-center space-x-2">
          <button
            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
              currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              className={`px-4 py-2 rounded-md ${
                currentPage === pageNum
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
              currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryCheckIn;

