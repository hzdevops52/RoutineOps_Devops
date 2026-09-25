# backend.tf - Bootstrap mode (no remote state yet)

terraform {
  required_version = ">= 1.5.0"
  # No backend block - uses local state temporarily
}

# S3 bucket for state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "routineops-terraform-state-2025"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "Terraform State"
    Environment = "shared"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# DynamoDB for locking (legacy method - still works)
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "routineops-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform Lock Table"
    Environment = "shared"
  }
}