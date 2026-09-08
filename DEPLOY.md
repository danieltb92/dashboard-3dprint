# Despliegue en OMV

## Prerrequisitos
- Tener `docker` y `docker-compose` instalados en OMV.
- Configurar `rclone` localmente y obtener el archivo `rclone.conf`.

## Configuración
1. Crear el directorio de configuración de rclone:
   ```bash
   mkdir -p config/rclone
   ```
2. Copiar tu archivo `rclone.conf` a `config/rclone/`.
3. Asegurar que los permisos del archivo `rclone.conf` sean correctos (lectura para el usuario del contenedor, ej: `chmod 600 config/rclone/rclone.conf`).

## Arrancar
Ejecuta el siguiente comando para desplegar:
```bash
docker-compose up -d
```

La copia de seguridad se ejecutará automáticamente a las 3:00 AM (definido en `CRON_SCHEDULE`).
