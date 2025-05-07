import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { format, addDays, isWithinInterval, differenceInDays, isSameDay } from 'date-fns'
import { useTasks } from '../context/TaskContext'
import { motion } from 'framer-motion'

function Timeline() {
  const { tasks, dependencies, calculateCriticalPath } = useTasks()
  const [dateRange, setDateRange] = useState([])
  const [timelineWidth, setTimelineWidth] = useState(0)
  const containerRef = useRef(null)
  const criticalPath = calculateCriticalPath()

  // Create an array of dates for the timeline
  useEffect(() => {
    if (tasks.length === 0) return

    const allDates = tasks.flatMap(task => [
      new Date(task.startDate),
      new Date(task.endDate)
    ])

    const minDate = new Date(Math.min(...allDates))
    const maxDate = new Date(Math.max(...allDates))
    
    // Add some padding to the timeline
    const startDate = addDays(minDate, -2)
    const endDate = addDays(maxDate, 2)
    
    const days = []
    let currentDate = startDate
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate = addDays(currentDate, 1)
    }
    
    setDateRange(days)
  }, [tasks])

  // Update timeline width on window resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setTimelineWidth(containerRef.current.clientWidth)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    
    return () => {
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // Calculate position and width of task bars
  const getTaskPosition = (task) => {
    const startDate = new Date(task.startDate)
    const endDate = new Date(task.endDate)
    
    const startIndex = dateRange.findIndex(date => 
      isSameDay(date, startDate)
    )
    
    const duration = differenceInDays(endDate, startDate) + 1
    
    const dayWidth = 112 // width of day column in pixels
    
    return {
      left: startIndex * dayWidth,
      width: duration * dayWidth - 8, // subtract padding
    }
  }

  // Generate SVG paths for dependency connections
  const getDependencyPath = (predId, succId) => {
    const predecessor = tasks.find(t => t.id === predId)
    const successor = tasks.find(t => t.id === succId)
    
    if (!predecessor || !successor) return null
    
    const predPos = getTaskPosition(predecessor)
    const succPos = getTaskPosition(successor)
    
    // Calculate positions
    const startX = predPos.left + predPos.width
    const startY = tasks.indexOf(predecessor) * 60 + 30 // Y position of predecessor
    const endX = succPos.left
    const endY = tasks.indexOf(successor) * 60 + 30 // Y position of successor
    
    // Create curved path
    const controlPointX = (startX + endX) / 2
    
    return {
      path: `M ${startX} ${startY} C ${controlPointX} ${startY}, ${controlPointX} ${endY}, ${endX} ${endY}`,
      critical: criticalPath.has(predId) && criticalPath.has(succId)
    }
  }

  if (tasks.length === 0 || dateRange.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-neutral-500">No tasks to display on the timeline.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-neutral-900 mb-6"
      >
        Timeline View
      </motion.h2>
      
      <div className="flex-1 overflow-hidden border border-neutral-200 rounded-lg shadow-sm bg-white">
        <div className="timeline-container" ref={containerRef}>
          <div className="timeline-header">
            {dateRange.map((date, index) => (
              <div key={index} className="timeline-day">
                {format(date, 'MMM dd')}
              </div>
            ))}
          </div>
          
          <div className="relative">
            {/* Task bars */}
            {tasks.map((task, index) => {
              const { left, width } = getTaskPosition(task)
              const isCritical = criticalPath.has(task.id)
              
              const taskClass = isCritical 
                ? 'timeline-task-critical' 
                : task.status === 'completed' 
                  ? 'timeline-task-completed' 
                  : 'timeline-task-normal'
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scaleX: 0.5 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`timeline-task ${taskClass}`}
                  style={{
                    left: `${left}px`,
                    top: `${index * 60 + 60}px`,
                    width: `${width}px`,
                  }}
                  title={`${task.title} (${task.progress}% complete)`}
                >
                  {task.title}
                </motion.div>
              )
            })}
            
            {/* SVG for dependency lines */}
            <svg
              width="100%"
              height={tasks.length * 60 + 60}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            >
              {dependencies.map((dep, index) => {
                const pathInfo = getDependencyPath(dep.predecessorId, dep.successorId)
                if (!pathInfo) return null
                
                return (
                  <g key={index}>
                    <path
                      d={pathInfo.path}
                      className={`connection-line ${pathInfo.critical ? 'critical-connection' : ''}`}
                      markerEnd={`url(#arrowhead-${pathInfo.critical ? 'critical' : 'normal'})`}
                    />
                  </g>
                )
              })}
              
              {/* Arrow markers for the lines */}
              <defs>
                <marker
                  id="arrowhead-normal"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    className="connection-arrow"
                  />
                </marker>
                <marker
                  id="arrowhead-critical"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    className="critical-arrow"
                  />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timeline