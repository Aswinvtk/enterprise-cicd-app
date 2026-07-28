pipeline {
    agent any

    environment {
        IMAGE_NAME = "aswinvtk97/enterprise-cicd-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube Scanner'

                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }       
	
	 stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push Docker Image') {
            steps {
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

stage('Deploy to Kubernetes') {
    steps {
        sh '''
            kubectl apply -f kubernetes/configmap.yaml
            kubectl apply -f kubernetes/secret.yaml
            kubectl apply -f kubernetes/service.yaml
            kubectl apply -f kubernetes/deployment.yaml

            kubectl set image deployment/enterprise-cicd-app \
            enterprise-cicd-app=${IMAGE_NAME}:${IMAGE_TAG} \
            -n enterprise-cicd

            kubectl rollout status deployment/enterprise-cicd-app \
            -n enterprise-cicd
        '''
    }
}

    }

    post {
        success {
            echo "Pipeline completed successfully."
        }

        failure {
            echo "Pipeline failed."
        }
    }
}
