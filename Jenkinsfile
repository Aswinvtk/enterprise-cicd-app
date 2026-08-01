pipeline {
    agent any

    // Define environmental configuration for the pipeline execution
    environment {
        // Target Docker repository and dynamic build tags
        IMAGE_NAME = "aswinvtk97/enterprise-cicd-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        // Stage 1: Retrieve project source code from the configured repository
        stage('Checkout') {
            steps {
                echo "Fetching source code from Git repository..."
                checkout scm
            }
        }

        // Stage 2: Perform static analysis using SonarQube Scanner
        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "Initializing SonarQube analysis..."
                    // Resolves the SonarQube Scanner tool defined in Jenkins Global Tool Configuration
                    def scannerHome = tool 'SonarQube Scanner'

                    // Wrap execution in the SonarQube environment context to inject configuration
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }       
	
        // Stage 3: Stop the pipeline if Quality Gate thresholds are not met
        stage('Quality Gate') {
            steps {
                echo "Evaluating SonarQube Quality Gate..."
                // Set a timeout to prevent the pipeline from hanging indefinitely if webhook fails
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // Stage 4: Compile/package the app into a Docker container image
        stage('Build Docker Image') {
            steps {
                echo "Building Docker container image: ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        // Stage 5: Upload the Docker image to the registry (Docker Hub)
        stage('Push Docker Image') {
            steps {
                echo "Logging into Docker Hub and pushing image..."
                // Retrieve Docker credentials securely from Jenkins credential store
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker logout
                    '''
                }
            }
        }

        // Stage 6: Deploy manifests to Kubernetes and verify rollout success
        stage('Deploy to Kubernetes') {
            steps {
                echo "Starting rolling deployment to Kubernetes cluster..."
                sh '''
                    # Apply configurations, secrets, services and deployment manifests
                    kubectl apply -f kubernetes/configmap.yaml
                    kubectl apply -f kubernetes/secret.yaml
                    kubectl apply -f kubernetes/service.yaml
                    kubectl apply -f kubernetes/deployment.yaml

                    # Update the deployment's container image dynamically to trigger a rolling update
                    kubectl set image deployment/enterprise-cicd-app \
                    enterprise-cicd-app=${IMAGE_NAME}:${IMAGE_TAG} \
                    -n enterprise-cicd

                    # Monitor and verify rollout progress, failing the stage if rollout times out or fails
                    kubectl rollout status deployment/enterprise-cicd-app \
                    -n enterprise-cicd
                '''
            }
        }

    }

    // Post-execution triggers to notify team of build status
    post {
        success {
            echo "CI/CD Pipeline execution succeeded. Release version ${IMAGE_TAG} is live."
        }

        failure {
            echo "CI/CD Pipeline execution failed. Please inspect build and scanner logs."
        }
    }
}
