CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'creator',
    'business',
    'admin'
);


--
-- Name: submission_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.submission_status AS ENUM (
    'pending_review',
    'approved',
    'denied',
    'paid'
);


--
-- Name: encrypt_tiktok_tokens_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.encrypt_tiktok_tokens_trigger() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
  v_key_id uuid;
BEGIN
  -- Get the encryption key
  SELECT id INTO v_key_id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1;
  
  -- If no encryption key exists, we can't encrypt - fail safely
  IF v_key_id IS NULL THEN
    RAISE EXCEPTION 'Encryption key not configured. Cannot store TikTok tokens securely.';
  END IF;
  
  -- Only encrypt if access_token is being set and isn't already encrypted (base64 format)
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    -- Check if it looks like it's already encrypted (base64 encoded)
    IF NEW.access_token !~ '^[A-Za-z0-9+/=]+$' OR length(NEW.access_token) < 100 THEN
      -- Encrypt the access token
      SELECT encode(pgsodium.crypto_aead_det_encrypt(
        convert_to(NEW.access_token, 'utf8'),
        convert_to(NEW.id::text, 'utf8'),
        v_key_id
      ), 'base64') INTO v_encrypted_access;
      NEW.access_token := v_encrypted_access;
    END IF;
  END IF;
  
  -- Only encrypt if refresh_token is being set
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    -- Check if it looks like it's already encrypted (base64 encoded)
    IF NEW.refresh_token !~ '^[A-Za-z0-9+/=]+$' OR length(NEW.refresh_token) < 100 THEN
      -- Encrypt the refresh token
      SELECT encode(pgsodium.crypto_aead_det_encrypt(
        convert_to(NEW.refresh_token, 'utf8'),
        convert_to(NEW.id::text, 'utf8'),
        v_key_id
      ), 'base64') INTO v_encrypted_refresh;
      NEW.refresh_token := v_encrypted_refresh;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$_$;


