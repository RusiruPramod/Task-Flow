import React from 'react'
import { 
  FaTasks, 
  FaCalendarAlt, 
  FaChartBar, 
  FaCog, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa'
import { motion } from 'framer-motion'

function Sidebar({ isOpen, toggleSidebar, setView, currentView }) {
  const menuItems = [
    { id: 'board', label: 'Task Board', icon: <FaTasks /> },
    { id: 'timeline', label: 'Timeline', icon: <FaCalendarAlt /> },
    { id: 'stats', label: 'Statistics', icon: <FaChartBar /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ]

  return (
    <div 
      className={`bg-neutral-800 text-white transition-all duration-300 ease-in-out 
                 ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}
    >
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-bold text-xl"
          >
            TaskFlow
          </motion.h2>
        )}
        <button 
          onClick={toggleSidebar}
          className="text-neutral-300 hover:text-white focus:outline-none"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
      
      <nav className="flex-1 mt-8">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => ['board', 'timeline'].includes(item.id) && setView(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left
                           ${currentView === item.id ? 'bg-primary-700 text-white' : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'}
                           transition-colors duration-200 ease-in-out`}
                disabled={!['board', 'timeline'].includes(item.id)}
              >
                <span className="text-lg">{item.icon}</span>
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-4"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3"
            >
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-neutral-400">user@example.com</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar