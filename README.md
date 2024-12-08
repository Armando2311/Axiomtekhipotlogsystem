# Hipot Logs System

A web application for managing and storing work orders and test logs.

## Features

- User authentication
- Create and manage work orders
- Generate PDF reports
- View and download test logs
- Secure API endpoints
- Cross-platform compatibility

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Nginx (v1.24.0 or later)
- SQLite3

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Armando2311/Axiomtekhipotlogsystem.git
cd Axiomtekhipotlogsystem
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install and Configure Nginx

1. Download Nginx for Windows from: http://nginx.org/en/download.html
2. Extract to a location (e.g., `C:\nginx`)
3. Create/update `nginx.conf` in your project root with the following content:

```nginx
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    # Increase buffer sizes and timeouts for large requests
    client_max_body_size 50M;
    client_body_buffer_size 50M;
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    server {
        listen       8080;
        server_name  localhost;

        # Frontend
        location / {
            proxy_pass http://localhost:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        }

        # Backend API
        location /api/ {
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://localhost:3002;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # CORS headers
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

            # Handle OPTIONS requests
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
                add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
        }
    }
}
```

4. Copy this `nginx.conf` to your Nginx installation directory

### 4. Start the Services

1. Start Nginx:
```bash
# Navigate to Nginx directory
cd C:\nginx
# Start Nginx
nginx.exe
```

2. Start the Backend:
```bash
# In project directory
node server.js
```

3. Start the Frontend:
```bash
# In project directory
npm run dev
```

### 5. Access the Application

1. Open your browser and navigate to:
```
http://localhost:8080
```

2. Log in with default credentials:
- Username: admin
- Password: admin

## Network Access

### Local Network Access

To allow other computers on your local network to access the application:

1. Find your computer's IP address:
```bash
ipconfig
```

2. Update `nginx.conf` server_name to include your IP:
```nginx
server_name localhost 192.168.x.x;
```

3. Open Windows Firewall ports:
```bash
# Run Command Prompt as Administrator
netsh advfirewall firewall add rule name="Hipot_Nginx" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Hipot_Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Hipot_Backend" dir=in action=allow protocol=TCP localport=3002
```

4. Access from other computers using:
```
http://192.168.x.x:8080
```

## Troubleshooting

### Common Issues

1. **404 Not Found**: Make sure all services are running and Nginx is configured correctly
2. **CORS Errors**: Check Nginx CORS headers configuration
3. **Large File Upload Errors**: Verify client_max_body_size in nginx.conf
4. **Authentication Errors**: Ensure the database file exists and has the admin user

### Service Management

To stop services:

1. Stop Nginx:
```bash
# Run Command Prompt as Administrator
taskkill /F /IM nginx.exe
```

2. Stop Node processes:
```bash
taskkill /F /IM node.exe
```

## License

This project is licensed under the MIT License.
