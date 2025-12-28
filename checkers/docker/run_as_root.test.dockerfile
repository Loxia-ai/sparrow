# Vulnerable: No USER instruction
FROM ubuntu:latest
COPY app /app
# <expect-error>
CMD ["/app/run.sh"]

# Vulnerable: ENTRYPOINT without USER
FROM python:3.11
COPY . /app
# <expect-error>
ENTRYPOINT ["python", "app.py"]

# <no-error> - Has USER instruction
FROM node:18-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --chown=appuser:appuser . /app
USER appuser
CMD ["node", "server.js"]

# <no-error> - Uses non-root user
FROM python:3.11-slim
RUN useradd -r -s /bin/false appuser
USER appuser
ENTRYPOINT ["python", "app.py"]
