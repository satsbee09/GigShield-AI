const express  = require('express');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── DEBUG: find broken route file ──
const files = ['./routes/auth.js','./routes/policy.js','./routes/claims.js','./routes/payout.js','./routes/admin.js'];
files.forEach(f => {
  const r = require(f);
  console.log(f, '→', typeof r);
});

// ── ROUTES ──
app.use('/api/auth',   require('./routes/auth.js'));
app.use('/api/policy', require('./routes/policy.js'));
app.use('/api/claims', require('./routes/claims.js'));
app.use('/api/payout', require('./routes/payout.js'));
app.use('/api/admin',  require('./routes/admin.js'));

app.get('/', (req, res) => res.send('🚀 GigShield Backend Running'));

app.listen(5000, () => console.log('🚀 Server running on port 5000'));