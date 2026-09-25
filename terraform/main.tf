# This file now only contains terraform block for backend configuration
# All resources moved to specific files for better organization

#terraform {
#  required_version = ">= 1.5.0"
#
#  backend "s3" {
#    bucket         = "routineops-terraform-state-2025"
#    key            = "infrastructure/terraform.tfstate"
#    region         = "ap-south-1"
#    encrypt        = true
#    dynamodb_table = "routineops-terraform-locks"
#  }
#}
#