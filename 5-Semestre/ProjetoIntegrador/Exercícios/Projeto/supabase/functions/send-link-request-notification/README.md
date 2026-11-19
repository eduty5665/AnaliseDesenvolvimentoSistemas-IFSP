# send-link-request-notification

Edge Function chamada pelo app Android depois que uma solicitacao pendente e criada em `solicitacao_vinculo`.

Variaveis de ambiente necessarias no Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

`FIREBASE_PRIVATE_KEY` deve vir da conta de servico do Firebase, mas somente como secret da Edge Function. Nao coloque `service-account.json` no Android.

Deploy sugerido:

```bash
supabase functions deploy send-link-request-notification
supabase secrets set FIREBASE_PROJECT_ID="olympiafitrix"
supabase secrets set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@olympiafitrix.iam.gserviceaccount.com"
supabase secrets set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
