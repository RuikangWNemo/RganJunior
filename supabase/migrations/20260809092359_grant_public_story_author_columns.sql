-- Public stories embed their authors through field_note_authors. Keep raw People
-- records private while allowing PostgREST to read the small, non-sensitive
-- author projection used by published story cards and articles.
grant select (id, slug, display_name, nature_name)
  on public.people
  to anon, authenticated;