--
-- Name: get_tiktok_tokens(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_tiktok_tokens(p_tiktok_account_id uuid) RETURNS TABLE(access_token text, refresh_token text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_encrypted_access text;
  v_encrypted_refresh text;
BEGIN
  -- Verify the caller owns this account
  SELECT user_id, ta.access_token, ta.refresh_token 
  INTO v_user_id, v_encrypted_access, v_encrypted_refresh
  FROM public.tiktok_accounts ta
  WHERE ta.id = p_tiktok_account_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'TikTok account not found';
  END IF;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to TikTok tokens';
  END IF;
  
  -- Return decrypted tokens
  RETURN QUERY SELECT 
    convert_from(pgsodium.crypto_aead_det_decrypt(
      decode(v_encrypted_access, 'base64'),
      convert_to(p_tiktok_account_id::text, 'utf8'),
      (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
    ), 'utf8') as access_token,
    convert_from(pgsodium.crypto_aead_det_decrypt(
      decode(v_encrypted_refresh, 'base64'),
      convert_to(p_tiktok_account_id::text, 'utf8'),
      (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
    ), 'utf8') as refresh_token;
END;
$$;


--
-- Name: get_user_tiktok_accounts(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_tiktok_accounts(p_user_id uuid) RETURNS TABLE(id uuid, user_id uuid, tiktok_user_id text, tiktok_username text, follower_count integer, is_active boolean, token_expires_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Verify the caller owns the account
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to TikTok accounts';
  END IF;

  RETURN QUERY
  SELECT 
    ta.id,
    ta.user_id,
    ta.tiktok_user_id,
    ta.tiktok_username,
    ta.follower_count,
    ta.is_active,
    ta.token_expires_at,
    ta.created_at,
    ta.updated_at
  FROM public.tiktok_accounts ta
  WHERE ta.user_id = p_user_id;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Default role is creator
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: store_tiktok_tokens(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.store_tiktok_tokens(p_tiktok_account_id uuid, p_access_token text, p_refresh_token text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_encrypted_access text;
  v_encrypted_refresh text;
BEGIN
  -- Encrypt tokens using pgsodium
  SELECT encode(pgsodium.crypto_aead_det_encrypt(
    convert_to(p_access_token, 'utf8'),
    convert_to(p_tiktok_account_id::text, 'utf8'),
    (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
  ), 'base64') INTO v_encrypted_access;
  
  SELECT encode(pgsodium.crypto_aead_det_encrypt(
    convert_to(p_refresh_token, 'utf8'),
    convert_to(p_tiktok_account_id::text, 'utf8'),
    (SELECT id FROM pgsodium.valid_key WHERE name = 'tiktok_token_key' LIMIT 1)
  ), 'base64') INTO v_encrypted_refresh;
  
  -- Update the tiktok_accounts table with encrypted values
  UPDATE public.tiktok_accounts 
  SET 
    access_token = v_encrypted_access,
    refresh_token = v_encrypted_refresh,
    updated_at = now()
  WHERE id = p_tiktok_account_id;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: business_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_name text NOT NULL,
    logo_url text,
    description text,
    website text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    country text,
    organization_number text,
    vat_number text,
    phone_number text,
    address text,
    city text,
    postal_code text
);


--
-- Name: campaign_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    min_views integer NOT NULL,
    max_views integer,
    rate_per_view numeric(10,6) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    brand_name text NOT NULL,
    brand_logo_url text,
    guidelines text,
    assets_urls text[],
    category text,
    deadline timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'active'::text,
    total_budget numeric DEFAULT 0,
    CONSTRAINT campaigns_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'ended'::text])))
);


--
-- Name: content_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    tiktok_account_id uuid NOT NULL,
    tiktok_video_url text NOT NULL,
    tiktok_video_id text,
    status public.submission_status DEFAULT 'pending_review'::public.submission_status NOT NULL,
    current_views integer DEFAULT 0,
    review_notes text,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: earnings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.earnings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid NOT NULL,
    submission_id uuid NOT NULL,
    views_counted integer DEFAULT 0 NOT NULL,
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    is_paid boolean DEFAULT false,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    username text,
    full_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tiktok_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tiktok_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tiktok_user_id text NOT NULL,
    tiktok_username text NOT NULL,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    follower_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tiktok_accounts_safe; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.tiktok_accounts_safe WITH (security_invoker='true') AS
 SELECT id,
    user_id,
    tiktok_user_id,
    tiktok_username,
    follower_count,
    is_active,
    token_expires_at,
    created_at,
    updated_at
   FROM public.tiktok_accounts
  WHERE (user_id = auth.uid());


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: business_profiles business_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_profiles
    ADD CONSTRAINT business_profiles_pkey PRIMARY KEY (id);


--
-- Name: business_profiles business_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_profiles
    ADD CONSTRAINT business_profiles_user_id_key UNIQUE (user_id);


--
-- Name: campaign_tiers campaign_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_tiers
    ADD CONSTRAINT campaign_tiers_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: content_submissions content_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_submissions
    ADD CONSTRAINT content_submissions_pkey PRIMARY KEY (id);


--
-- Name: earnings earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_campaign_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_campaign_id_key UNIQUE (user_id, campaign_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: tiktok_accounts tiktok_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiktok_accounts
    ADD CONSTRAINT tiktok_accounts_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_campaigns_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_business_id ON public.campaigns USING btree (business_id);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- Name: idx_content_submissions_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_submissions_campaign_id ON public.content_submissions USING btree (campaign_id);


--
-- Name: tiktok_accounts encrypt_tokens_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER encrypt_tokens_before_insert BEFORE INSERT ON public.tiktok_accounts FOR EACH ROW EXECUTE FUNCTION public.encrypt_tiktok_tokens_trigger();


--
-- Name: tiktok_accounts encrypt_tokens_before_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER encrypt_tokens_before_update BEFORE UPDATE ON public.tiktok_accounts FOR EACH ROW WHEN (((new.access_token IS DISTINCT FROM old.access_token) OR (new.refresh_token IS DISTINCT FROM old.refresh_token))) EXECUTE FUNCTION public.encrypt_tiktok_tokens_trigger();


--
-- Name: business_profiles update_business_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: campaigns update_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_submissions update_content_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_submissions_updated_at BEFORE UPDATE ON public.content_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: earnings update_earnings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_earnings_updated_at BEFORE UPDATE ON public.earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tiktok_accounts update_tiktok_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tiktok_accounts_updated_at BEFORE UPDATE ON public.tiktok_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_profiles business_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_profiles
    ADD CONSTRAINT business_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: campaign_tiers campaign_tiers_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_tiers
    ADD CONSTRAINT campaign_tiers_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_business_id_fkey FOREIGN KEY (business_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_submissions content_submissions_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_submissions
    ADD CONSTRAINT content_submissions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: content_submissions content_submissions_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_submissions
    ADD CONSTRAINT content_submissions_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_submissions content_submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_submissions
    ADD CONSTRAINT content_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: content_submissions content_submissions_tiktok_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_submissions
    ADD CONSTRAINT content_submissions_tiktok_account_id_fkey FOREIGN KEY (tiktok_account_id) REFERENCES public.tiktok_accounts(id) ON DELETE CASCADE;


--
-- Name: earnings earnings_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: earnings earnings_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.content_submissions(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tiktok_accounts tiktok_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tiktok_accounts
    ADD CONSTRAINT tiktok_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: campaigns Anyone can view active campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active campaigns" ON public.campaigns FOR SELECT TO authenticated USING ((is_active = true));


--
-- Name: business_profiles Anyone can view business profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view business profiles" ON public.business_profiles FOR SELECT USING (true);


--
-- Name: campaign_tiers Anyone can view campaign tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view campaign tiers" ON public.campaign_tiers FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Authenticated users can view profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: tiktok_accounts Block direct token access - use safe view or function; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Block direct token access - use safe view or function" ON public.tiktok_accounts FOR SELECT USING (false);


--
-- Name: campaigns Businesses can create campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Businesses can create campaigns" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (((auth.uid() = business_id) AND public.has_role(auth.uid(), 'business'::public.app_role)));


--
-- Name: campaign_tiers Businesses can manage own campaign tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Businesses can manage own campaign tiers" ON public.campaign_tiers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.campaigns
  WHERE ((campaigns.id = campaign_tiers.campaign_id) AND (campaigns.business_id = auth.uid())))));


--
-- Name: campaigns Businesses can update own campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Businesses can update own campaigns" ON public.campaigns FOR UPDATE TO authenticated USING ((auth.uid() = business_id));


--
-- Name: content_submissions Businesses can update submission status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Businesses can update submission status" ON public.content_submissions FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.campaigns
  WHERE ((campaigns.id = content_submissions.campaign_id) AND (campaigns.business_id = auth.uid())))));


