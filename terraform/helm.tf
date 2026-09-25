# Install Helm charts for microservices
resource "helm_release" "microservices" {
  for_each = {
    for svc in var.microservices : svc.name => svc
  }

  name       = each.value.name
  chart      = each.value.chart
  repository = each.value.repository
  version    = each.value.version
  namespace  = each.value.namespace

  create_namespace = true

  values = [
    yamlencode(each.value.values)
  ]

  depends_on = [module.eks]
}
