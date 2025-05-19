import structureRouter from './routes/structure.js';
import departmentsRouter from './routes/departments.js';
import employeesRouter from './routes/employees.js';
import positionsRouter from './routes/positions.js';
import usersRouter from './routes/users.js';

app.use('/api/structure', structureRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/positions', positionsRouter); 
app.use('/api/users', usersRouter); 