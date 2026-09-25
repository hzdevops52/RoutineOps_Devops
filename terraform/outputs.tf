output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS control plane"
  value       = module.eks.cluster_security_group_id
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN for IRSA"
  value       = module.eks.oidc_provider_arn
}

output "ecr_repository_urls" {
  description = "URLs of ECR repositories"
  value = {
    backend  = aws_ecr_repository.backend.repository_url
    frontend = aws_ecr_repository.frontend.repository_url
  }
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "grafana_url" {
  description = "Grafana URL"
  value       = "https://grafana.${local.domain_name}"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "https://prometheus.${local.domain_name}"
}

output "jenkins_url" {
  description = "Jenkins URL"
  value       = "https://jenkins.${local.domain_name}"
}
