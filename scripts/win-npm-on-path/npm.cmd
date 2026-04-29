@echo off
setlocal EnableDelayedExpansion
for /f "delims=" %%I in ('where.exe node 2^>nul') do (
  call "%%~dpInpm.cmd" %*
  exit /b !ERRORLEVEL!
)
echo [dopservices] npm: node.exe not found on PATH.
exit /b 9009
