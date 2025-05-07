import React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import Timeline from './components/Timeline'
import TaskModal from './components/TaskModal'
import { useTasks } from './context/TaskContext'

function App() {
  const [view, setView] = useState('board') // 'board' or 'timeline'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isModalOpen } = useTasks()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} setView={setView} currentView={view} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {view === 'board' ? (
              <TaskBoard />
            ) : (
              <Timeline />
            )}
          </motion.div>
        </main>
      </div>

      {isModalOpen && <TaskModal />}
    </div>
  )
}

export default App