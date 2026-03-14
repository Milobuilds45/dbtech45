#!/bin/bash
# Upload YouTube cookies to server /tmp

cat > /tmp/youtube_cookies.txt << 'COOKIES_EOF'
# Netscape HTTP Cookie File
# This is a generated file! Do not edit.

.youtube.com	TRUE	/	TRUE	1805043418	__Secure-1PAPISID	rHD0l0YC6xZURzkM/AJd_gG1v3gP4Qn7k7
.youtube.com	TRUE	/	TRUE	1805043418	__Secure-1PSID	g.a000swhgkGvfuN5l12BZXQHR-6U_f3A5cOGdU6T4QF0NuYFDKe0sMH_wJxFw9B_EqJF6gAi3mgACgYKAcASAQASFQHGX2MiQM4KRX9_CXPzyP6jXH_JiBoVAUF8yKoPsCwRWIo6zWF8RsIiQjYV0076
.youtube.com	TRUE	/	FALSE	1805043418	__Secure-1PSIDCC	AKEyXzXzKwrVT5SqXoLNf8wnqgkOBHO1FCsqR-HEVBj2l6Y0a39f7cKFQwljVANdFtaBm_I5
.youtube.com	TRUE	/	TRUE	1805043418	__Secure-1PSIDTS	sidts-CjEBUFGoh3kNb0Ls6r7bHIzc5ABvWtJfTMBDm9EwNTRCJzI2mTPkLvtqiCENKRBhx-f4EAA
.youtube.com	TRUE	/	FALSE	1773529418	__Secure-YEC	Cgt5ZG10Rk9YRzRuWSi-1YK-BjIICgJVUxICZW4%3D
.youtube.com	TRUE	/	TRUE	1805043418	APISID	BzfpuK2H8CpVKkrN/ApglJ0C90NjY02w1N
COOKIES_EOF

echo "Cookies uploaded to /tmp/youtube_cookies.txt"
ls -lh /tmp/youtube_cookies.txt
