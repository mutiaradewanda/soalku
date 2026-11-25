@echo off
set "MAVEN_BIN=%USERPROFILE%\tools\apache-maven-3.9.16\bin\mvn.cmd"
if exist "%MAVEN_BIN%" (
    call "%MAVEN_BIN%" %*
) else (
    call mvn %*
)
