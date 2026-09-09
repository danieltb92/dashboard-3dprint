"""add envio and otros_cargos to quotes

Revision ID: 20260908_0002
Revises: 20260908_0001
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa

revision = "20260908_0002"
down_revision = "20260908_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "quotes",
        sa.Column("envio_cop", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "quotes",
        sa.Column("otros_cargos_cop", sa.Integer(), server_default="0", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("quotes", "envio_cop")
    op.drop_column("quotes", "otros_cargos_cop")
