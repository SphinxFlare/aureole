"""add mini_traits to profiles

Revision ID: 5f1947dd3ab2
Revises: a006327f06e4
Create Date: 2025-11-13 23:16:18.686261

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5f1947dd3ab2'
down_revision: Union[str, Sequence[str], None] = 'a006327f06e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "profiles",
        sa.Column("mini_traits", sa.JSON(), nullable=True)
    )


def downgrade():
    op.drop_column("profiles", "mini_traits")
