@echo off
setlocal EnableDelayedExpansion
for /f "delims=" %%I in ('where.exe node 2^>nul') do (
  call "%%~dpInpx.cmd" %*
  exit /b !ERRORLEVEL!
)
echo [dopservices] npx: node.exe not found on PATH.
exit /b 9009
