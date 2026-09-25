# Prometheus Stack (includes Grafana)
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "55.0.0"
  namespace  = "monitoring"

  create_namespace = true

  values = [
    yamlencode({
      grafana = {
        enabled = true
        adminPassword = var.grafana_admin_password
        
        service = {
          type = "ClusterIP"
        }
        
        ingress = {
          enabled = true
          ingressClassName = "nginx"
          hosts = ["grafana.${local.domain_name}"]
        }
        
        persistence = {
          enabled = true
          size    = "10Gi"
        }
      }
      
      prometheus = {
        prometheusSpec = {
          retention = "30d"
          
          storageSpec = {
            volumeClaimTemplate = {
              spec = {
                accessModes = ["ReadWriteOnce"]
                resources = {
                  requests = {
                    storage = "50Gi"
                  }
                }
              }
            }
          }
        }
        
        ingress = {
          enabled = true
          ingressClassName = "nginx"
          hosts = ["prometheus.${local.domain_name}"]
        }
      }
      
      alertmanager = {
        enabled = true
        
        ingress = {
          enabled = true
          ingressClassName = "nginx"
          hosts = ["alertmanager.${local.domain_name}"]
        }
      }
    })
  ]

  depends_on = [helm_release.nginx_ingress]
}

# Additional Prometheus Node Exporter for detailed metrics
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  version    = "3.11.0"
  namespace  = "kube-system"

   set = [
    {
      name  = "args[0]"
      value = "--kubelet-insecure-tls"
    }
  ]

  depends_on = [module.eks]
}
