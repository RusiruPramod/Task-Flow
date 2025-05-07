import React from 'react'
import { useState } from 'react'
import { FaSearch, FaBars, FaPlus } from 'react-icons/fa'
import { useTasks } from '../context/TaskContext'
import { motion } from 'framer-motion'

function Header({ toggleSidebar }) {
  const { openTaskModal } = useTasks()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    // Implement search functionality
  }

  return (
    <header className="bg-white border-b border-neutral-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 text-neutral-600 hover:text-neutral-900 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <FaBars className="h-5 w-5" />
        </button>
        
        <h1 className="text-xl font-semibold text-neutral-900">Task Planner</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-64 pl-10 py-2 pr-3 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openTaskModal()}
          className="btn-primary flex items-center"
        >
          <FaPlus className="mr-2 h-3.5 w-3.5" />
          New Task
        </motion.button>
      </div>
    </header>
  )
}

export default Header