import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function connectToDatabase() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'task_planner'
    });
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
}

// Database initialization
async function initializeDatabase() {
  try {
    // Create tasks table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('not-started', 'in-progress', 'completed') DEFAULT 'not-started',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        progress INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create dependencies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS dependencies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        predecessor_id INT NOT NULL,
        successor_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (predecessor_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (successor_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE KEY unique_dependency (predecessor_id, successor_id)
      )
    `);
    
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// API Routes
// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM tasks ORDER BY start_date');
    
    // Format dates for client consumption
    const formattedTasks = rows.map(task => ({
      ...task,
      startDate: new Date(task.start_date),
      endDate: new Date(task.end_date)
    }));
    
    res.json(formattedTasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = {
      ...rows[0],
      startDate: rows[0].start_date,
      endDate: rows[0].end_date
    };
    
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
// app.post('/api/tasks', async (req, res) => {
//   try {
//     const { title, description, status, priority, startDate, endDate, progress } = req.body;
    
//     const [result] = await db.execute(
//       `INSERT INTO tasks (title, description, status, priority, start_date, end_date, progress)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [title, description, status, priority, startDate, endDate, progress]
//     );
    
//     const newTask = {
//       id: result.insertId,
//       title,
//       description,
//       status,
//       priority,
//       startDate,
//       endDate,
//       progress
//     };
    
//     res.status(201).json(newTask);
//   } catch (err) {
//     console.error('Error creating task:', err);
//     res.status(500).json({ error: 'Failed to create task' });
//   }
// });
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, startDate, endDate, progress } = req.body;

    // Convert to YYYY-MM-DD format
    const formattedStartDate = startDate.split('T')[0];
    const formattedEndDate = endDate.split('T')[0];

    const [result] = await db.execute(
      `INSERT INTO tasks (title, description, status, priority, start_date, end_date, progress)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, status, priority, formattedStartDate, formattedEndDate, progress]
    );

    const newTask = {
      id: result.insertId,
      title,
      description,
      status,
      priority,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      progress
    };

    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, status, priority, startDate, endDate, progress } = req.body;

    const formattedStartDate = startDate.split('T')[0];
    const formattedEndDate = endDate.split('T')[0];

    await db.execute(
      `UPDATE tasks 
       SET title = ?, description = ?, status = ?, priority = ?, 
           start_date = ?, end_date = ?, progress = ?
       WHERE id = ?`,
      [title, description, status, priority, formattedStartDate, formattedEndDate, progress, req.params.id]
    );

    res.json({
      id: parseInt(req.params.id),
      title,
      description,
      status,
      priority,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      progress
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get all dependencies
app.get('/api/dependencies', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM dependencies');
    
    const formattedDeps = rows.map(dep => ({
      id: dep.id,
      predecessorId: dep.predecessor_id,
      successorId: dep.successor_id
    }));
    
    res.json(formattedDeps);
  } catch (err) {
    console.error('Error fetching dependencies:', err);
    res.status(500).json({ error: 'Failed to fetch dependencies' });
  }
});

// Create a new dependency
app.post('/api/dependencies', async (req, res) => {
  try {
    const { predecessorId, successorId } = req.body;
    
    // Check if dependency already exists
    const [existing] = await db.execute(
      'SELECT * FROM dependencies WHERE predecessor_id = ? AND successor_id = ?',
      [predecessorId, successorId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Dependency already exists' });
    }
    
    // Check for circular dependencies
    // This is a simplified check, a real app would need a more sophisticated algorithm
    const [circular] = await db.execute(
      'SELECT * FROM dependencies WHERE predecessor_id = ? AND successor_id = ?',
      [successorId, predecessorId]
    );
    
    if (circular.length > 0) {
      return res.status(400).json({ error: 'Cannot create circular dependency' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO dependencies (predecessor_id, successor_id) VALUES (?, ?)',
      [predecessorId, successorId]
    );
    
    const newDependency = {
      id: result.insertId,
      predecessorId,
      successorId
    };
    
    res.status(201).json(newDependency);
  } catch (err) {
    console.error('Error creating dependency:', err);
    res.status(500).json({ error: 'Failed to create dependency' });
  }
});

// Delete a dependency
app.delete('/api/dependencies/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM dependencies WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dependency deleted successfully' });
  } catch (err) {
    console.error('Error deleting dependency:', err);
    res.status(500).json({ error: 'Failed to delete dependency' });
  }
});

// Start the server
async function startServer() {
  try {
    await connectToDatabase();
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer();