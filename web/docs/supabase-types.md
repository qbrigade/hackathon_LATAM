# Importing supabase types

```sh
npx -y supabase login

# Development
export PROJECT_ID="blnqgjxcgdyaeutdeomf"

npx -y supabase gen types typescript --project-id "$PROJECT_ID" --schema public > src/services/db/_schema_generated.ts
```

Replace `PROJECT_ID` with the Peruanistas project id.
