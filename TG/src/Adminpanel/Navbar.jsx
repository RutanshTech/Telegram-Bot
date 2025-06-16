import { useEffect, useState } from "react";
import { Sun, Moon, Bell, User } from "lucide-react";

const Navbar = ({ title = "Admin Panel" }) => {
  // Dark/light mode state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(3); // Example notification count
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Example notification data
  const notificationItems = [
    { id: 1, message: "New user registered", time: "5 minutes ago" },
    { id: 2, message: "System update completed", time: "1 hour ago" },
    { id: 3, message: "New order received", time: "2 hours ago" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">{title}</span>
        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-full">Dashboard</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative notification-container">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificationItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <p className="text-sm text-gray-900 dark:text-white">{item.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setNotifications(0);
                    setShowNotifications(false);
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="text-yellow-400 w-5 h-5" />
          ) : (
            <Moon className="text-gray-600 w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
