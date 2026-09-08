#!/bin/sh
# Backup script for OMV
RCLONE_CONFIG=/config/rclone/rclone.conf
SOURCE=/data/db.sqlite
DEST=google_drive:backups/dashboard-3dprint/

echo "Starting backup at $(date)"
rclone sync $SOURCE $DEST --config $RCLONE_CONFIG
echo "Backup finished at $(date)"
