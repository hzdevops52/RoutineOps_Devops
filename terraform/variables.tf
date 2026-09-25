# AWS Configuration
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

# EKS Configuration
variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  description = "EC2 instance types for nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 5
}

variable "node_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

# Microservices Configuration - FIXED: Changed values type from map(any) to any
variable "microservices" {
  description = "List of microservices to deploy"
  type = list(object({
    name       = string
    chart      = string
    repository = string
    version    = string
    namespace  = string
    values     = any  # Changed from map(any) to any to allow mixed types
  }))

  default = [
    {
      name       = "backend"
      chart      = "nginx"
      repository = "https://charts.bitnami.com/bitnami"
      version    = "16.0.0"
      namespace  = "routine-app"
      values = {
        replicaCount = 2
        service = {
          type = "ClusterIP"
          port = 80
        }
        ingress = {
          enabled = true
          hostname = "api.routineops.local"
        }
      }
    },
    {
      name       = "frontend"
      chart      = "nginx"
      repository = "https://charts.bitnami.com/bitnami"
      version    = "16.0.0"
      namespace  = "routine-app"
      values = {
        replicaCount = 2
        service = {
          type = "ClusterIP"
          port = 80
        }
        ingress = {
          enabled = true
          hostname = "app.routineops.local"
        }
      }
    }
  ]
}

# Monitoring
variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  sensitive   = true
}

# CI/CD
variable "enable_argocd" {
  description = "Enable ArgoCD installation"
  type        = bool
  default     = false
}

# Docker Hub (for rate limiting)
variable "dockerhub_username" {
  description = "Docker Hub username"
  type        = string
  default     = "abhijitray"
}

variable "dockerhub_token" {
  description = "Docker Hub access token"
  type        = string
  sensitive   = true
}
