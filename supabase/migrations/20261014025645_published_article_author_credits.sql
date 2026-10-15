-- Public bylines belong to published articles, independent from private People profiles.
set lock_timeout = '5s';
set statement_timeout = '60s';
create function private.list_published_field_note_authors(target_note_ids bigint[])
returns table(field_note_id bigint,person_id bigint,slug text,display_name text,nature_name text,author_order integer)
language plpgsql stable security definer set search_path = '' as $$
begin
  if cardinality(target_note_ids) > 100 then
    raise exception using errcode = '22023', message = 'TOO_MANY_ARTICLE_IDS';
  end if;
  return query
  select a.field_note_id,p.id,p.slug,p.display_name,p.nature_name,a.author_order
  from public.field_note_authors a
  join public.field_notes fn on fn.id=a.field_note_id
  join public.people p on p.id=a.person_id
  where fn.id=any(coalesce(target_note_ids,'{}'::bigint[]))
    and fn.status='published' and fn.visibility='public' and p.status='active'
  order by a.field_note_id,a.author_order,p.id;
end;
$$;
create function public.list_published_field_note_authors(target_note_ids bigint[])
returns table(field_note_id bigint,person_id bigint,slug text,display_name text,nature_name text,author_order integer)
language sql stable security invoker set search_path = '' as $$
  select * from private.list_published_field_note_authors(target_note_ids);
$$;
revoke all on function private.list_published_field_note_authors(bigint[]) from public,anon,authenticated;
revoke all on function public.list_published_field_note_authors(bigint[]) from public,anon,authenticated;
grant execute on function private.list_published_field_note_authors(bigint[]) to anon,authenticated;
grant execute on function public.list_published_field_note_authors(bigint[]) to anon,authenticated;
comment on function public.list_published_field_note_authors(bigint[]) is
  'Only public/published article bylines. Does not expose account IDs or private People profile fields.';
