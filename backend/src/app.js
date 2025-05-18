import structureRouter from './routes/structure.js';

// ... other imports and setup ...

app.use('/api/structure', structureRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/positions', positionsRouter); 