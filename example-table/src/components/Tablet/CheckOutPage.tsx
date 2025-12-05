import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSanoh from "/logo-sanoh.png";
import {
  fetchVisitorData,
  checkOutVisitor,
  Visitor,
} from "../../services/apiService";

const CheckOutPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [showFilterButton, setShowFilterButton] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // Fetch visitor data for today
  const getData = async () => {
    try {
      const data = await fetchVisitorData();
      const today = new Date().toISOString().split("T")[0];
      const todayVisitors = data.filter(
        (visitor) => visitor.visitor_date === today && !visitor.visitor_checkout
      );

      setVisitors(todayVisitors);
      setFilteredVisitors(todayVisitors);
      setShowFilterButton(todayVisitors.length >= 10);
    } catch (error) {
      console.error("Failed to fetch visitor data:", error);
    }
  };

  // Fetch visitor data on initial render
  useEffect(() => {
    getData();
  }, []);

  // Update filtered visitors based on the selected filter
  useEffect(() => {
    if (filter === "All") {
      setFilteredVisitors(visitors);
    } else {
      setFilteredVisitors(
        visitors.filter((visitor) => visitor.visitor_needs === filter)
      );
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter, visitors]);

  // Open modal for checkout confirmation
  const handleCheckOut = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setShowModal(true);
  };

  // Confirm and process check-out
  const confirmCheckOut = async () => {
    if (!selectedVisitor) return;

    try {
      setIsCheckingOut(true);
      await checkOutVisitor(selectedVisitor.visitor_id);
      await getData(); // Refresh data after successful check-out
      setShowModal(false);
      setSelectedVisitor(null);

      // Show success message briefly before redirect
      setTimeout(() => {
        navigate("/tablet/");
      }, 500);
    } catch (error) {
      console.error("Failed to check out visitor:", error);
      alert("Gagal melakukan check-out. Silakan coba lagi.");
      setShowModal(false);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cancelCheckOut = () => {
    setShowModal(false);
    setSelectedVisitor(null);
  };

  // Function to map visitor_needs to row background color classes
  const getRowColorClass = (needs: string) => {
    switch (needs) {
      case "Meeting":
        return "bg-blue-50";
      case "Delivery":
        return "bg-green-50";
      case "Contractor":
        return "bg-red-50";
      case "Sortir":
        return "bg-yellow-50";
      default:
        return "bg-white";
    }
  };

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVisitors = filteredVisitors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber: number) => {
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto p-4 relative">
      <div className="flex justify-between items-center mb-6">
        {/* Sanoh Logo on the left */}
        <img src={logoSanoh} alt="Sanoh Logo" className="w-24" />

        {/* Centered "Visitor Check-out" text */}
        <h2 className="text-2xl font-bold text-center flex-1">
          Visitor Check-out
        </h2>

        {/* Render Filter Button if there are at least 10 visitors */}
        {showFilterButton && (
          <div className="flex justify-end">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Meeting">Meeting</option>
              <option value="Delivery">Delivery</option>
              <option value="Contractor">Contractor</option>
              <option value="Sortir">Sortir</option>
            </select>
          </div>
        )}
      </div>

      {/* Table of Visitors */}
      <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full mt-6">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-950 text-base text-white border-white-900">
            <tr>
              <th className="py-3 text-center border-b border-b-gray-400 w-30">
                NO VISITOR
              </th>
              <th className="py-3 text-center border-b border-b-gray-400">
                NAMA
              </th>
              <th className="py-3 text-center border-b border-b-gray-400">
                PERUSAHAAN
              </th>
              <th className="py-3 text-center border-b border-b-gray-400">
                KEPERLUAN
              </th>
              <th className="py-3 text-center border-b border-b-gray-400">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {currentVisitors.length > 0 ? (
              currentVisitors.map((visitor) => (
                <tr
                  key={visitor.visitor_id}
                  className={`${getRowColorClass(
                    visitor.visitor_needs
                  )} border-b`}
                >
                  <td className="px-2 py-3 text-center text-sm">
                    {visitor.visitor_id}
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    {visitor.visitor_name}
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    {visitor.visitor_from}
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    {visitor.visitor_needs}
                  </td>
                  <td className="px-2 py-3 text-center text-sm">
                    {!visitor.visitor_checkout && (
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => handleCheckOut(visitor)}
                          aria-label="Check-out"
                          className="focus:outline-none hover:opacity-70 transition-opacity"
                        >
                          <img
                            src="/icon_logout.svg"
                            alt="Check-out"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No visitors available for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredVisitors.length > itemsPerPage && (
        <div className="flex justify-end mt-6 items-center space-x-2">
          <button
            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-400"
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                className={`px-4 py-2 rounded-md ${
                  currentPage === pageNum
                    ? "bg-blue-800 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-400"
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Modal Confirmation */}
      {showModal && selectedVisitor && (
        <div className="fixed inset-0 z-40 min-h-full overflow-y-auto overflow-x-hidden transition flex items-center">
          <div
            aria-hidden="true"
            className="fixed inset-0 w-full h-full bg-black/50 cursor-pointer"
            onClick={!isCheckingOut ? cancelCheckOut : undefined}
          ></div>

          <div className="relative w-full cursor-pointer pointer-events-none transition my-auto p-4">
            <div className="w-full py-2 bg-white cursor-default pointer-events-auto relative rounded-xl mx-auto max-w-sm shadow-2xl">
              {!isCheckingOut && (
                <button
                  type="button"
                  className="absolute top-2 right-2 rtl:right-auto rtl:left-2 text-gray-400 hover:text-gray-600"
                  onClick={cancelCheckOut}
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <title>Close</title>
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              )}

              <div className="space-y-2 p-2">
                <div className="p-4 space-y-2 text-center">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Konfirmasi Check-out
                  </h2>
                  <p className="text-gray-600">
                    Apakah Anda yakin ingin check-out visitor berikut?
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                    <p className="text-sm text-gray-800">
                      <strong>Nama:</strong> {selectedVisitor.visitor_name}
                    </p>
                    <p className="text-sm text-gray-800">
                      <strong>Perusahaan:</strong>{" "}
                      {selectedVisitor.visitor_from}
                    </p>
                    <p className="text-sm text-gray-800">
                      <strong>Keperluan:</strong>{" "}
                      {selectedVisitor.visitor_needs}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div
                  aria-hidden="true"
                  className="border-t border-gray-200 px-2"
                ></div>

                <div className="px-6 py-2">
                  <div className="grid gap-2 grid-cols-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center py-2 px-4 font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={cancelCheckOut}
                      disabled={isCheckingOut}
                    >
                      <span>Batal</span>
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center justify-center py-2 px-4 font-medium rounded-lg border text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isCheckingOut
                          ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                          : "bg-red-500 border-red-500 hover:bg-red-600 focus:ring-red-500"
                      }`}
                      onClick={confirmCheckOut}
                      disabled={isCheckingOut}
                    >
                      <span>
                        {isCheckingOut
                          ? "Memproses..."
                          : "Konfirmasi"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckOutPage;
