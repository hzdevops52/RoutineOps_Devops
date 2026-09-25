# EKS Infrastructure Deployment - Troubleshooting Guide

This document captures all the issues encountered during the deployment of the RoutineOps EKS infrastructure using Terraform and the solutions implemented.

## Overview
- **Cluster**: routineops-dev-eks (v1.30)
- **Region**: ap-south-1
- **Nodes**: 4 (2 general + 2 spot instances)
- **Tools**: Terraform, AWS EKS, Helm, kubectl

---

## Issues & Solutions

### 1. EBS CSI Driver Add-on Timeout

**Problem:**
The `aws-ebs-csi-driver` EKS add-on repeatedly timed out after 20 minutes, stuck in `CREATING` state.

```bash
Error: waiting for EKS Add-On (routineops-dev-eks:aws-ebs-csi-driver) create: 
timeout while waiting for state to become 'ACTIVE' (last state: 'CREATING', timeout: 20m0s)
```

**Root Cause:**
- Initial attempt lacked proper IRSA (IAM Roles for Service Accounts) configuration
- Cluster networking/NAT Gateway was still being established during first attempt
- The add-on was created at 10:12 AM but remained stuck for 6+ hours

**Solution:**
1. Deleted the stuck add-on via AWS CLI:
   ```bash
   aws eks delete-addon \
     --cluster-name routineops-dev-eks \
     --addon-name aws-ebs-csi-driver \
     --region ap-south-1
   ```

2. Removed from Terraform state:
   ```bash
   terraform state rm 'module.eks.aws_eks_addon.this["aws-ebs-csi-driver"]'
   ```

3. Created proper IRSA module:
   ```hcl
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
   }
   ```

4. Added timeout configuration:
   ```hcl
   timeouts {
     create = "30m"
     update = "30m"
   }
   ```

**Status:** Resolved by removing the stuck add-on and recreating with proper IRSA.

---

### 2. kubectl Access Forbidden (RBAC Issues)

**Problem:**
After cluster creation, kubectl commands returned permission errors despite successful AWS authentication:

```bash
Error from server (Forbidden): nodes is forbidden: 
User "arn:aws:iam::914242301484:user/bmw" cannot list resource "nodes" in API group "" at the cluster scope
```

**Root Cause:**
- The EKS module v20+ migrated from `aws-auth` ConfigMap to Access Entries API
- The access policy association was not created due to duplicate entry conflict earlier
- User had authentication but no authorization

**Solution:**
1. Fixed Terraform configuration to use proper access_entries syntax:
   ```hcl
   access_entries = {
     bmw = {
       principal_arn = "arn:aws:iam::914242301484:user/bmw"
       type          = "STANDARD"
       kubernetes_groups = ["system:masters"]
       
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
   ```

2. Removed duplicate `cluster_creator` access entry that was causing conflicts

3. Applied the access policy association:
   ```bash
   terraform apply -target=module.eks.aws_eks_access_policy_association.this["bmw_admin"]
   ```

**Status:** Resolved - kubectl now works with full admin access.

---

### 3. Terraform Module Version Compatibility

**Problem:**
Terraform apply failed with unsupported argument errors:

```bash
Error: Unsupported argument
  on eks.tf line 21, in module "eks":
  21:   manage_aws_auth_configmap = true
An argument named "manage_aws_auth_configmap" is not expected here.
```

**Root Cause:**
- Upgraded to EKS module v20.0+ which removed `manage_aws_auth_configmap` and `aws_auth_users` arguments
- These were deprecated in v19 and removed in v20

**Solution:**
Migrated to the new Access Entries API:

**Before (v19):**
```hcl
manage_aws_auth_configmap = true
aws_auth_users = [
  {
    userarn  = "arn:aws:iam::914242301484:user/bmw"
    username = "bmw"
    groups   = ["system:masters"]
  }
]
```

**After (v20):**
```hcl
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
```

**Status:** Resolved - configuration now compatible with module v20+.

---

### 4. Helm Chart Repository Timeouts

**Problem:**
Helm commands consistently timed out when trying to reach chart repositories:

