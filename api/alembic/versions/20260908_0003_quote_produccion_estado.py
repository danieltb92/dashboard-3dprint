"""add produccion_estado to quotes

Revision ID: 20260908_0003
Revises: 20260908_0002
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa

revision = "20260908_0003"
down_revision = "20260908_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "quotes",
        sa.Column("produccion_estado", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("quotes", "produccion_estado")
