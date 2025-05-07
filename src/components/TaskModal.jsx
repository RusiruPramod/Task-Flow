import React from 'react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FaTimes } from 'react-icons/fa'
import { useTasks } from '../context/TaskContext'
import { motion, AnimatePresence } from 'framer-motion'

function TaskModal() {
  const { currentTask, closeTaskModal, addTask, updateTask, tasks, addDependency, removeDependency, getDependenciesForTask } = useTasks()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [progress, setProgress] = useState(0)
  const [dependencies, setDependencies] = useState({
    predecessors: [],
    successors: []
  })
  const [selectedPredecessor, setSelectedPredecessor] = useState('')
  const [selectedSuccessor, setSelectedSuccessor] = useState('')

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title)
      setDescription(currentTask.description || '')
      setPriority(currentTask.priority)
      setStartDate(new Date(currentTask.startDate))
      setEndDate(new Date(currentTask.endDate))
      setProgress(currentTask.progress)
      
      const taskDependencies = getDependenciesForTask(currentTask.id)
      setDependencies(taskDependencies)
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStartDate(new Date())
      setEndDate(new Date())
      setProgress(0)
      setDependencies({ predecessors: [], successors: [] })
    }
  }, [currentTask, getDependenciesForTask])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const taskData = {
      title,
      description,
      priority,
      startDate,
      endDate,
      progress,
      status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
    }
    
    if (currentTask) {
      updateTask({ ...taskData, id: currentTask.id })
    } else {
      addTask(taskData)
    }
    
    closeTaskModal()
  }

  const handleAddPredecessor = () => {
    if (selectedPredecessor && currentTask) {
      addDependency(parseInt(selectedPredecessor), currentTask.id)
      setSelectedPredecessor('')
      
      // Update the dependencies list
      setDependencies({
        ...dependencies,
        predecessors: [
          ...dependencies.predecessors,
          tasks.find(t => t.id === parseInt(selectedPredecessor))
        ].filter(Boolean)
      })
    }
  }

  const handleAddSuccessor = () => {
    if (selectedSuccessor && currentTask) {
      addDependency(currentTask.id, parseInt(selectedSuccessor))
      setSelectedSuccessor('')
      
      // Update the dependencies list
      setDependencies({
        ...dependencies,
        successors: [
          ...dependencies.successors,
          tasks.find(t => t.id === parseInt(selectedSuccessor))
        ].filter(Boolean)
      })
    }
  }

  const handleRemovePredecessor = (predId) => {
    if (currentTask) {
      removeDependency(predId, currentTask.id)
      
      // Update the dependencies list
      setDependencies({
        ...dependencies,
        predecessors: dependencies.predecessors.filter(p => p.id !== predId)
      })
    }
  }

  const handleRemoveSuccessor = (succId) => {
    if (currentTask) {
      removeDependency(currentTask.id, succId)
      
      // Update the dependencies list
      setDependencies({
        ...dependencies,
        successors: dependencies.successors.filter(s => s.id !== succId)
      })
    }
  }

  // Filter out tasks that would create circular dependencies
  const getAvailablePredecessors = () => {
    if (!currentTask) return tasks
    
    return tasks.filter(task => 
      task.id !== currentTask.id && 
      !dependencies.predecessors.some(p => p.id === task.id) &&
      !wouldCreateCircular(task.id, currentTask.id)
    )
  }

  const getAvailableSuccessors = () => {
    if (!currentTask) return tasks
    
    return tasks.filter(task => 
      task.id !== currentTask.id && 
      !dependencies.successors.some(s => s.id === task.id) &&
      !wouldCreateCircular(currentTask.id, task.id)
    )
  }

  // Basic circular dependency check
  const wouldCreateCircular = (predId, succId) => {
    // Check if successor is already a predecessor of predecessor
    const checkPredecessors = (taskId, targetId) => {
      const taskDeps = getDependenciesForTask(taskId)
      
      if (taskDeps.predecessors.some(p => p.id === targetId)) {
        return true
      }
      
      return taskDeps.predecessors.some(p => checkPredecessors(p.id, targetId))
    }
    
    return checkPredecessors(predId, succId)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h3 className="text-xl font-semibold text-neutral-900">
              {currentTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button 
              onClick={closeTaskModal}
              className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  className="form-input h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    id="priority"
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="progress" className="form-label">Progress ({progress}%)</label>
                  <input
                    type="range"
                    id="progress"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="form-input"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <DatePicker
                    id="endDate"
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="form-input"
                    dateFormat="MMM d, yyyy"
                  />
                </div>
              </div>
              
              {currentTask && (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <h4 className="font-medium mb-3">Dependencies</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {/* Predecessors */}
                    <div>
                      <label className="form-label">Add Predecessor</label>
                      <div className="flex space-x-2">
                        <select
                          className="form-select flex-1"
                          value={selectedPredecessor}
                          onChange={(e) => setSelectedPredecessor(e.target.value)}
                        >
                          <option value="">Select task...</option>
                          {getAvailablePredecessors().map(task => (
                            <option key={task.id} value={task.id}>
                              {task.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={handleAddPredecessor}
                          disabled={!selectedPredecessor}
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {dependencies.predecessors.map(pred => (
                          <div key={pred.id} className="flex items-center bg-neutral-50 px-2 py-1 rounded text-sm">
                            <span className="flex-1">{pred.title}</span>
                            <button
                              type="button"
                              className="text-neutral-500 hover:text-error-500"
                              onClick={() => handleRemovePredecessor(pred.id)}
                              aria-label="Remove predecessor"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Successors */}
                    <div>
                      <label className="form-label">Add Successor</label>
                      <div className="flex space-x-2">
                        <select
                          className="form-select flex-1"
                          value={selectedSuccessor}
                          onChange={(e) => setSelectedSuccessor(e.target.value)}
                        >
                          <option value="">Select task...</option>
                          {getAvailableSuccessors().map(task => (
                            <option key={task.id} value={task.id}>
                              {task.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={handleAddSuccessor}
                          disabled={!selectedSuccessor}
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {dependencies.successors.map(succ => (
                          <div key={succ.id} className="flex items-center bg-neutral-50 px-2 py-1 rounded text-sm">
                            <span className="flex-1">{succ.title}</span>
                            <button
                              type="button"
                              className="text-neutral-500 hover:text-error-500"
                              onClick={() => handleRemoveSuccessor(succ.id)}
                              aria-label="Remove successor"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeTaskModal}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn-primary"
                >
                  {currentTask ? 'Update Task' : 'Create Task'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TaskModal