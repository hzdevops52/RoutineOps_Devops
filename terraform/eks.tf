module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = local.cluster_name
  cluster_version = var.kubernetes_version

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id                   = aws_vpc.this.id
  subnet_ids               = aws_subnet.private[*].id
  control_plane_subnet_ids = aws_subnet.private[*].id

  create_cluster_security_group = false
  create_node_security_group    = false
  cluster_security_group_id     = aws_security_group.eks_cluster.id

  # ✅ FIXED: Only one access entry, no duplicate
  access_entries = {
    bmw = {
      principal_arn = "arn:aws:iam::914242301484:user/bmw"
      type          = "STANDARD"
      
      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = {
            type = "cluster"
          }
        }
      }
    }
  }

  eks_managed_node_groups = {
    general = {
      name           = "${local.naming_prefix}-general"
      instance_types = var.node_instance_types
      min_size       = var.node_min_size
      max_size       = var.node_max_size
      desired_size   = var.node_desired_size
      iam_role_arn   = aws_iam_role.eks_nodes.arn

      labels = {
        workload = "general"
      }

      tags = local.common_tags
    }

    spot = {
      name           = "${local.naming_prefix}-spot"
      instance_types = ["t3.medium", "t3a.medium", "t2.medium"]
      capacity_type  = "SPOT"
      min_size       = 0
      max_size       = 5
      desired_size   = 2
      iam_role_arn   = aws_iam_role.eks_nodes.arn

      labels = {
        workload = "spot"
      }

      taints = [{
        key    = "spot"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]

      tags = local.common_tags
    }
  }

  # ✅ FIXED: Removed EBS CSI driver for now (add back after networking verified)
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    # aws-ebs-csi-driver = {
    #   most_recent              = true
    #   service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    # }
  }

  enable_irsa = true
  tags        = local.common_tags
}

# Keep this module for when we add EBS CSI back later
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name             = "${local.naming_prefix}-ebs-csi-role"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = local.common_tags
}

data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}