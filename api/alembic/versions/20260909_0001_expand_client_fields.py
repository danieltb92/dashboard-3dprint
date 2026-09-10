"""expand client fields

Revision ID: 20260909_0001
Revises: 20260908_0003
Create Date: 2026-09-09
"""

from alembic import op
import sqlalchemy as sa

revision = "20260909_0001"
down_revision = "20260908_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("clients", sa.Column("telefono", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("direccion", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("ciudad", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("departamento", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("empresa", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("tipo_documento", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("numero_documento", sa.String(), nullable=True))
    op.add_column("clients", sa.Column("condicion_pago", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("clients", "condicion_pago")
    op.drop_column("clients", "numero_documento")
    op.drop_column("clients", "tipo_documento")
    op.drop_column("clients", "empresa")
    op.drop_column("clients", "departamento")
    op.drop_column("clients", "ciudad")
    op.drop_column("clients", "direccion")
    op.drop_column("clients", "telefono")
