# Deployment and Setup Guide

This guide provides step-by-step instructions to configure and execute this project both locally (for testing/development) and on a production Kubernetes cluster via Jenkins.

---

## Prerequisites

Before starting, ensure you have the following installed and configured:
- **Git**: For version control.
- **Docker**: For local image packaging.
- **Kubernetes CLI (`kubectl`)**: Configured with admin access (`kubeconfig`) to your cluster (e.g., EKS or Minikube).
- **Jenkins Server**: With Docker, SonarQube Scanner, and Kubernetes CLI plugins installed.
- **SonarQube Server**: For static code analysis.

---

## Local Development (Docker Compose)

The easiest way to test the 3-tier setup locally is using the included `docker-compose.yml`.

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Aswinvtk/enterprise-cicd-app.git
   cd enterprise-cicd-app
   ```

2. **Start the Containers**:
   ```bash
   docker compose up -d --build
   ```

3. **Verify running containers**:
   ```bash
   docker compose ps
   ```

4. **Access the Application**:
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - Frontend UI: [http://localhost:8080](http://localhost:8080)

5. **Stop the environment**:
   ```bash
   docker compose down
   ```

---

## Jenkins Server Configuration

To execute the Jenkins CI/CD pipeline, the Jenkins controller needs to be integrated with Docker, SonarQube, and the Kubernetes cluster.

### 1. Configure Jenkins Credentials
Add the following credentials in the Jenkins Dashboard under **Manage Jenkins** -> **Credentials**:
- **Docker Hub Credentials**:
  - Type: *Username with password*
  - ID: `dockerhub-credentials`
  - Username: Your Docker Hub username (e.g., `aswinvtk97`)
  - Password: Your Docker Hub Access Token/Password.
- **SonarQube Token**:
  - Type: *Secret text*
  - ID: `sonarqube-token`
  - Secret: Generated token from your SonarQube user account.

### 2. Configure Global Tool Configurations
- **SonarQube Scanner**:
  - Go to **Manage Jenkins** -> **Tools**.
  - Under **SonarQube Scanner installations**, click **Add SonarQube Scanner**.
  - Name it precisely: `SonarQube Scanner` (matching the `Jenkinsfile` reference).
  - Select *Install automatically* from Maven Central.

### 3. Link SonarQube Server
- Go to **Manage Jenkins** -> **System**.
- Under **SonarQube servers**, click **Add SonarQube**.
- Name: `SonarQube` (matching the `Jenkinsfile` reference).
- Server URL: Your SonarQube instance URL (e.g., `http://10.0.0.X:9000`).
- Server authentication token: Select the `sonarqube-token` secret text created earlier.

---

## Kubernetes Cluster Initialization

Before running the pipeline, set up the namespace on the target Kubernetes cluster:

1. **Create Namespace**:
   ```bash
   kubectl create namespace enterprise-cicd
   ```

2. **Verify target context**:
   Ensure `kubectl` running on your Jenkins build agent is authenticated to the target cluster:
   ```bash
   kubectl config current-context
   ```

---

## Running the Pipeline

1. **Create Jenkins Job**:
   - Click **New Item** on Jenkins Home.
   - Select **Pipeline** and name it `enterprise-cicd-pipeline`.
2. **Define SCM Source**:
   - In the job configuration under **Pipeline**, select **Pipeline script from SCM**.
   - SCM: **Git**
   - Repository URL: `https://github.com/Aswinvtk/enterprise-cicd-app.git`
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
3. **Trigger Build**:
   - Click **Build Now** to execute the pipeline manually, or configure a **GitHub Webhook** for automatic builds on push.
