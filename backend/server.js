require('dotenv').config({ quiet: true });
const app = require('./app');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});