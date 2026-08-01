# Lessons Learned

This document records the key architectural insights, challenges, and lessons learned during the planning, implementation, and maintenance of the Enterprise CI/CD Platform.

---

## 1. Resource and Cost Optimization on AWS

### Challenge
Deploying a multi-node Kubernetes cluster (Amazon EKS) along with heavy DevOps tools like Jenkins and SonarQube on EC2 instances can quickly hit resource limits and incur significant cloud costs. In our initial deployment, running multiple `t3.medium` instances caused resource constraints on CPU and memory, requiring active cluster deletion to avoid high cloud bills.

### Key Takeaways
- **Right-Sizing Nodes**: EKS system pods (like CoreDNS, kube-proxy, aws-node) consume baseline memory. For heavy workloads like SonarQube analysis, avoid using `t3.micro` or `t2.micro` instances. Instead, use `t3.medium` or compute-optimized spot instances for build runners to manage costs.
- **Auto-Scaling Policy**: Implement cluster auto-scaling and configure Pod disruption budgets so worker nodes spin down to zero when builds are not active.
- **Spot Instances**: Integrate AWS Spot Instances into worker node groups for non-production runs, cutting costs up to 90% compared to On-Demand pricing.

---

## 2. Secrets Management & Code Integrity

### Challenge
Externalizing secrets is standard practice, but it presents a temptation to commit database configurations or API keys directly to Kubernetes manifest files inside the code repository.

### Key Takeaways
- **Zero Credentials in SCM**: Never commit passwords in plain text. Always base64 encode them for temporary Secrets or, preferably, implement integration tools like **External Secrets Operator** with AWS Secrets Manager.
- **Git Guardian**: Set up pre-commit hooks to scan files locally for API keys, passwords, and tokens before push events occur.

---

## 3. Microservice Orchestration and Testing

### Challenge
Testing the complete integration of frontend components, backend APIs, and pipeline workflows can be tedious and expensive if developers need to deploy to an active AWS EKS cluster on every edit.

### Key Takeaways
- **Orchestrate Locally**: Using local orchestration tooling like **Docker Compose** lets developers test identical network flows, environment injection, and service discovery on local machines.
- **Health Checks**: Defining liveness and readiness endpoints `/health` early is critical. Without them, Kubernetes cannot accurately manage rolling restarts, occasionally causing downtime during deployments of unstable code.
