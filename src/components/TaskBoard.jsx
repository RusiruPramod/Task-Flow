import React from 'react'
import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import TaskList from './TaskList'
import { motion } from 'framer-motion'
import { DragDropContext } from '@hello-pangea/dnd'

function TaskBoard() {
  const { tasks, updateTask } = useTasks()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('startDate')

  // Group tasks by status
  const tasksByStatus = {
    'not-started': tasks.filter(task => task.status === 'not-started'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    'completed': tasks.filter(task => task.status === 'completed')
  }

  // Apply filtering
  if (filter !== 'all') {
    Object.keys(tasksByStatus).forEach(status => {
      tasksByStatus[status] = tasksByStatus[status].filter(task => 
        task.priority === filter
      )
    })
  }

  // Apply sorting
  const getSortedTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      if (sort === 'startDate') {
        return new Date(a.startDate) - new Date(b.startDate)
      } else if (sort === 'endDate') {
        return new Date(a.endDate) - new Date(b.endDate)
      } else if (sort === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return 0
    })
  }

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    // If the task was dropped outside a droppable area
    if (!destination) {
      return
    }

    // If the task was dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Find the task that was dragged
    const taskId = parseInt(draggableId.split('-')[1])
    const task = tasks.find(t => t.id === taskId)

    if (!task) return

    // Update the task status based on the destination droppable
    const newStatus = destination.droppableId
    const updatedTask = { ...task, status: newStatus }
    updateTask(updatedTask)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-neutral-900 mb-4 md:mb-0"
        >
          Task Board
        </motion.h2>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-select"
          >
            <option value="startDate">Sort by Start Date</option>
            <option value="endDate">Sort by End Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          <TaskList 
            title="Not Started" 
            status="not-started" 
            tasks={getSortedTasks(tasksByStatus['not-started'])} 
          />
          
          <TaskList 
            title="In Progress" 
            status="in-progress" 
            tasks={getSortedTasks(tasksByStatus['in-progress'])} 
          />
          
          <TaskList 
            title="Completed" 
            status="completed" 
            tasks={getSortedTasks(tasksByStatus['completed'])} 
          />
        </div>
      </DragDropContext>
    </div>
  )
}

export default TaskBoard