# AI-Powered Financial & LinkedIn Data Pipeline using ELK, Spark, OpenCV, MongoDB & Postgres

## Setup Instructions for WSL2 and Docker Desktop

### 1. Enable WSL2 on Windows
#### **Step 1: Enable WSL (Windows Subsystem for Linux)**
Open **PowerShell as Administrator** and run:
```powershell
wsl --install
```
This will install WSL with Ubuntu as the default distribution.

#### **Step 2: Set WSL2 as the Default Version**
Run the following command:
```powershell
wsl --set-default-version 2
```

#### **Step 3: Install a Linux Distribution**
If Ubuntu was not installed automatically, you can install it manually:
```powershell
wsl --install -d Ubuntu
```
Alternatively, install your preferred Linux distribution from the **Microsoft Store**.

#### **Step 4: Verify Installation**
Run:
```powershell
wsl --list --verbose
```
Ensure your distribution is using WSL2.

### 2. Install Docker Desktop with WSL2 Backend
#### **Step 1: Download Docker Desktop**
Download Docker Desktop from the official website: [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### **Step 2: Install Docker Desktop**
1. Run the downloaded installer.
2. During installation, **enable WSL2 backend**.
3. Complete the installation and restart your system if required.

#### **Step 3: Configure Docker to Use WSL2**
1. Open Docker Desktop.
2. Go to **Settings > General** and enable **Use the WSL 2 based engine**.
3. Navigate to **Resources > WSL Integration**, and enable Docker integration for your installed Linux distribution.

#### **Step 4: Verify Docker Installation**
Open **Ubuntu (WSL2)** and run:
```bash
docker --version
docker run hello-world
```
If successful, Docker is correctly installed and integrated with WSL2.

### 3. Additional Configuration (Optional)
#### **Install Docker Compose**
Run the following in WSL2:
```bash
sudo apt update && sudo apt install docker-compose -y
```
Verify installation:
```bash
docker-compose --version
```

#### **Ensure User Permissions**
To run Docker without `sudo`, add your user to the Docker group:
```bash
sudo usermod -aG docker $USER
exec sudo su -l $USER
```

### 4. Running Docker in Your Project
Now you can run your project’s containers using Docker:
```bash
docker-compose up -d
```
This will start the required services for **ELK, Spark, OpenCV, MongoDB, and Postgres**.

### Troubleshooting
- If Docker commands fail, restart Docker Desktop and try again.
- If WSL2 is not working properly, ensure it's updated by running:
```powershell
wsl --update
```
- Ensure virtualization is enabled in your BIOS.

### 5. Setup for ELK Stack and Elasticsearch
#### **Step 1: Pull and Run Elasticsearch using Docker**
```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.0.0
```
Start Elasticsearch container:
```bash
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.0.0
```

#### **Step 2: Verify Elasticsearch Installation**
Run:
```bash
curl -X GET "localhost:9200/_cluster/health?pretty"
```

#### **Step 3: Install and Start Kibana**
```bash
docker pull docker.elastic.co/kibana/kibana:8.0.0
```
Run Kibana:
```bash
docker run -d --name kibana -p 5601:5601 --link elasticsearch docker.elastic.co/kibana/kibana:8.0.0
```

### 6. Setup for Hadoop and Apache Spark
#### **Step 1: Install Hadoop**
Run the following commands to install Hadoop:
```bash
sudo apt update
sudo apt install openjdk-8-jdk -y
wget https://downloads.apache.org/hadoop/common/hadoop-3.3.1/hadoop-3.3.1.tar.gz
tar -xvzf hadoop-3.3.1.tar.gz
sudo mv hadoop-3.3.1 /usr/local/hadoop
```

#### **Step 2: Configure Hadoop Environment Variables**
Edit `~/.bashrc` and add:
```bash
export HADOOP_HOME=/usr/local/hadoop
export PATH=$PATH:$HADOOP_HOME/bin
```
Reload the configuration:
```bash
source ~/.bashrc
```

#### **Step 3: Install Apache Spark**
```bash
wget https://downloads.apache.org/spark/spark-3.1.2/spark-3.1.2-bin-hadoop3.2.tgz
tar -xvzf spark-3.1.2-bin-hadoop3.2.tgz
sudo mv spark-3.1.2-bin-hadoop3.2 /usr/local/spark
```

#### **Step 4: Configure Spark Environment Variables**
Edit `~/.bashrc` and add:
```bash
export SPARK_HOME=/usr/local/spark
export PATH=$PATH:$SPARK_HOME/bin
```
Reload the configuration:
```bash
source ~/.bashrc
```

#### **Step 5: Verify Hadoop and Spark Installation**
```bash
hadoop version
spark-shell --version
```

### 7. Setup for Python Environment
#### **Step 1: Install Node.js and npm**
Install Node.js and npm using:
```bash
sudo apt update
sudo apt install nodejs npm -y
```

#### **Step 2: Install Python Dependencies**
Ensure Python and pip are installed:
```bash
sudo apt install python3 python3-pip -y
```
Then install required Python libraries:
```bash
pip install numpy openpyxl opencv-python pandas
```

### Conclusion
Your environment is now set up with **WSL2, Docker Desktop, ELK Stack, Elasticsearch, Hadoop, Apache Spark, and Python**, ready for developing and deploying the **AI-Powered Financial & LinkedIn Data Pipeline**. 🚀

