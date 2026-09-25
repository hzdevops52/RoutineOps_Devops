# Jenkins Helm Release
resource "helm_release" "jenkins" {
  name       = "jenkins"
  repository = "https://charts.jenkins.io"
  chart      = "jenkins"
  version    = "4.9.0"
  namespace  = "jenkins"

  create_namespace = true

  values = [
    yamlencode({
      controller = {
        image = "jenkins/jenkins"
        tag   = "2.426.2-lts"
        
        ingress = {
          enabled = true
          apiVersion = "networking.k8s.io/v1"
          ingressClassName = "nginx"
          hostName = "jenkins.${local.domain_name}"
        }
        
        resources = {
          requests = {
            cpu    = "500m"
            memory = "1Gi"
          }
          limits = {
            cpu    = "2000m"
            memory = "4Gi"
          }
        }
        
        javaOpts = "-XX:MaxRAMPercentage=75.0"
        
        installPlugins = [
          "kubernetes:4174.v4230d0ccd951",
          "workflow-aggregator:596.v8c21c963d92d",
          "git:5.2.1",
          "configuration-as-code:1775.v810dc950b_514",
          "docker-workflow:572.v950f58993843",
          "amazon-ecr:1.114.v224c8b_8d1a_7d",
          "pipeline-stage-view:2.34",
          "blue-ocean:1.27.11"
        ]
      }
      
      agent = {
        enabled = true
        yamlTemplate = <<-EOF
          apiVersion: v1
          kind: Pod
          spec:
            containers:
            - name: jnlp
              image: jenkins/inbound-agent:3206.vc3e62d4dddcf-1
            - name: docker
              image: docker:24.0.7-dind
              securityContext:
                privileged: true
              volumeMounts:
              - name: docker-graph-storage
                mountPath: /var/lib/docker
            volumes:
            - name: docker-graph-storage
              emptyDir: {}
        EOF
      }
      
      persistence = {
        enabled = true
        size    = "10Gi"
      }
    })
  ]

  depends_on = [helm_release.nginx_ingress]
}

# ArgoCD for GitOps (optional but recommended)
resource "helm_release" "argocd" {
  count = var.enable_argocd ? 1 : 0

  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "5.51.6"
  namespace  = "argocd"

  create_namespace = true

  values = [
    yamlencode({
      server = {
        ingress = {
          enabled = true
          ingressClassName = "nginx"
          hosts = ["argocd.${local.domain_name}"]
        }
        
        extraArgs = ["--insecure"]
      }
      
      dex = {
        enabled = false
      }
    })
  ]

  depends_on = [helm_release.nginx_ingress]
}
