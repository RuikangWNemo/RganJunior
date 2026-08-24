-- Supports keyset pagination in list_community_access_users.
create index profiles_registered_user_cursor_idx
  on public.profiles (registered_at desc, user_id desc);
