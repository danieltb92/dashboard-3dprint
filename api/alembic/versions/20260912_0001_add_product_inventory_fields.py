"""add product inventory fields

Revision ID: 20260912_0001
Revises: 20260911_0001
Create Date: 2026-09-12
"""

from alembic import op
import sqlalchemy as sa

revision = "20260912_0001"
down_revision = "20260911_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("color", sa.String(), nullable=True))
    op.add_column("products", sa.Column("linea", sa.String(), nullable=True))
    op.add_column(
        "products", sa.Column("stock_actual", sa.Integer(), server_default="0")
    )
    op.add_column(
        "products", sa.Column("stock_pedido", sa.Integer(), server_default="0")
    )
    op.add_column("products", sa.Column("stock_alert", sa.String(), nullable=True))
    op.add_column(
        "products", sa.Column("status_produccion", sa.String(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("products", "status_produccion")
    op.drop_column("products", "stock_alert")
    op.drop_column("products", "stock_pedido")
    op.drop_column("products", "stock_actual")
    op.drop_column("products", "linea")
    op.drop_column("products", "color")
