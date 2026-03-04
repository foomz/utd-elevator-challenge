import express from 'express';
import cors from 'cors';
import Elevator from './elevator.js';
import Person from './person.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Shared elevator instance
const elevator = new Elevator();

// ===== REQUEST ENDPOINTS =====

// GET all requests
app.get('/api/requests', (req, res) => {
  res.json(elevator.requests);
});

// POST add person to requests
app.post('/api/requests', (req, res) => {
  const { name, currentFloor, dropOffFloor } = req.body;
  const person = new Person(name, currentFloor, dropOffFloor);
  elevator.requests.push(person);
  res.status(201).json(person);
});

// DELETE person from requests by index
app.delete('/api/requests/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < elevator.requests.length) {
    const removed = elevator.requests.splice(index, 1);
    res.json(removed[0]);
  } else {
    res.status(404).json({ error: 'Request not found' });
  }
});

// ===== RIDERS ENDPOINTS =====

// GET all riders
app.get('/api/riders', (req, res) => {
  res.json(elevator.riders);
});

// POST add person to riders
app.post('/api/riders', (req, res) => {
  const { name, currentFloor, dropOffFloor } = req.body;
  const person = new Person(name, currentFloor, dropOffFloor);
  elevator.riders.push(person);
  res.status(201).json(person);
});

// DELETE person from riders by index
app.delete('/api/riders/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < elevator.riders.length) {
    const removed = elevator.riders.splice(index, 1);
    res.json(removed[0]);
  } else {
    res.status(404).json({ error: 'Rider not found' });
  }
});

// ===== ELEVATOR STATE ENDPOINTS =====

// GET elevator state
app.get('/api/elevator', (req, res) => {
  res.json({
    currentFloor: elevator.currentFloor,
    stops: elevator.stops,
    floorsTraversed: elevator.floorsTraversed
  });
});

// POST dispatch elevator
app.post('/api/elevator/dispatch', (req, res) => {
  elevator.dispatch();
  res.json({
    currentFloor: elevator.currentFloor,
    stops: elevator.stops,
    floorsTraversed: elevator.floorsTraversed
  });
});

// POST reset elevator
app.post('/api/elevator/reset', (req, res) => {
  elevator.reset();
  elevator.requests = [];
  res.json({
    currentFloor: elevator.currentFloor,
    stops: elevator.stops,
    floorsTraversed: elevator.floorsTraversed
  });
});

app.listen(PORT, () => {
  console.log(`Elevator API running on http://localhost:${PORT}`);
});