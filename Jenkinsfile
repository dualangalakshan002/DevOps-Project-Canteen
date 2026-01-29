pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "dulanga002"
        BACKEND_IMAGE  = "canteen-backend"
        FRONTEND_IMAGE = "canteen-frontend"
        ORACLE_VM_IP   = "129.159.225.108"
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
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                sh '''
                docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:latest ./backend
                docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE:latest ./frontend
                docker push $DOCKERHUB_USER/$BACKEND_IMAGE:latest
                docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy to Oracle VM') {
            steps {
                // This uses the SSH Agent plugin to securely use your oracle.key
                sshagent(['oracle-vm-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@$ORACLE_VM_IP "
                        docker pull $DOCKERHUB_USER/$BACKEND_IMAGE:latest &&
                        docker pull $DOCKERHUB_USER/$FRONTEND_IMAGE:latest &&
                        # Move to your project directory on the VM and restart containers
                        cd ~/canteen-app && 
                        docker compose down || true &&
                        docker compose up -d
                    "
                    '''
                }
            }
        }
    }

    post {
        success { echo "✅ Deployment successful!" }
        failure { echo "❌ Pipeline failed" }
    }
}