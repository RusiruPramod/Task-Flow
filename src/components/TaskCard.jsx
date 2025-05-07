import React from 'react'
import { FaCalendarAlt, FaLink, FaClock, FaEdit, FaTrash } from 'react-icons/fa'
import { format } from 'date-fns'
import { useTasks } from '../context/TaskContext'
import { motion } from 'framer-motion'

function TaskCard({ task, isDragging }) {
  const { openTaskModal, deleteTask, calculateCriticalPath } = useTasks()
  const criticalPath = calculateCriticalPath()
  const isCritical = criticalPath.has(task.id)
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-error-100 text-error-800'
      case 'medium': return 'bg-warning-100 text-warning-800'
      case 'low': return 'bg-neutral-100 text-neutral-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getProgressColor = () => {
    if (task.progress === 100) return 'bg-success-500'
    if (task.progress >= 50) return 'bg-primary-500'
    return 'bg-accent-500'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${
        isCritical ? 'border-l-4 border-error-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-neutral-900">{task.title}</h4>
        <div className={`badge ${getPriorityColor()}`}>
          {task.priority}
        </div>
      </div>

      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center text-xs text-neutral-500 mb-3">
        <FaCalendarAlt className="mr-1" />
        <span>
          {format(new Date(task.startDate), 'MMM d')} - {format(new Date(task.endDate), 'MMM d, yyyy')}
        </span>
      </div>
      
      {isCritical && (
        <div className="flex items-center text-xs text-error-600 mb-3">
          <FaLink className="mr-1" />
          <span>Critical Path</span>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-600">Progress</span>
          <span className="font-medium">{task.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${getProgressColor()}`} 
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => openTaskModal(task)}
          className="text-neutral-500 hover:text-primary-500 transition-colors p-1"
          aria-label="Edit task"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-neutral-500 hover:text-error-500 transition-colors p-1"
          aria-label="Delete task"
        >
          <FaTrash />
        </button>
      </div>
    </motion.div>
  )
}

export default TaskCard