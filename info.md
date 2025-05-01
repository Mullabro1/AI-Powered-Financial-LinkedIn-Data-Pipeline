AI-Powered Financial LinkedIn Data Pipeline
Tech Stack: Puppeteer · Logstash · Elasticsearch · Kibana · Spark · OpenCV · MongoDB · PostgreSQL · Hadoop · Grafana · LGTM (Loki · Grafana · Tempo · Mimir/ Prometheus) · Django · python · Java· Docker· Kubernetes · Opentelemetry ·Prisma
A fully automated, end-to-end data engineering solution that ingests public LinkedIn profile data, processes it with AI/ML, and surfaces real-time financial insights—backed by enterprise-grade observability.

🚀 Project Overview
Built to support quantitative research teams, this pipeline continuously scrapes and analyzes profile metadata (roles, company tenure, skills) to flag emerging financial expertise and leadership movements. By combining document search, large-scale batch analytics, and live monitoring, we ensure data freshness, query performance, and platform reliability.

🔍 Data Ingestion & Logging
Web Scraping with Puppeteer


Headless Chromium jobs pull structured JSON from target LinkedIn endpoints every hour.


Implements adaptive rate-limiting and IP-proxy rotation to avoid throttling.


Centralized Logging via Logstash


All scraper events (success, failure, latency) emit as JSON logs into Logstash pipelines for downstream processing.


Enrich logs with geo-IP, user-agent parsing, and custom error tags.



📦 Storage & Indexing
Primary Landing in MongoDB


Raw JSON documents held in a TTL-indexed “staging” collection for up to 24 hours.


ELK Stack for Full-Text Search


Logstash → Elasticsearch ingestion transforms and indexes key fields (job titles, skills, location).


Kibana dashboards enable data scientists to do ad-hoc searches (“Which CFOs joined fintech firms in Q1?”).


Relational Layer in PostgreSQL


After validation, profiles are normalized into relational tables (users, positions, skills) in Postgres.


Implements upserts for change-data-capture, and writes to both primary and a standby replica for HA.


Big Data Offload via Hadoop


Profiles older than 6 months batch‐exported to HDFS for historical trend analysis.


Spark jobs run periodic joins with market data for enrichment (e.g., stock prices, sector benchmarks).



🤖 AI/ML Enrichment
Spark + OpenCV


Scrapes and OCR’s profile images to extract company logos, then cross-references against brand database.


Generates image embeddings for clustering similar roles or workplaces.


Feature Engineering


Combines tenure, network size, endorsements, and text embeddings into ML feature sets.


Exports to Parquet on HDFS for model training (e.g., predicting “next likely promotion”).



📊 Observability & Security
LGTM Stack (Loki · Grafana · Tempo · Mimir)


Loki aggregates all microservice and pipeline logs (JSON + logs from Spark, Docker containers).


Mimir stores multi-dimensional metrics (CPU, memory, query latencies, scrape success rates).


Tempo traces end-to-end jobs—e.g., from Puppeteer request start through Elasticsearch indexing.


Grafana unifies dashboards: SLA charts, anomaly alerts (via Grafana Alerting), and business KPIs.


Access & Audit


Role-based access in Grafana ensures only data-science teams see PII fields.


All schema changes and pipeline deployments tracked via GitOps (FluxCD) with audit trails.



📈 Key Outcomes
99.9% Uptime on scraping + indexing services over 6 months.


40% Faster Queries for full-text searches by fine-tuning Elasticsearch analyzers and mappings.


Scalable to 50M Profiles by offloading archival data to Hadoop, reducing primary DB storage by 70%.


Proactive Alerts: Automated Grafana-triggered PagerDuty alerts for pipeline failures, containing trace IDs for rapid triage.



This project illustrates comprehensive expertise in scraping, hybrid storage architectures, large-scale analytics, AI/ML enrichment, and modern observability—perfectly suited for data-driven financial research teams.
