pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "dulanga002"
        BACKEND_IMAGE  = "canteen-backend"
        FRONTEND_IMAGE = "canteen-frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/dualangalakshan002/DevOps-Project-Canteen.git'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:latest ./backend
                docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE:latest ./forntend
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh '''
                docker push $DOCKERHUB_USER/$BACKEND_IMAGE:latest
                docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Terraform Init & Apply') {
            agent {
                docker {
                    image 'hashicorp/terraform:1.6'
                    args '-u root:root -v $WORKSPACE/terraform:/workspace'
                    reuseNode true
                }
            }
            steps {
                dir('/workspace') {  // Use the mount inside the container
                    sh '''
                    ls -l
                    terraform --version
                    terraform init
                    terraform apply -auto-approve
                    '''
                }
            }
        }



        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                docker compose down || true
                docker compose pull
                docker compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
