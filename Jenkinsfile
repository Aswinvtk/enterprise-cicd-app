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
                    kubectl set image deployment/enterprise-cicd-app \
                    enterprise-cicd-app=${IMAGE_NAME}:${IMAGE_TAG} \
                    -n enterprise-cicd

                    kubectl rollout status deployment/enterprise-cicd-app \
                    -n enterprise-cicd
                '''
            }
        }
