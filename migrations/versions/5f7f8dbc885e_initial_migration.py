"""Initial migration creating tables

Revision ID: 5f7f8dbc885e
Revises: 
Create Date: 2025-08-21 15:18:05.732171

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '5f7f8dbc885e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'work_orders',
        sa.Column('id', sa.String(), primary_key=True, nullable=False),
        sa.Column('product', sa.String(), nullable=False),
        sa.Column('qty', sa.Integer(), nullable=False),
    )

    op.create_table(
        'operations',
        sa.Column('id', sa.String(), primary_key=True, nullable=False),
        sa.Column('work_order_id', sa.String(), sa.ForeignKey('work_orders.id', ondelete='CASCADE'), nullable=False),
        sa.Column('index', sa.Integer(), nullable=False),
        sa.Column('machine_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_index('ix_operations_machine_id', 'operations', ['machine_id'])
    op.create_index('ix_operations_work_order_id_index', 'operations', ['work_order_id', 'index'])


def downgrade():
    op.drop_index('ix_operations_work_order_id_index', table_name='operations')
    op.drop_index('ix_operations_machine_id', table_name='operations')
    op.drop_table('operations')
    op.drop_table('work_orders')
