import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'
import { motion } from 'framer-motion'

function TaskList({ title, status, tasks }) {
  const getStatusColor = () => {
    switch (status) {
      case 'not-started': return 'bg-neutral-500'
      case 'in-progress': return 'bg-primary-500'
      case 'completed': return 'bg-success-500'
      default: return 'bg-neutral-500'
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-neutral-200" >
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></div>
        <h3 className="font-medium text-lg">{title}</h3>
        <div className="ml-auto bg-neutral-100 text-neutral-700 text-sm font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </div>
      </div>
      
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 ${
              snapshot.isDraggingOver ? 'bg-neutral-50' : ''
            }`}
            style={{ minHeight: '150px' }}
          >
            {tasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center h-full"
              >
                <p className="text-neutral-400 text-center">
                  No tasks in this column
                </p>
              </motion.div>
            ) : (
              <motion.div layout className="space-y-3">
                {tasks.map((task, index) => (
                  <Draggable
                    key={`task-${task.id}`}
                    draggableId={`task-${task.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard 
                          task={task}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </motion.div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default TaskList