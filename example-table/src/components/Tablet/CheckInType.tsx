import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoSanoh from '/logo-sanoh.png';

const CheckInType: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo Image */}
      <img src={logoSanoh} alt="Logo" className="w-48 h-auto mb-7" />
      
      {/* Welcome Text */}
      <div className="flex flex-col items-center space-y-6">
        <h2 className="text-2xl font-bold mb-4">Pilih Tipe Check-In</h2>
        
        <button
          onClick={() => navigate('/tablet/checkin/delivery')}
          className="flex items-center justify-center w-64 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-500 focus:outline-none text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Delivery
        </button>
        
        <button
          onClick={() => navigate('/tablet/checkin/non-delivery')}
          className="flex items-center justify-center w-64 px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-600 focus:outline-none text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Non-Delivery
        </button>
        
        <button
          onClick={() => navigate('/tablet')}
          className="flex items-center justify-center w-64 px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-400 focus:outline-none text-lg mt-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
      </div>
    </div>
  );
};

export default CheckInType;

