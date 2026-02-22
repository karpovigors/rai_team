from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE core_placereview
            ADD COLUMN IF NOT EXISTS rating smallint NOT NULL DEFAULT 5;
            """,
            reverse_sql="""
            ALTER TABLE core_placereview
            DROP COLUMN IF EXISTS rating;
            """,
        ),
    ]