```bash
Error: looks like "https://charts.jenkins.io" is not a valid chart repository or cannot be reached: 
dial tcp: lookup charts.jenkins.io on 1.1.1.1:53: read udp ... i/o timeout
```

**Root Cause:**
- WSL (Windows Subsystem for Linux) DNS resolution issues
- Default DNS server (1.1.1.1) was unreachable or slow
- Corporate firewall/VPN interference

**Solution:**
1. Fixed WSL DNS by updating `/etc/resolv.conf`:
   ```bash
   sudo rm -f /etc/resolv.conf
   echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
   sudo chattr +i /etc/resolv.conf  # Prevent WSL from overwriting
   ```

2. Created `/etc/wsl.conf` to disable auto-generation:
   ```ini
   [network]
   generateResolvConf = false
   ```

3. Alternative: Used local chart files when network was unreliable:
   ```bash
   helm pull bitnami/nginx --version 15.4.3 -d ./charts
   ```

**Status:** Intermittent - works after DNS fix but may require retry.

---

### 5. NGINX Ingress Controller Conflict

**Problem:**
Installing NGINX Ingress via Helm failed due to existing resources:

```bash
Error: Unable to continue with install: IngressClass "nginx" in namespace "" exists and cannot be imported...
label validation error: missing key "app.kubernetes.io/managed-by": must be set to "Helm"
```

**Root Cause:**
- An IngressClass "nginx" was already created by EKS addons (likely vpc-cni or kube-proxy)
- Helm couldn't adopt it because it lacked Helm ownership labels and annotations
- Two NGINX controllers were running simultaneously

