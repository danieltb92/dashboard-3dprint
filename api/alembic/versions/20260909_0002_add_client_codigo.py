"""add codigo to clients

Revision ID: 20260909_0002
Revises: 20260909_0001
Create Date: 2026-09-09
"""

from alembic import op
import sqlalchemy as sa

revision = "20260909_0002"
down_revision = "20260909_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("clients", sa.Column("codigo", sa.String(), nullable=True))

    # Backfill existing clients with sequential codes
    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id FROM clients ORDER BY id")).fetchall()
    for i, row in enumerate(rows, start=1):
        codigo = f"CLI-{i:03d}"
        conn.execute(
            sa.text("UPDATE clients SET codigo = :codigo WHERE id = :id"),
            {"codigo": codigo, "id": row[0]},
        )

    # Now make it NOT NULL
    op.alter_column("clients", "codigo", nullable=False)


def downgrade() -> None:
    op.drop_column("clients", "codigo")
