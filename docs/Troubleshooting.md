# Troubleshooting Guide

This guide compiles common issues encountered in the CI/CD pipeline, Docker environment, or Kubernetes cluster, along with steps to resolve them.

---

## 1. Pipeline Failures

### Issue: SonarQube Scanner Tool Not Found
- **Error in Logs**: `SonarQube Scanner: tool not found` or `Command not found`
- **Cause**: Jenkins cannot resolve the global tool reference named `SonarQube Scanner`.
- **Resolution**:
  1. Go to **Manage Jenkins** -> **Tools**.
  2. Verify that a scanner is configured under **SonarQube Scanner installations**.
  3. Ensure the name matches `SonarQube Scanner` exactly (case-sensitive).

### Issue: Quality Gate Timeout / Hanging Stage
- **Error in Logs**: `Timeout reached after 5 minutes. Aborting pipeline.`
- **Cause**: The SonarQube server is failing to send the analysis webhook result back to the Jenkins server.
- **Resolution**:
  1. In the SonarQube Dashboard, go to **Administration** -> **Configuration** -> **Webhooks**.
  2. Configure a webhook pointing back to Jenkins: `http://<jenkins-url>/sonarqube-webhook/`.
  3. Verify Jenkins is reachable from the SonarQube network.

---

## 2. Docker & Registry Failures

### Issue: Docker Daemon Connection Refused
- **Error in Logs**: `docker: cannot connect to the Docker daemon. Is the docker daemon running?`
- **Cause**: The Jenkins agent user does not have permission to access the Docker socket `/var/run/docker.sock`, or the Docker service is down.
- **Resolution**:
  1. Add the `jenkins` user to the `docker` group on the host:
     ```bash
     sudo usermod -aG docker jenkins
     ```
  2. Restart Jenkins service to apply group changes:
     ```bash
     sudo systemctl restart jenkins
     ```

### Issue: Unauthorized Image Push
- **Error in Logs**: `denied: requested access to the resource is denied`
- **Cause**: Incorrect credentials or invalid target repository namespace.
- **Resolution**:
  1. Double check the `IMAGE_NAME` variable in the `Jenkinsfile`. It must match your Docker Hub user account (e.g. `yourusername/enterprise-cicd-app`).
  2. Verify that the credentials stored under ID `dockerhub-credentials` in Jenkins match your active Docker Hub token.

---

## 3. Kubernetes Runtime Failures

### Issue: Pod Stuck in `ImagePullBackOff` or `ErrImagePull`
- **Error via `kubectl`**: `ErrImagePull` / `ImagePullBackOff`
- **Cause**: Kubernetes worker nodes cannot retrieve the image from Docker Hub.
- **Resolution**:
  1. If the repository is private, verify that the Kubernetes deployment manifest references an `imagePullSecrets` configuration containing Docker Hub credentials.
  2. Ensure the image tag matches the active Jenkins build tag.
  3. Manually pull the image on the worker node to verify availability.

### Issue: Pod Terminated with `OOMKilled` (Exit Code 137)
- **Error via `kubectl`**: `State: Terminated | Reason: OOMKilled`
- **Cause**: The application memory usage exceeded the memory limit defined in `deployment.yaml` (`512Mi`).
- **Resolution**:
  1. Profile the application for memory leaks.
  2. Increase the memory limit in the deployment manifest (e.g. to `1Gi`):
     ```yaml
     resources:
       limits:
         memory: "1Gi"
     ```

### Issue: Pod Stuck in `CrashLoopBackOff`
- **Error via `kubectl`**: `CrashLoopBackOff`
- **Cause**: The Node.js application process is crashing on startup (e.g., missing database connection configuration, environment variable errors).
- **Resolution**:
  1. Fetch logs directly from the crashing container:
     ```bash
     kubectl logs <pod-name> -n enterprise-cicd --previous
     ```
  2. Inspect the returned output to identify syntax or import failures.
