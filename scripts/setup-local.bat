@ECHO OFF
REM Creates a local folder and clones the Flipper dashboard app.
REM Usage: scripts\setup-local.bat [destination]
REM Example: scripts\setup-local.bat C:\Projects\flipper-dashboard

SET REPO_URL=https://github.com/wildetesting/BrainComputerInterface.git
SET BRANCH=cursor/flipper-dashboard-555c

IF "%~1"=="" (
  SET DEST=%USERPROFILE%\flipper-dashboard
) ELSE (
  SET DEST=%~1
)

ECHO Creating folder: %DEST%
IF NOT EXIST "%DEST%" mkdir "%DEST%"

IF EXIST "%DEST%\.git" (
  ECHO Git repo already exists at %DEST%
  cd /d "%DEST%"
  git fetch origin
  git checkout %BRANCH%
  git pull origin %BRANCH%
) ELSE (
  ECHO Cloning %REPO_URL%
  git clone --branch %BRANCH% %REPO_URL% "%DEST%"
  cd /d "%DEST%"
)

ECHO Installing dependencies...
call npm install

ECHO.
ECHO Done! App folder: %DEST%
ECHO.
ECHO Start the app:
ECHO   cd %DEST%
ECHO   npm run dev
ECHO.
ECHO Open in browser:
ECHO   http://localhost:3000
ECHO   http://localhost:3000/guides/sd-card
