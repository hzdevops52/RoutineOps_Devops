#!/bin/bash
set -e

echo "Importing EKS resources..."

# Cluster
terraform import module.eks.aws_eks_cluster.this[0] routineops-dev-eks || true

# OIDC
terraform import module.eks.aws_iam_openid_connect_provider.oidc_provider[0] arn:aws:iam::914242301484:oidc-provider/oidc.eks.ap-south-1.amazonaws.com/id/8A53914F689955BF585212959D0A34B0 || true

# Node groups
terraform import 'module.eks.module.eks_managed_node_group["general"].aws_eks_node_group.this[0]' routineops-dev-eks:routineops-dev-general-20260331054620861400000025 || true
terraform import 'module.eks.module.eks_managed_node_group["spot"].aws_eks_node_group.this[0]' routineops-dev-eks:routineops-dev-spot-20260331054620861500000027 || true

# IAM
terraform import aws_iam_role.eks_nodes routineops-dev-node-role || true

# Subnets
terraform import aws_subnet.private[0] subnet-08a826072dc6fb3af || true

echo "Done. Run: terraform plan"