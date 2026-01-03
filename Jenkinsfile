pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Shreyas7032/html-cicd-project.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t nexus.imcc.com/student/html-cicd:v1 .'
            }
        }

        stage('Push Image to Nexus') {
            steps {
                sh 'docker push nexus.imcc.com/student/html-cicd:v1'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }
}

