import { useEffect, useState, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getplansasync } from "../services/action/plan.Action";
// Chart.js imports
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMoon, FaSun, FaRegCalendarAlt } from "react-icons/fa";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

// Add custom styles for the datepicker popper
const customStyles = `
  .react-datepicker-popper {
    top: 145px !important;
    left:43% !important;
  }

  .dark .react-datepicker {
    background-color: #1f2937;
    border-color: #374151;
    color: #e5e7eb;
  }

  .dark .react-datepicker__header {
    background-color: #111827;
    border-bottom-color: #374151;
  }

  .dark .react-datepicker__current-month {
    color: #e5e7eb;
  }

  .dark .react-datepicker__day-name {
    color: #9ca3af;
  }

  .dark .react-datepicker__day {
    color: #e5e7eb;
  }

  .dark .react-datepicker__day:hover {
    background-color: #374151;
  }

  .dark .react-datepicker__day--selected {
    background-color: #3b82f6 !important;
    color: white !important;
  }

  .dark .react-datepicker__day--keyboard-selected {
    background-color: #3b82f6 !important;
    color: white !important;
  }

  .dark .react-datepicker__day--in-range {
    background-color: #1d4ed8 !important;
    color: white !important;
  }

  .dark .react-datepicker__day--in-selecting-range {
    background-color: #1d4ed8 !important;
    color: white !important;
  }

  .dark .react-datepicker__day--disabled {
    color: #6b7280;
  }

  .dark .react-datepicker__navigation {
    color: #e5e7eb;
  }

  .dark .react-datepicker__navigation:hover {
    background-color: #374151;
  }

  .dark .react-datepicker__navigation-icon::before {
    border-color: #e5e7eb;
  }

  .dark .react-datepicker__month-select,
  .dark .react-datepicker__year-select {
    background-color: #1f2937;
    color: #e5e7eb;
    border-color: #374151;
  }

  .dark .react-datepicker__month-option:hover,
  .dark .react-datepicker__year-option:hover {
    background-color: #374151;
  }

  .dark .react-datepicker__month-option--selected,
  .dark .react-datepicker__year-option--selected {
    background-color: #3b82f6 !important;
  }
`;

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// New component for the custom date range picker
const CustomDateRangePicker = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedPreset, setSelectedPreset] = useState('Last 28 days');
  const [showCompare, setShowCompare] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Add custom styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    // Initialize date range to "Last 28 days" on mount
    if (!startDate && !endDate && selectedPreset === 'Last 28 days') {
      const end = new Date();
      const start = subDays(end, 27); // 28 days including today
      setDateRange([start, end]);
    }
  }, [startDate, endDate, selectedPreset]);

  const datePresets = [
    { label: 'Last 7 days', calculate: () => [subDays(new Date(), 6), new Date()] },
    { label: 'Last 28 days', calculate: () => [subDays(new Date(), 27), new Date()] },
    { label: 'Last 90 days', calculate: () => [subDays(new Date(), 89), new Date()] },
    { label: 'This week', calculate: () => [startOfWeek(new Date(), { weekStartsOn: 1 }), endOfWeek(new Date(), { weekStartsOn: 1 })] }, // Monday as start of week
    { label: 'This month', calculate: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: 'This year', calculate: () => [startOfYear(new Date()), endOfYear(new Date())] },
    { label: 'Last week', calculate: () => [startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })] },
    { label: 'Last month', calculate: () => [startOfMonth(subDays(new Date(), 30)), endOfMonth(subDays(new Date(), 30))] },
    { label: 'Custom', calculate: () => [null, null] },
  ];

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset.label);
    if (preset.label !== 'Custom') {
      setDateRange(preset.calculate());
    } else {
      setDateRange([null, null]); // Clear dates for custom selection
    }
  };

  const CustomDatePickerInput = forwardRef(({ onClick }, ref) => {
    let displayValue = selectedPreset;

    if (startDate && endDate) {
      const formattedStartDate = format(startDate, 'MMM d, yyyy');
      const formattedEndDate = format(endDate, 'MMM d, yyyy');
      displayValue = `${selectedPreset}: ${formattedStartDate} - ${formattedEndDate}`;
    } else {
      displayValue = "Select Date Range";
    }

    return (
      <button
        className="flex items-center text-gray-700 dark:text-gray-200 px-3 py-2 focus:outline-none"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
          onClick(e);
        }}
        ref={ref}
      >
        <FaRegCalendarAlt className="mr-2" />
        {displayValue}
        <span className="ml-2 text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      </button>
    );
  });

  // Custom Header for DatePicker - this will only control the month/year navigation *within* the calendar grid
  const renderCustomHeader = ({
    monthDate,
    customHeaderCount,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-700">
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
        {'<'}
      </button>
      <div className="text-lg font-semibold text-gray-800 dark:text-white">
        {format(monthDate, 'MMM yyyy')}
      </div>
      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
        {'>'}
      </button>
    </div>
  );

  // Custom Calendar Container
  const CustomCalendarContainer = ({ children }) => {
    return (
      <div className="flex flex-row bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Sidebar */}
        <div className="w-48 p-4 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          {datePresets.map((preset) => (
            <div
              key={preset.label}
              className={`flex items-center mb-2 cursor-pointer p-2 rounded-md ${
                selectedPreset === preset.label 
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => handlePresetClick(preset)}
            >
              <input
                type="radio"
                name="datePreset"
                value={preset.label}
                checked={selectedPreset === preset.label}
                onChange={() => handlePresetClick(preset)}
                className="mr-2 form-radio text-blue-600 dark:text-blue-400"
              />
              {preset.label}
            </div>
          ))}
        </div>
        {/* Calendar and Footer */}
        <div className="flex flex-col flex-grow">
          <div className="flex flex-row">
            {children}
          </div>
          {/* Footer buttons */}
          <div className="p-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="mb-2 flex items-center">
              <input
                type="checkbox"
                checked={showCompare}
                onChange={() => setShowCompare(!showCompare)}
                className="mr-1 form-checkbox text-blue-600 dark:text-blue-400"
              />
              <label className="text-gray-700 dark:text-gray-300 text-sm">Compare</label>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setDateRange([date, endDate])}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-20 text-xs dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  dateFormat="MMM d, yyyy"
                />
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setDateRange([startDate, date])}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-20 text-xs dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  dateFormat="MMM d, yyyy"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Dates are shown in Pacific Time
            </div>
            <div className="flex justify-end space-x-1">
              <button 
                onClick={() => {
                  setDateRange([null, null]);
                  setSelectedPreset('Last 28 days');
                }} 
                className="px-3 py-1 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (startDate && endDate) {
                    setSelectedPreset('Custom');
                  }
                }} 
                className="px-3 py-1 bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-md hover:bg-gray-900 dark:hover:bg-gray-600 text-sm"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => {
            setDateRange(update);
            if (update[0] !== null && update[1] !== null) {
                setSelectedPreset('Custom');
            }
        }}
        customInput={<CustomDatePickerInput />}
        calendarContainer={CustomCalendarContainer}
        renderCustomHeader={renderCustomHeader}
        showPopperArrow={false}
        monthsShown={2}
        popperPlacement="bottom"
        open={isOpen}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        popperModifiers={[
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport"
            }
          },
          {
            name: "offset",
            options: {
              offset: [0, 8]
            }
          }
        ]}
        dayClassName={(date) => {
            if (startDate && endDate && date >= startDate && date <= endDate) {
                return "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs";
            }
            if (startDate && date.toDateString() === startDate.toDateString()) {
                return "bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-full text-xs";
            }
            if (endDate && date.toDateString() === endDate.toDateString()) {
                return "bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-full text-xs";
            }
            return "text-xs dark:text-gray-300";
        }}
        className="react-datepicker-custom"
        dayLabelStyle={{
          width: "20px",
          height: "20px",
          lineHeight: "20px",
          fontSize: "0.75rem",
        }}
    />
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { plans } = useSelector((state) => state.planReducer);

  // Live date & time state
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dark/light mode state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    dispatch(getplansasync());
  }, [dispatch]);

  // Dummy data for cards
  const netRevenue = 2500;
  const totalTransactions = 10000;
  const activeUsers = 264;

  // Dummy data for Bar chart
  const barData = {
    labels: ['Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20'],
    datasets: [
      {
        label: 'New Audiences',
        data: [5000, 4200, 6000, 1500, 4300, 2000, 4300],
        backgroundColor: [
          '#3ABEFF', '#3ABEFF', '#3A4EFF', '#3ABEFF', '#3ABEFF', '#3ABEFF', '#3ABEFF',
        ],
        borderRadius: 8,
      },
    ],
  };

  // Dummy data for Pie chart
  const pieData = {
    labels: [
      'Current Active Users',
      'Pending Payment',
      'Users Plan Expired',
      'Users Re-activated Plans',
    ],
    datasets: [
      {
        data: [40, 20, 20, 20],
        backgroundColor: [
          '#4ADE80', // green
          '#FACC15', // yellow
          '#3B82F6', // blue
          '#F87171', // red
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="pl-50 transition-all duration-300">
        {/* Date Picker Section */}
        <div className="flex justify-end px-6 md:px-12 pt-8 pb-0">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <CustomDateRangePicker />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-12 py-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-gray-100 dark:border-gray-700">
            <p className="text-md text-gray-500 dark:text-gray-300">Total Plans</p>
            <h2 className="text-4xl font-bold mt-2 text-gray-800 dark:text-white">{plans.length}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-gray-100 dark:border-gray-700">
            <p className="text-md text-gray-500 dark:text-gray-300">Net revenue</p>
            <h2 className="text-4xl font-bold mt-2 text-gray-800 dark:text-white">${netRevenue.toFixed(1)}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-gray-100 dark:border-gray-700">
            <p className="text-md text-gray-500 dark:text-gray-300">Total Transactions</p>
            <h2 className="text-4xl font-bold mt-2 text-gray-800 dark:text-white">${totalTransactions.toFixed(1)}</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-gray-100 dark:border-gray-700">
            <p className="text-md text-gray-500 dark:text-gray-300">Active Users</p>
            <h2 className="text-4xl font-bold mt-2 text-gray-800 dark:text-white">{activeUsers}</h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 md:px-12 pb-12">
          {/* Bar Chart Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-md font-semibold text-gray-800 dark:text-white">New Audiences</p>
                <span className="inline-block bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300 text-xs px-2 py-0.5 rounded-full mr-2">0.10</span>
                <span className="text-xs text-gray-400 dark:text-gray-300">From Last Period</span>
              </div>
              <button className="border border-blue-500 text-blue-500 dark:text-blue-400 dark:border-blue-400 text-xs px-4 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50">View Report</button>
            </div>
            <div className="h-64">
              <Bar data={barData} options={{
                plugins: { legend: { display: false } },
                scales: { 
                  y: { 
                    beginAtZero: true, 
                    grid: { color: theme === 'dark' ? '#374151' : '#eee' },
                    ticks: { color: theme === 'dark' ? '#9CA3AF' : '#666' }
                  }, 
                  x: { 
                    grid: { color: theme === 'dark' ? '#374151' : '#eee' },
                    ticks: { color: theme === 'dark' ? '#9CA3AF' : '#666' }
                  } 
                },
              }} />
            </div>
          </div>
          {/* Pie Chart Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col border border-gray-100 dark:border-gray-700">
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieData} options={{
                plugins: { legend: { display: false } },
              }} />
            </div>
            <div className="flex flex-wrap justify-end gap-4 mt-4 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>Current Active Users (40%)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>Pending Payment (20%)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>Users Plan Expired (20%)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-red-400"></span>Users Re-activated Plans (20%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