--
-- Name: campaigns Businesses can view own campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Businesses can view own campaigns" ON public.campaigns FOR SELECT TO authenticated USING ((auth.uid() = business_id));


--
-- Name: content_submissions Businesses can view submissions for their campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Businesses can view submissions for their campaigns" ON public.content_submissions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.campaigns
  WHERE ((campaigns.id = content_submissions.campaign_id) AND (campaigns.business_id = auth.uid())))));


--
-- Name: content_submissions Creators can create submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Creators can create submissions" ON public.content_submissions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = creator_id));


--
-- Name: earnings Creators can view own earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Creators can view own earnings" ON public.earnings FOR SELECT TO authenticated USING ((auth.uid() = creator_id));


--
-- Name: content_submissions Creators can view own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Creators can view own submissions" ON public.content_submissions FOR SELECT TO authenticated USING ((auth.uid() = creator_id));


--
-- Name: earnings System can manage earnings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage earnings" ON public.earnings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Users can add business role to self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add business role to self" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (role = 'business'::public.app_role)));


--
-- Name: user_roles Users can add creator role to self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add creator role to self" ON public.user_roles FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (role = 'creator'::public.app_role)));


--
-- Name: favorites Users can add favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: tiktok_accounts Users can delete own tiktok accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own tiktok accounts" ON public.tiktok_accounts FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: business_profiles Users can insert own business profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own business profile" ON public.business_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: tiktok_accounts Users can insert own tiktok accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own tiktok accounts" ON public.tiktok_accounts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: favorites Users can remove favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: business_profiles Users can update own business profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own business profile" ON public.business_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: tiktok_accounts Users can update own tiktok accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own tiktok accounts" ON public.tiktok_accounts FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: favorites Users can view own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: business_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_tiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaign_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: content_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: earnings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tiktok_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tiktok_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;