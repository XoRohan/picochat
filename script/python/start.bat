setlocal
cd python
if "%PORT%"=="" set PORT=3001
call .venv\Scripts\python -m uvicorn main:app --port %PORT%
