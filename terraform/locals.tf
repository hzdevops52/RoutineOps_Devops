locals {
  project_name = "routineops"
  environment  = terraform.workspace == "default" ? "dev" : terraform.workspace
  
  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
    # Removed timestamp() - it causes inconsistent plans in Terraform
  }

  naming_prefix = "${local.project_name}-${local.environment}"
  
  # Cluster names
  cluster_name = "${local.naming_prefix}-eks"
  
  # Domain configuration (update with your domain)
  domain_name = "routineops.local"  # Change to your actual domain
  
  # GitHub repository for CI/CD
  github_repo = "https://github.com/abhijitray7810/routineops-platform/tree/main"
}