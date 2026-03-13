import browser_cookie3
import http.cookiejar

try:
    cj = browser_cookie3.chrome(domain_name='.youtube.com')
    with open('dbtech45-milo/youtube_cookies.txt', 'w') as f:
        f.write('# Netscape HTTP Cookie File\n')
        for cookie in cj:
            domain = cookie.domain
            flag = 'TRUE' if domain.startswith('.') else 'FALSE'
            path = cookie.path
            secure = 'TRUE' if cookie.secure else 'FALSE'
            expires = str(int(cookie.expires)) if cookie.expires else '0'
            f.write(f"{domain}\t{flag}\t{path}\t{secure}\t{expires}\t{cookie.name}\t{cookie.value}\n")
    print('Cookies saved!')
except Exception as e:
    print(f'Error: {e}')