postgresql://postgres:Vettickal@22@db.iwhxrpnglsmhcqokxgfu.supabase.co:5432/postgres

npx supabase db dump --db-url postgresql://postgres:Vettickal@22@db.iwhxrpnglsmhcqokxgfu.supabase.co:5432/postgres -f roles.sql --role-only
npx supabase db dump --db-url postgresql://postgres:Vettickal@22@db.iwhxrpnglsmhcqokxgfu.supabase.co:5432/postgres -f schema.sql
npx supabase db dump --db-url postgresql://postgres:Vettickal@22@db.iwhxrpnglsmhcqokxgfu.supabase.co:5432/postgres -f data.sql --use-copy --data-only


postgresql://postgres.rwhbrtozvtzdiwynwkyb:Socr2025$umich@aws-0-us-west-1.pooler.supabase.com:6543/postgres

psql  --single-transaction  --variable ON_ERROR_STOP=1   --file roles.sql --file schema.sql --command 'SET session_replication_role = replica' --file data.sql  --dbname postgresql://postgres.rwhbrtozvtzdiwynwkyb:Socr2025$umich@aws-0-us-west-1.pooler.supabase.com:6543/postgres

psql --single-transaction --variable ON_ERROR_STOP=1 --file roles.sql --file schema.sql --command 'SET session_replication_role = replica' --file data.sql --dbname postgresql://postgres.rwhbrtozvtzdiwynwkyb:Socr2025$umich@aws-0-us-west-1.pooler.supabase.com:6543/postgres