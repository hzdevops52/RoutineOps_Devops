# RoutineOps-Cloud-native-Microservices-Platfor 
 
> **DevOps-driven full-stack routine generator** End-to-end cloud-native DevOps project: AWS infrastructure with Terraform, containerized microservices with Docker, Kubernetes deployment, automated CI/CD pipelines, and Prometheus-Grafana monitoring. 
---

## Table of Contents 

1. [Project Overview](#project-overview) 
2. [Tech Stack](#tech-stack)
3. [Architecture & Workflow Diagram](#architecture--workflow-diagram)
4. [Repository Structure](#repository-structure)
5. [Step-by-Step Implementation](#step-by-step-implementation)
   - [Step 1 — Project Scaffolding](#step-1--project-scaffolding)
   - [Step 2 — Backend (Express + MongoDB)](#step-2--backend-express--mongodb)
   - [Step 3 — Frontend (Next.js + Tailwind)](#step-3--frontend-nextjs--tailwind)
   - [Step 4 — Dockerizing All Services](#step-4--dockerizing-all-services)
   - [Step 5 — Docker Compose (Local Orchestration)](#step-5--docker-compose-local-orchestration)
   - [Step 6 — Kubernetes Manifests (k8s/)](#step-6--kubernetes-manifests-k8s)
   - [Step 7 — Terraform (AWS Infrastructure)](#step-7--terraform-aws-infrastructure)
   - [Step 8 — CI/CD with GitHub Actions](#step-8--cicd-with-github-actions)
   - [Step 9 — Monitoring & HPA](#step-9--monitoring--hpa)
   - [Step 10 — Scripts: Deploy & Backup](#step-10--scripts-deploy--backup)
6. [Problems Faced & How I Solved Them](#problems-faced--how-i-solved-them)
7. [Environment Variables](#environment-variables)
8. [Running Locally](#running-locally)
9. [Deploying to AWS (EKS)](#deploying-to-aws-eks)
10. [Contributing](#contributing)

---

## Project Overview

**RoutineOps-Cloud-native-Microservices-Platform** is a department-level routine (class schedule / timetable) generator built for university use. It lets department admins create, manage, and export course routines, while the backend enforces business rules (clash detection, room availability, etc.) and persists data in MongoDB.

The project was designed with a **DevOps-first mindset** — every layer (local dev, staging, production) is infrastructure-as-code, containerized, and continuously deployed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express 4, Mongoose 8, Morgan |
| Database | MongoDB 7 (replica-safe, init-scripted) |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes (k8s manifests + Helm charts) |
| Cloud | AWS (EKS, ECR, VPC, IAM, Security Groups) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Monitoring | HPA (Horizontal Pod Autoscaler), resource limits |
| PDF Export | jsPDF + html2canvas |

---

## Architecture & Workflow Diagram


![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/d59719304c7f61e154b5600fdc6b5d94bf2b31e6/assets/Screenshot%202026-04-02%20155523.png)


**Data Flow (Request Lifecycle):**

---

## Repository Structure

```
routineops-platform/
├── .github/
│   └── workflows/         # GitHub Actions CI/CD pipeline YAMLs
├── assets/                # Static assets / screenshots
├── aws/                   # AWS-specific configs (eksctl, etc.)
├── backend/
│   ├── src/
│   │   └── server.js      # Express app entry point
│   ├── Dockerfile
│   └── package.json
├── charts/                # Helm charts for k8s deployment
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state stores
│   ├── styles/            # Global CSS / Tailwind config
│   ├── Dockerfile
│   └── package.json
├── k8s/
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongo-deployment.yaml
│   ├── mongo-secret.yaml
│   ├── mongo-uri-secret.yaml
│   ├── services.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── resource-limits.yaml
├── problem-solve/K8s/     # Documented fixes for k8s issues faced
├── scripts/
│   ├── deploy.sh          # One-command production deploy script
│   └── backup.sh          # MongoDB backup automation
├── terraform/
│   ├── main.tf
│   ├── vpc.tf
│   ├── eks.tf
│   ├── ecr.tf
│   ├── iam.tf
│   ├── ingress.tf
│   ├── cicd.tf
│   ├── monitoring.tf
│   ├── security_groups.tf
│   ├── outputs.tf
│   ├── variables.tf (terraform.tfvars)
│   └── versions.tf
├── docker-compose.yml
├── mongo-init.js          # DB init script (users, collections, indexes)
└── DEPLOYMENT.md          # Step-by-step deployment reference
```

---

## Step-by-Step Implementation
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/5e3180672c9039aa573bd48a432bdd49670ad961/assets/Screenshot%202026-04-02%20161345.png)
### Step 1 — Project Scaffolding

Created the monorepo structure with two separate services (`backend/`, `frontend/`) at the root so Docker Compose and Kubernetes can treat them as independent build contexts.

- Initialized `backend/` as an ESM Node.js project (`"type": "module"`) to use `import/export` syntax throughout.
- Initialized `frontend/` with `create-next-app` using TypeScript and the App Router.
- Added a root `package-lock.json` to pin shared tooling.

---

### Step 2 — Backend (Express + MongoDB)
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/4b266c717a4f8018a058b027a2fe44439ae7f1f8/assets/Screenshot%202026-04-02%20161404.png)
**Stack:** Express 4, Mongoose 8, Morgan (HTTP logger), dotenv, CORS.

Key decisions:
- Used **ESM modules** (`import`/`export`) across the entire backend for consistency with modern Node.js.
- `nodemon` + `cross-env` used in dev mode to hot-reload and set `NODE_ENV` cross-platform.
- Exposed a `/health` endpoint so Docker Compose and Kubernetes liveness probes work correctly.
- `CORS_ORIGIN` is injected via environment variable so the same image works in local, staging, and production without rebuild.

```js
// Health check endpoint (required by Docker & k8s probes)
app.get('/health', (req, res) => res.json({ status: 'ok' }));
```

---

### Step 3 — Frontend (Next.js + Tailwind)
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/22820b9ce2193bf95f03cf716eeed19188d9ccd2/assets/Screenshot%202026-04-01%20171146.png)
**Stack:** Next.js 16 (App Router), React 18, TypeScript 5.4, Tailwind CSS 3, Zustand 4 (global state), TanStack Query 5 (server state / caching), Framer Motion (animations), jsPDF + html2canvas (PDF export).

Key decisions:
- `NEXT_PUBLIC_API_URL` is baked into the JS bundle at **build time** using Docker `--build-arg`. This means the frontend image is environment-specific (one image per environment) — which is the correct Next.js pattern for public env vars.
- Used **Zustand** for client-side UI state (selected slots, form data) and **TanStack Query** for all API calls with automatic refetching and cache invalidation.
- shadcn/ui components added via `components.json` for consistent, accessible UI primitives.

---

### Step 4 — Dockerizing All Services

Each service has its own `Dockerfile` following multi-stage build best practices to minimize image size.

**Backend Dockerfile pattern:**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
CMD ["node", "src/server.js"]
```

**Frontend Dockerfile pattern (multi-stage):**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
CMD ["node", "server.js"]
```

---

### Step 5 — Docker Compose (Local Orchestration)

`docker-compose.yml` wires all three services together for local development and testing. Key design decisions:

- **Two networks**: `internal` (backend ↔ mongo, never exposed externally) and `external` (frontend only). This mirrors production network segmentation.
- **Health-check chained startup**: `backend` waits for `mongo` to be healthy; `frontend` waits for `backend` to be healthy. Eliminates race-condition crashes on first `docker compose up`.
- **`mongo-init.js`** mounted read-only at `/docker-entrypoint-initdb.d/` to auto-create the app DB, user, and indexes on first boot.
- Port `5000` (backend) is only `expose`d (container-to-container), never published to the host. Only port `3000` (frontend) is published.

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:5000/health"]
  interval: 15s
  timeout: 5s
  retries: 3
```

---

### Step 6 — Kubernetes Manifests (k8s/)

All production workloads run on Kubernetes. The manifests cover:

| File | Purpose |
|---|---|
| `namespace.yaml` | Isolates all resources under a dedicated namespace |
| `mongo-secret.yaml` | Base64-encoded MongoDB root credentials |
| `mongo-uri-secret.yaml` | Full connection string as a k8s Secret |
| `mongo-deployment.yaml` | MongoDB StatefulSet + PersistentVolumeClaim |
| `backend-deployment.yaml` | Express Deployment, mounts `mongo-uri-secret` as env |
| `frontend-deployment.yaml` | Next.js Deployment with `NEXT_PUBLIC_API_URL` set |
| `services.yaml` | ClusterIP services for backend & mongo; LoadBalancer or NodePort for frontend |
| `ingress.yaml` | NGINX Ingress with host-based routing |
| `hpa.yaml` | Horizontal Pod Autoscaler (CPU-triggered) |
| `resource-limits.yaml` | CPU/memory requests & limits for all containers |

---

### Step 7 — Terraform (AWS Infrastructure)

The entire AWS infrastructure is defined as code in `terraform/`:

| File | Resources Managed |
|---|---|
| `vpc.tf` | VPC, public/private subnets, route tables, NAT Gateway |
| `eks.tf` | EKS cluster, managed node groups |
| `ecr.tf` | ECR repositories for backend and frontend images |
| `iam.tf` | IAM roles for EKS nodes, IRSA for pod-level AWS access |
| `security_groups.tf` | SGs for cluster, nodes, ALB |
| `ingress.tf` | AWS Load Balancer Controller / ALB Ingress |
| `monitoring.tf` | CloudWatch log groups, Container Insights |
| `cicd.tf` | IAM user + policy for GitHub Actions to push to ECR and update EKS |
| `backend.tf` | Remote Terraform state in S3 + DynamoDB locking |

Apply order: `vpc → eks → ecr → iam → ingress → monitoring → cicd`

---

### Step 8 — CI/CD with GitHub Actions

`.github/workflows/` contains the pipeline:

1. **On push to `main`:**
   - Lint and build frontend
   - Run backend tests
   - Build Docker images
   - Push to AWS ECR (tagged with commit SHA)
   - Update k8s deployments with new image tag via `kubectl set image`
2. **On pull request:**
   - Lint, type-check, build only (no deploy)

The GitHub Actions IAM user credentials (created by `cicd.tf`) are stored as GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

---
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/4b33f12830aa594476349df0b6828d83d08a09f2/assets/Screenshot%202026-04-01%20172220.png)
### Step 9 — Monitoring & HPA

- **HPA (`hpa.yaml`):** Scales backend pods from 1 to 5 replicas when CPU > 70%.
- **Resource Limits (`resource-limits.yaml`):** Every container has `requests` and `limits` defined — required for HPA to work and to prevent noisy-neighbor issues.
- **CloudWatch Container Insights:** Provisioned via Terraform for cluster-level metrics and log aggregation.

---

### Step 10 — Scripts: Deploy & Backup

**`scripts/deploy.sh`:** One-command deploy — builds images, pushes to ECR, applies k8s manifests, and waits for rollout.

**`scripts/backup.sh`:** Connects to the running MongoDB pod, runs `mongodump`, compresses the output, and uploads to an S3 bucket for point-in-time recovery.

---

## Problems Faced & How I Solved Them
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/8a89292dd73b2e9d09fd5d11ec854fcbe62b370d/assets/Screenshot%202026-04-01%20171415.png)
### Problem 1 — Backend crashed before MongoDB was ready

**Symptom:** On `docker compose up`, the backend container exited with `MongoNetworkError: connect ECONNREFUSED` because it started before MongoDB finished initializing.

**Root Cause:** Docker Compose `depends_on` by default only waits for the container to *start*, not for the service inside it to be *ready*.

**Fix:** Added a `healthcheck` to the `mongo` service using `mongosh --eval "db.adminCommand('ping')"`, and changed `depends_on` to use `condition: service_healthy`. The backend now only starts after Mongo passes its ping check.

```yaml
depends_on:
  mongo:
    condition: service_healthy
```

---

### Problem 2 — `NEXT_PUBLIC_API_URL` was undefined in production
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/ce0738495fde497d663fdc9d6139c28cd1df3168/assets/Screenshot%202026-04-01%20171937.png)
**Symptom:** All API calls from the browser hit `undefined/api/...` and failed with a network error.

**Root Cause:** Next.js bakes `NEXT_PUBLIC_*` variables into the client bundle at **build time**, not runtime. Setting the env var in the Compose `environment` block only affects server-side runtime — the already-built JS bundle doesn't pick it up. 

**Fix:** Passed `NEXT_PUBLIC_API_URL` as a Docker `--build-arg` so it is available during `next build`:

```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile
  args:
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://backend:5000}
```

And in the Dockerfile:
```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
```

---

### Problem 3 — Kubernetes pods couldn't pull images from ECR

**Symptom:** Pods stuck in `ImagePullBackOff`. ECR is private; Kubernetes nodes had no permission to pull.

**Root Cause:** The EKS node IAM role was missing the `AmazonEC2ContainerRegistryReadOnly` policy.

**Fix:** Added the policy to the node IAM role in `iam.tf`:

```hcl
resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}
```

---

### Problem 4 — MongoDB data lost on pod restart
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/b6505f88bd81b7ca279ca2985bc7b3c840e2b9b0/assets/Screenshot%202026-04-01%20172738.png)
**Symptom:** Every time the MongoDB pod restarted, all data was gone.

**Root Cause:** The MongoDB Deployment was using an `emptyDir` volume, which is ephemeral and destroyed when the pod restarts.

**Fix:** Replaced `emptyDir` with a `PersistentVolumeClaim` backed by AWS EBS (gp2 storage class). Changed the workload from a `Deployment` to a `StatefulSet` for stable network identity and ordered pod management.

```yaml
volumeClaimTemplates:
  - metadata:
      name: mongo-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: gp2
      resources:
        requests:
          storage: 10Gi
```

---

### Problem 5 — HPA not scaling (unknown CPU metrics)
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/389d5264fc50a380b1cf38c220b49377fb178e08/assets/Screenshot%202026-04-01%20172614.png)
**Symptom:** `kubectl get hpa` showed `<unknown>/70%` for CPU and never triggered scaling.

**Root Cause:** HPA requires the Kubernetes Metrics Server to be running, and pods must have `resources.requests.cpu` defined. Neither was configured.

**Fix:**
1. Deployed `metrics-server` into the cluster (via Helm in `helm.tf`).
2. Added CPU/memory `requests` to all container specs in `resource-limits.yaml`.

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

---

### Problem 6 — Terraform state conflicts in team environment
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/75937b6f04d51ade7b01680cf1bafc2e35f5541b/assets/Screenshot%202026-04-02%20162010.png)
**Symptom:** Two contributors running `terraform apply` simultaneously caused state corruption and duplicate resources.

**Root Cause:** Local state file was being used — no locking mechanism.

**Fix:** Configured remote state in `backend.tf` using S3 (state storage) + DynamoDB (state locking):

```hcl
terraform {
  backend "s3" {
    bucket         = "snu-routineops-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
```

---

### Problem 7 — CORS errors between frontend and backend in Docker
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/8cbc579ec90551cc1500aae047a1cb3462fef4c4/assets/Screenshot%202026-04-01%20171724.png)
**Symptom:** Browser console showed `Access to XMLHttpRequest blocked by CORS policy` when the frontend made API calls.

**Root Cause:** `CORS_ORIGIN` was hardcoded to `localhost:3000` in the backend — but in Docker, the frontend's actual origin as seen by the browser was `http://localhost:3000` (host machine), not the container name.

**Fix:** Made `CORS_ORIGIN` a required environment variable injected at runtime:

```yaml
# docker-compose.yml
environment:
  CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
```

And in `backend/src/server.js`:
```js
app.use(cors({ origin: process.env.CORS_ORIGIN }));
```

---

### Problem 8 — GitHub Actions deploy failed due to stale kubeconfig
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/cfa0623e91dd6c802d7d4f869a23019529485a39/assets/Screenshot%202026-04-01%20172019.png)
**Symptom:** CI pipeline threw `error: the server doesn't have a resource type "deployment"` even though the cluster existed.

**Root Cause:** The `KUBECONFIG` used by the GitHub Actions runner was either missing or pointing to the wrong cluster context after the EKS cluster was recreated with a new ARN.

**Fix:** Added an explicit `aws eks update-kubeconfig` step in the workflow before any `kubectl` commands:

```yaml
- name: Update kubeconfig
  run: |
    aws eks update-kubeconfig \
      --region ${{ secrets.AWS_REGION }} \
      --name ${{ secrets.EKS_CLUSTER_NAME }}
```

---

## Environment Variables
![image](https://github.com/abhijitray7810/RoutineOps-Cloud-Native-Microservices-Platform/blob/36bdf2a4b3afae263c233c35be1bbb36a9bbc226/assets/Screenshot%202026-04-01%20171820.png)
### Backend

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `production` | Runtime environment |
| `PORT` | No | `5000` | Express listen port |
| `MONGO_URI` | Yes | — | Full MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret for JWT signing |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |

### Frontend

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://backend:5000` | Backend API base URL (baked at build time) |
| `NODE_ENV` | No | `production` | Runtime environment |

### Docker Compose `.env` file

```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASS=your_secure_password
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
FRONTEND_PORT=3000
```

---

## Running Locally

**Prerequisites:** Docker Desktop (with Compose V2), Node.js 20+ (for local dev without Docker)

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/routineops-platform.git
cd routineops-platform

# 2. Create .env file
cp .env.example .env
# Edit .env and fill in MONGO_ROOT_PASS and JWT_SECRET

# 3. Start all services
docker compose up --build

# App available at:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:5000 (internal only, not exposed)
```

To run services individually for development:

```bash
# Backend (with hot reload)
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Deploying to AWS (EKS)

```bash
# 1. Provision AWS infrastructure
cd terraform
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

# 2. Update kubeconfig
aws eks update-kubeconfig --region ap-southeast-1 --name snu-routineops-cluster

# 3. Create namespace and secrets
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongo-secret.yaml
kubectl apply -f k8s/mongo-uri-secret.yaml

# 4. Deploy all workloads
kubectl apply -f k8s/

# 5. Check rollout status
kubectl rollout status deployment/backend -n snu-routine
kubectl rollout status deployment/frontend -n snu-routine

# Or use the deploy script
bash scripts/deploy.sh
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `feat:`, `fix:`, `chore:`, etc.
4. Push and open a Pull Request against `main`
5. CI will automatically lint, build, and test your changes

---

*Built with ❤️ as a university DevOps capstone project. All infrastructure is destroyed after demo to avoid AWS charges.*
