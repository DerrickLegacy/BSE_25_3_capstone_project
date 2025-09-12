# Build steps
📋 Required Build Steps:

📦 1. Install Dependencies
🔹 Backend
npm ci

🔹 Frontend (inside client/)
npm ci

⏳ 2. Wait for MySQL to Initialize
sleep 15

✅ 3. Run Tests
🔹 Backend
npm test

🔹 Frontend (inside client/)
npm test

🔍 4. Run Linting (Code Quality Checks)
🔹 Backend
npm run lint

🔹 Frontend (inside client/)
npm run lint

🏗️ 5. Build Frontend
🔹 Inside client/ folder
npm run build