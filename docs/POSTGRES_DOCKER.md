# PostgreSQL Docker service

The root `docker-compose.yml` runs PostgreSQL 16 with a named persistent volume, a health check, and `unless-stopped` restart policy. Its network is internal and it publishes **no host port**. The backend must run on the same Compose network to use this database; a backend running directly on the host cannot reach it. Do not switch an existing backend to this new, empty database until its data has been backed up and migrated safely.

Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in a private environment file (see `.env.compose.example`). Use a strong, unique password; never commit the real file. From the repository root:

```powershell
docker compose --env-file .env.compose -p tamilfoodthaya up -d --wait database
docker compose --env-file .env.compose -p tamilfoodthaya ps
```

The named volume survives container restart and recreation. `docker compose down` stops and removes the container and network but retains the volume; **never use `down -v`** on a database holding data. Container persistence is not a backup. Before using this service for real data, implement and verify off-server backups and a restore procedure.

An isolated test project (`tft_persistence_probe_20260927`) confirmed that a synthetic record remained after both `restart` and `up --force-recreate`. The test did not use or migrate the existing development database. The test container was stopped, and its named test volume was retained.
