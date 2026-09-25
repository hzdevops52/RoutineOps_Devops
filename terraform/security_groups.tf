# EKS Cluster Security Group
resource "aws_security_group" "eks_cluster" {
  name_prefix = "${local.naming_prefix}-cluster-"
  description = "EKS cluster security group"
  vpc_id      = aws_vpc.this.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.naming_prefix}-cluster-sg"
  })
}

resource "aws_security_group_rule" "cluster_inbound" {
  description              = "Allow worker nodes to communicate with the cluster API Server"
  from_port                = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks_cluster.id
  source_security_group_id = aws_security_group.eks_nodes.id
  to_port                  = 443
  type                     = "ingress"
}

# EKS Worker Nodes Security Group
resource "aws_security_group" "eks_nodes" {
  name_prefix = "${local.naming_prefix}-node-"
  description = "EKS worker node security group"
  vpc_id      = aws_vpc.this.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.naming_prefix}-node-sg"
    "kubernetes.io/cluster/${local.cluster_name}" = "owned"
  })
}

resource "aws_security_group_rule" "nodes_internal" {
  description       = "Allow nodes to communicate with each other"
  from_port         = 0
  protocol          = "-1"
  security_group_id = aws_security_group.eks_nodes.id
  self              = true
  to_port           = 65535
  type              = "ingress"
}

resource "aws_security_group_rule" "nodes_cluster_inbound" {
  description              = "Allow worker Kubelets and pods to receive communication from the cluster control plane"
  from_port                = 1025
  protocol                 = "tcp"
  security_group_id        = aws_security_group.eks_nodes.id
  source_security_group_id = aws_security_group.eks_cluster.id
  to_port                  = 65535
  type                     = "ingress"
}

# ALB Security Group for Ingress
resource "aws_security_group" "alb" {
  name_prefix = "${local.naming_prefix}-alb-"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.naming_prefix}-alb-sg"
  })
}
