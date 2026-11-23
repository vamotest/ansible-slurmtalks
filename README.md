# SlurmTalks Multi-Tier Infrastructure & Deployment Automation with Ansible

Automated end-to-end infrastructure provisioning and multi-tier application deployment for **SlurmTalks** (a micro-blogging social platform) across distributed virtual machines using **Ansible**.

---

## Architecture Overview

The platform is a decoupled multi-tier environment hosted on dedicated nodes:

| Host   | Node Role           | OS           | Components & Responsibilities                                                                            | Ports  |
| :----- | :------------------ | :----------- | :------------------------------------------------------------------------------------------------------- | :----- |
| `vs01` | Control Node        | Ubuntu 22.04 | Central Ansible node. Runs playbooks, manages the inventory, and provisions remote targets.              | —      |
| `vs02` | Frontend Node       | Ubuntu 22.04 | Next.js web interface (Node.js LTS). The browser calls the backend via `NEXT_PUBLIC_BACKEND_URL`.        | `3000` |
| `vs03` | Backend & Data Node | Ubuntu 22.04 | Go REST API (Gin), PostgreSQL 14 (user identity and authentication), and Redis 7 (tweets and counters).  | `8080` |

Traffic is routed by a reverse proxy: `slurm-talks-front.s085906.edu.slurm.io:80` forwards to `vs02:3000`, and `slurm-talks-back.s085906.edu.slurm.io:80` forwards to `vs03:8080`.
PostgreSQL and Redis listen on their default ports and are reachable only locally on `vs03`.

```text
        [ Client Browser ]
                |
                | HTTP :80
                v
      +-------------------+
      |   Reverse Proxy   |
      +----+---------+----+
           |         |
    :3000  |         |  :8080
           v         v
  +-----------------+   +-----------------+
  | vs02 (Frontend) |   | vs03 (Backend)  |
  |     Next.js     |   |    Go (Gin)     |
  +-----------------+   +--------+--------+
                                 |
                        +--------+--------+
                        v                 v
                   [PostgreSQL]        [Redis]
```

## Key Implementation Details

### Modular Ansible Roles

- `common`: Updates the APT cache and installs base system packages on all targets.
- `postgresql`: Installs PostgreSQL 14, enables the service, and sets the credentials for the application database.
- `redis`: Installs Redis, enables the service, and keeps it bound locally.
- `backend`: Installs the Go runtime (1.24.0), clones the source repository, templates the runtime `.env` file, and creates the `backend.service` systemd unit.
- `frontend`: Installs Node.js LTS, clones the source repository, injects the public backend URL (`NEXT_PUBLIC_BACKEND_URL`), runs the production build (`npm run build`), and manages the app through `frontend.service`.

### Token-Based Git Synchronization

The backend and frontend roles clone the repository over HTTPS with a GitLab Personal Access Token (`oauth2:{{ gitlab_token }}`). This removes manual code deployment and avoids distributing private SSH keys to the managed hosts.

### Idempotency & Process Management

Systemd unit templates and dedicated Ansible handlers restart services only when their configuration or code changes.

## Prerequisites

- SSH access from the Control Node (`vs01`) to the managed hosts (`vs02.s085906`, `vs03.s085906`).
- Ansible installed on `vs01`.
- A GitLab Personal Access Token (`glpat-...`) with the `read_repository` scope.

## Inventory Configuration

The host configuration is stored in `hosts.ini`:

```ini
[backend_hosts]
vs03 ansible_host=vs03.s085906 postgres_host=localhost

[frontend_hosts]
vs02 ansible_host=vs02.s085906 NEXT_PUBLIC_BACKEND_URL=http://slurm-talks-back.s085906.edu.slurm.io
```

## Execution & Deployment

Run the full provisioning workflow from the Control Node (`vs01`):

```bash
ansible-playbook -i hosts.ini playbook.yml \
  -e "postgres_password=your_secure_db_password" \
  -e "gitlab_token=glpat-your_personal_access_token"
```

To deploy a single tier, add `--limit backend_hosts` or `--limit frontend_hosts` to the command above.

## Validation & Health Checks

Verify service status and API connectivity from `vs01`:

```bash
# Backend health
curl -i http://vs03.s085906:8080/healthz

# Backend readiness (PostgreSQL + Redis)
curl -i http://vs03.s085906:8080/readyz

# Query tweets via the REST API
curl -i http://vs03.s085906:8080/api/tweets

# Frontend probe
curl -i http://vs02.s085906:3000/readyz
```

## Application URLs

- Frontend Web UI: http://slurm-talks-front.s085906.edu.slurm.io
- Backend API: http://slurm-talks-back.s085906.edu.slurm.io