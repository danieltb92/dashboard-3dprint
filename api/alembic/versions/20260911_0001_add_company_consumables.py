"""Add company and consumables tables

Revision ID: 20260911_0001
Revises: 20260909_0002
Create Date: 2026-09-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260911_0001"
down_revision: Union[str, None] = "20260909_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create company table
    op.create_table(
        "company",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("logo_url", sa.String(), nullable=True),
        sa.Column("direccion", sa.String(), nullable=True),
        sa.Column("telefono", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("nit", sa.String(), nullable=True),
        sa.Column("website", sa.String(), nullable=True),
    )

    # Create consumables table
    op.create_table(
        "consumables",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("nombre", sa.String(), nullable=False),
        sa.Column("costo_unitario", sa.Integer(), nullable=False),
        sa.Column("unidad", sa.String(), nullable=False),
        sa.Column("uso_por_cm2", sa.Float(), nullable=True),
        sa.Column("activo", sa.Boolean(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("consumables")
    op.drop_table("company")