**Solution:**
**Option A - Adopt Existing Resource (Recommended):**
```bash
kubectl label ingressclass nginx app.kubernetes.io/managed-by=Helm
kubectl annotate ingressclass nginx meta.helm.sh/release-name=nginx-ingress
kubectl annotate ingressclass nginx meta.helm.sh/release-namespace=ingress-nginx

# Then install Helm chart
helm upgrade --install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

**Option B - Delete and Recreate:**
```bash
kubectl delete ingressclass nginx
helm upgrade --install nginx-ingress ingress-nginx/ingress-nginx ...
```

**Status:** Resolved by adopting the existing IngressClass. Two LoadBalancers are now active.

---

### 6. DNS Resolution for Local Domains (.local)

**Problem:**
Browser couldn't access Grafana/Prometheus via configured domains:

```
DNS_PROBE_FINISHED_NXDOMAIN
This site can't be reached: prometheus.routineops.local
```

**Root Cause:**
- `.local` domains don't exist in public DNS
- Configured domain `routineops.local` has no DNS records
- No local hosts file entries configured

**Solution:**
**Option 1 - Use LoadBalancer URL Directly:**
```bash
export LB_URL=$(kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "http://$LB_URL"
# Result: http://afede67278f384a1294da8a0871f3831-06e64a7b6c918cf2.elb.ap-south-1.amazonaws.com
```

**Option 2 - Use nip.io (Wildcard DNS):**
Change domain to use NAT Gateway IP:
```hcl
domain_name = "routineops.52.66.148.6.nip.io"
# Access: http://grafana.routineops.52.66.148.6.nip.io
```

**Option 3 - Windows Hosts File:**
Edit `C:\Windows\System32\drivers\etc\hosts`:
```
52.66.148.6  prometheus.routineops.local grafana.routineops.local jenkins.routineops.local
```

**Status:** Worked around by using LoadBalancer URLs and port-forwarding for local access.

---

### 7. Port Forwarding Conflicts

**Problem:**
kubectl port-forward failed because port 3000 was already in use:

```bash
Unable to listen on port 3000: Listeners failed to create with the following errors: 
[unable to create listener: Error listen tcp4 127.0.0.1:3000: bind: address already in use]
```

**Solution:**
Use a different local port:
```bash
# Use port 8080 instead of 3000
kubectl port-forward svc/prometheus-grafana 8080:80 -n monitoring

# Access via: http://localhost:8080
```

**Status:** Resolved - using alternative ports for local access.

---

### 8. Terraform State Drift and Deposed Objects

**Problem:**
Terraform showed "deposed objects" and failed to clean up properly:

```bash
module.eks.time_sleep.this[0] (deposed object 0929bd38): Refreshing state...
```

**Root Cause:**
- Previous failed applies left orphaned resources in state
- Partial creation of resources caused inconsistencies

**Solution:**
1. Cleaned up deposed objects:
   ```bash
   terraform state rm 'module.eks.time_sleep.this[0]'
   ```

2. Used targeted applies to fix specific resources:
   ```bash
   terraform apply -target=module.eks -target=module.ebs_csi_irsa
   ```

3. Manually removed stuck AWS resources via CLI, then re-imported to Terraform

**Status:** Resolved - state cleaned up and synchronized.

---

## Final Architecture

### Infrastructure
- **VPC**: 3 AZs with public/private subnets
- **NAT Gateways**: 3 (one per AZ) - all active with Elastic IPs
- **EKS**: Version 1.30, public + private endpoint access
- **Node Groups**: 
  - General: 2x t3.medium (on-demand)
  - Spot: 2x t3.medium/t3a.medium/t2.medium (mixed)
- **Add-ons**: CoreDNS, kube-proxy, vpc-cni (aws-ebs-csi-driver removed temporarily)

### Networking
- **Ingress Controller**: NGINX (2 LoadBalancers active)
- **DNS**: Currently using AWS ELB URLs directly
- **Domain**: routineops.local (requires hosts file or DNS setup)

### Monitoring
- **Prometheus**: kube-prometheus-stack v0.89.0
- **Grafana**: v11.x (admin password retrieved from secrets)
- **Node Exporters**: Running on all 4 nodes

### Access Control
- **Authentication**: IAM user `bmw` with Access Entry
- **Authorization**: AmazonEKSClusterAdminPolicy (cluster-wide)
- **Legacy**: aws-auth ConfigMap not used (v20+ module)

---

## Commands Reference

### kubectl Access
```bash
aws eks update-kubeconfig --region ap-south-1 --name routineops-dev-eks
kubectl get nodes
```

### Grafana Access
```bash
# Get password
kubectl get secret --namespace monitoring prometheus-grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Port-forward
kubectl port-forward svc/prometheus-grafana 8080:80 -n monitoring
# URL: http://localhost:8080 (admin/<password>)
```

### LoadBalancer URLs
```bash
# Primary
http://afede67278f384a1294da8a0871f3831-06e64a7b6c918cf2.elb.ap-south-1.amazonaws.com

# Secondary
http://a06f182a81a684c26809fc33c719afaa-6f27fa0ebdd2264a.elb.ap-south-1.amazonaws.com
```

### Terraform Operations
```bash
# Plan specific resources
terraform plan -target=helm_release.microservices

# Clean up state
terraform state rm 'module.eks.aws_eks_addon.this["aws-ebs-csi-driver"]'

# Apply with auto-approve
terraform apply -target=module.eks -auto-approve
```

---

## Recommendations

1. **EBS CSI Driver**: Re-add once cluster is fully stable using explicit Terraform resource with timeouts
2. **Domain**: Set up proper DNS records or migrate to nip.io for automatic resolution
3. **WSL DNS**: Monitor DNS issues; consider using WSL2 with proper network configuration
4. **Ingress**: Consolidate to single NGINX controller (currently have 2)
5. **Monitoring**: Configure Alertmanager for production alerting
6. **Security**: Rotate Grafana admin password and store in AWS Secrets Manager

---

## Lessons Learned

1. **EKS Module v20+ Migration**: Always check breaking changes when upgrading Terraform modules
2. **IRSA Configuration**: EBS CSI driver requires explicit service account role; won't work without it
3. **Access Entries**: Newer EKS clusters should use Access Entries API instead of aws-auth ConfigMap
4. **WSL Networking**: Windows DNS often requires manual configuration for reliable operation
5. **Helm Timeouts**: Increase default timeouts (5m) to 10m+ for large charts like kube-prometheus-stack
6. **IngressClass Conflicts**: Check for existing resources before Helm install; adopt rather than fight them
```

This README captures all the major issues you faced today - from the EBS CSI driver timeouts and Terraform version compatibility to the WSL DNS issues and Ingress conflicts. You can save this as `TROUBLESHOOTING.md` or add it to your main README.
