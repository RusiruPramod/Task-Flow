import React from 'react'
import { createContext, useState, useContext, useEffect } from 'react'
import { addDays, isAfter } from 'date-fns'

const TaskContext = createContext()

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [dependencies, setDependencies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tasks from the API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would come from your API
        const tasks = await fetch('http://localhost:3001/api/tasks');
        const tasksData = await tasks.json()
        if (!tasksData) {
          throw new Error('No tasks found')
        }
        setTasks(tasksData)

        const dependencies = await fetch('http://localhost:3001/api/dependencies');
        const dependenciesData = await dependencies.json()
        if (!dependenciesData) {
          throw new Error('No dependencies found')
        }
        setDependencies(dependenciesData)
        
       
        setIsLoading(false)
      } catch (err) {
        setError('Failed to fetch tasks')
        setIsLoading(false)
        console.error(err)
      }
    }

    fetchTasks()
  }, [])

  // Calculate critical path
  const calculateCriticalPath = () => {
    // Simple implementation - in a real app, you would use a more sophisticated algorithm
    const criticalPathIds = new Set()
    
    // Find the last task (by end date)
    const lastTask = [...tasks].sort((a, b) => 
      isAfter(b.endDate, a.endDate) ? 1 : -1
    )[0]
    
    if (!lastTask) return []
    
    let currentTask = lastTask
    criticalPathIds.add(currentTask.id)
    
    // Trace backwards through dependencies
    let continueTracing = true
    while (continueTracing) {
      // Find all dependencies where this task is the successor
      const predecessorDeps = dependencies.filter(dep => 
        dep.successorId === currentTask.id
      )
      
      if (predecessorDeps.length === 0) {
        continueTracing = false
      } else {
        // For simplicity, just take the first predecessor
        // In a real app, you would need to calculate the earliest finish time
        const predId = predecessorDeps[0].predecessorId
        criticalPathIds.add(predId)
        
        // Find the predecessor task and continue
        currentTask = tasks.find(t => t.id === predId)
        if (!currentTask) {
          continueTracing = false
        }
      }
    }
    
    return criticalPathIds
  }

  const getTaskById = (id) => {
    return tasks.find(task => task.id === id) || null
  }

  const addTask = async (task) => {
    try {
      // In a real app, this would be an API call
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
      const newTask = await response.json()
      
      // For now, create a new task with a generated ID
      // const newTask = {
      //   ...task,
      //   id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      //   progress: 0
      // }
      
      setTasks([...tasks, newTask])
      return newTask
    } catch (err) {
      setError('Failed to add task')
      console.error(err)
      throw err
    }
  }

  const updateTask = async (updatedTask) => {
    try {
      // In a real app, this would be an API call
      await fetch(`http://localhost:3001/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      })
      
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ))
    } catch (err) {
      setError('Failed to update task')
      console.error(err)
      throw err
    }
  }

  const deleteTask = async (id) => {
    try {
      // In a real app, this would be an API call
      await fetch(`http://localhost:3001/api/tasks/${id}`, { method: 'DELETE' })
      
      // Remove the task
      setTasks(tasks.filter(task => task.id !== id))
      
      // Remove any dependencies involving this task
      setDependencies(dependencies.filter(dep => 
        dep.predecessorId !== id && dep.successorId !== id
      ))
    } catch (err) {
      setError('Failed to delete task')
      console.error(err)
      throw err
    }
  }

  const addDependency = async (predecessorId, successorId) => {
    // Check if dependency already exists
    if (dependencies.some(dep => 
      dep.predecessorId === predecessorId && dep.successorId === successorId
    )) {
      return
    }
    
    try {
      // In a real app, this would be an API call
      const response = await fetch('http://localhost:3001/api/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predecessorId, successorId })
      })
      const newDep = await response.json()
      
      // const newDep = {
      //   id: Math.max(0, ...dependencies.map(d => d.id)) + 1,
      //   predecessorId,
      //   successorId
      // }
      
      setDependencies([...dependencies, newDep])
      
      // Update successor start date if needed
      const predecessor = tasks.find(t => t.id === predecessorId)
      const successor = tasks.find(t => t.id === successorId)
      
      if (predecessor && successor) {
        // If predecessor ends after successor starts, adjust successor start date
        if (isAfter(predecessor.endDate, successor.startDate)) {
          const newStartDate = addDays(predecessor.endDate, 1)
          const duration = Math.round((successor.endDate - successor.startDate) / (1000 * 60 * 60 * 24))
          
          const updatedSuccessor = {
            ...successor,
            startDate: newStartDate,
            endDate: addDays(newStartDate, duration)
          }
          
          setTasks(tasks.map(t => 
            t.id === successorId ? updatedSuccessor : t
          ))
        }
      }
    } catch (err) {
      setError('Failed to add dependency')
      console.error(err)
      throw err
    }
  }

  const removeDependency = async (predecessorId, successorId) => {
    try {
      // In a real app, this would be an API call
      await fetch(`http://localhost:3001/api/dependencies/${depId}`, { method: 'DELETE' })
      
      setDependencies(dependencies.filter(dep => 
        !(dep.predecessorId === predecessorId && dep.successorId === successorId)
      ))
    } catch (err) {
      setError('Failed to remove dependency')
      console.error(err)
      throw err
    }
  }

  const openTaskModal = (task = null) => {
    setCurrentTask(task)
    setIsModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsModalOpen(false)
    setCurrentTask(null)
  }

  const getDependenciesForTask = (taskId) => {
    return {
      predecessors: dependencies
        .filter(dep => dep.successorId === taskId)
        .map(dep => tasks.find(t => t.id === dep.predecessorId))
        .filter(Boolean),
      successors: dependencies
        .filter(dep => dep.predecessorId === taskId)
        .map(dep => tasks.find(t => t.id === dep.successorId))
        .filter(Boolean)
    }
  }
  
  const getTaskStatus = (task) => {
    if (task.progress === 100) return 'completed'
    if (task.progress > 0) return 'in-progress'
    return 'not-started'
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      dependencies,
      isLoading,
      error,
      isModalOpen,
      currentTask,
      getTaskById,
      addTask,
      updateTask,
      deleteTask,
      addDependency,
      removeDependency,
      openTaskModal,
      closeTaskModal,
      getDependenciesForTask,
      calculateCriticalPath,
      getTaskStatus
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}