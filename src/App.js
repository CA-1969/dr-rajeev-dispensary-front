import React, { useState, useEffect } from 'react';

// IMPORTANT: Replace this with your actual Google Apps Script Web App URL (the /exec URL)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzsZWO9UPRheDGRP2E3oJ2aNt9UKw1m7eJ_Obp2We19kgD9CEUpyX8z8bhFM_ZTfA/exec';

function App() {
  // State for form inputs
  const [sNo, setSNo] = useState('');
  const [date, setDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [cashMemoBill, setCashMemoBill] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Cash'); // Default to Cash
  const [phoneNumber, setPhoneNumber] = useState('');

  // State for displaying daily totals and entries
  const [cashTotal, setCashTotal] = useState(0);
  const [upiTotal, setUpiTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [todayEntries, setTodayEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to fetch initial data and refresh daily entries/totals
  const fetchDailyData = async () => {
    setLoading(true);
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched data:", data); // For debugging

      if (data.error) {
        console.error(`Error fetching data from script: ${data.error}`);
        setLoading(false);
        return;
      }

      // Update form defaults based on fetched data
      // If data.lastSNo is not available (first sale), default to 0 + 1 = 1
      setSNo(((data.lastSNo || 0) + 1).toString());
      setDate(data.currentDate); // Always set current date for input

      // Update daily totals and entries for display
      setCashTotal(data.cashTotal || 0);
      setUpiTotal(data.upiTotal || 0);
      setGrandTotal(data.grandTotal || 0);
      setTodayEntries(data.todayEntries || []);
      setMessage(''); // Clear message on success

    } catch (error) {
      console.error("Error fetching daily data:", error);
      // For initial empty state, we don't want this message to show on the frontend.
      // The error will still be logged to the console.
      // setMessage(`Failed to fetch daily data: ${error.message}`);
      // If it's a network error and no data, initialize S.no to 1
      setSNo('1');
      // Set current date if not already set by backend
      if (!date) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
        const dd = String(today.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDailyData();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Adding sale...');

    // Basic validation
    if (!sNo || !date || !patientName || !saleAmount || !paymentType) {
      setMessage('Please fill in all required fields: S.no, Date, Patient Name, Sale Amount, Payment Type.');
      setLoading(false);
      return;
    }

    const formData = {
      sNo: parseInt(sNo), // Ensure S.no is a number
      date: date,
      patientName: patientName,
      cashMemoBill: cashMemoBill,
      saleAmount: parseFloat(saleAmount), // Ensure saleAmount is a number
      paymentType: paymentType,
      phoneNumber: phoneNumber
    };

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors', // Ensure CORS is enabled
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setMessage('Sale added successfully!');
        // Clear form fields after successful submission, except date and next S.no
        setPatientName('');
        setCashMemoBill('');
        setSaleAmount('');
        setPaymentType('Cash');
        setPhoneNumber('');

        // Re-fetch daily data to update the displayed entries and totals
        await fetchDailyData();

      } else {
        setMessage(`Error: ${result.message || 'Failed to add data.'} ${result.error || ''}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage(`Failed to submit data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans ml-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        {/* Updated Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Dr Rajeev Kumar Garg - Dispensary Sales</h1>
        {/* Copyright notice */}
        <p className="text-right text-xs text-gray-500 mb-6">© Anurag Mahshwari and Company</p>

        {/* Message Display */}
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center text-blue-600 mb-4">Loading...</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sNo" className="block text-sm font-medium text-gray-700">S.no</label>
              <input
                type="number"
                id="sNo"
                value={sNo}
                onChange={(e) => setSNo(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                readOnly // S.no is auto-generated
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Patient Name</label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="cashMemoBill" className="block text-sm font-medium text-gray-700">Cash Memo / Bill (Optional)</label>
              <input
                type="text"
                id="cashMemoBill"
                value={cashMemoBill}
                onChange={(e) => setCashMemoBill(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="saleAmount" className="block text-sm font-medium text-gray-700">Sale Amount (₹)</label>
              <input
                type="number"
                id="saleAmount"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">Payment Type</label>
              <select
                id="paymentType"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                {/* Add more payment types if needed */}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Sale'}
          </button>
        </form>

        {/* Daily Totals Display */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Summary</h2>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">Cash Total:</span> ₹ {cashTotal.toFixed(2)}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">UPI Total:</span> ₹ {upiTotal.toFixed(2)}
          </p>
          <p className="text-xl font-bold text-gray-900">
            <span className="font-semibold">Grand Total:</span> ₹ {grandTotal.toFixed(2)}
          </p>
        </div>

        {/* Today's Entries Table */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="2xl font-bold text-gray-800 mb-4">Today's Entries</h2>
          {todayEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4 border-b border-gray-200">S.no</th>
                    <th className="py-3 px-4 border-b border-gray-200">Date</th>
                    <th className="py-3 px-4 border-b border-gray-200">Patient Name</th>
                    <th className="py-3 px-4 border-b border-gray-200">Phone</th>
                    <th className="py-3 px-4 border-b border-gray-200">Memo/Bill</th>
                    <th className="py-3 px-4 border-b border-gray-200">Payment Type</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {todayEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{entry.sNo}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{entry.date}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{entry.patientName}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{entry.phoneNumber || '-'}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{entry.cashMemoBill || '-'}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">{entry.paymentType}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800 text-right">{entry.saleAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No entries for today yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
