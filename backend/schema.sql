CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS financial_data (
  data_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  monthly_income DECIMAL(15, 2) CHECK (monthly_income >= 0),
  monthly_expenses DECIMAL(15, 2) CHECK (monthly_expenses >= 0),
  loan_amount DECIMAL(15, 2) CHECK (loan_amount >= 0),
  interest_rate DECIMAL(5, 2) CHECK (interest_rate >= 0),
  loan_term INTEGER CHECK (loan_term >= 0),
  monthly_contribution DECIMAL(15, 2) CHECK (monthly_contribution >= 0),
  investment_duration INTEGER CHECK (investment_duration >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_user_id ON financial_data(user_id);