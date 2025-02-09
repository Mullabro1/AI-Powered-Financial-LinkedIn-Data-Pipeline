# Setting Up WSL 2 and Installing Docker Desktop on Windows

## Step 1: Enable WSL (Windows Subsystem for Linux)

1. Open **PowerShell** as Administrator and run:
   ```powershell
   wsl --install
   ```
   This will install WSL with Ubuntu as the default distribution.

2. (Optional) If WSL is already installed but not version 2, upgrade it:
   ```powershell
   wsl --set-default-version 2
   ```

## Step 2: Verify WSL Installation

- To check available WSL distributions, run:
  ```powershell
  wsl -l -v
  ```
- If Ubuntu is not installed, you can install it manually:
  ```powershell
  wsl --install -d Ubuntu
  ```

## Step 3: Install Docker Desktop

1. Download Docker Desktop from the official website:
   [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. Run the installer and follow the setup instructions.

3. Ensure **WSL 2 backend** is enabled during installation.

## Step 4: Configure Docker to Use WSL 2

1. Open Docker Desktop.
2. Navigate to **Settings > General**.
3. Enable **Use the WSL 2 based engine**.
4. Go to **Settings > Resources > WSL Integration**.
5. Enable integration with your installed WSL distribution (e.g., Ubuntu).
6. Click **Apply & Restart**.

## Step 5: Verify Docker Installation

- Open WSL (Ubuntu) and run:
  ```bash
  docker --version
  ```
  ```bash
  docker run hello-world
  ```
  If Docker is installed correctly, you will see a success message.

## Step 6: Using Docker with WSL 2

- To start a container:
  ```bash
  docker run -it ubuntu bash
  ```
- To list running containers:
  ```bash
  docker ps
  ```
- To stop Docker services:
  ```bash
  docker stop <container_id>
  ```

## Step 7: Running Database Queries

To start your database services and server, use the following command:
```bash
  docker-compose up -d
  node server.js
```

Once your services are running, you can execute the following SQL queries to retrieve data from the database:
```sql
SELECT * FROM organization;
SELECT * FROM balance_sheet;
SELECT * FROM profit_loss;
SELECT * FROM cash_statements;
SELECT * FROM ratios;
```

## Conclusion
You have successfully installed and configured **WSL 2** and **Docker Desktop** on Windows. Now you can run Linux containers seamlessly within WSL.

For more details, refer to the [official Docker documentation](https://docs.docker.com/desktop/windows/wsl/).

