-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE CHECK (length(name) > 0 AND length(name) <= 50),
description text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL UNIQUE,
display_name text,
avatar_url text,
bio text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.prompt_categories (
prompt_id uuid NOT NULL,
category_id uuid NOT NULL,
created_at timestamp with time zone DEFAULT now(),
description character varying,
CONSTRAINT prompt_categories_pkey PRIMARY KEY (prompt_id, category_id),
CONSTRAINT prompt_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
CONSTRAINT prompt_categories_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id)
);
CREATE TABLE public.prompt_tags (
prompt_id uuid NOT NULL,
tag_id uuid NOT NULL,
created_at timestamp with time zone DEFAULT now(),
description character varying,
CONSTRAINT prompt_tags_pkey PRIMARY KEY (prompt_id, tag_id),
CONSTRAINT prompt_tags_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id),
CONSTRAINT prompt_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.prompts (
id uuid NOT NULL DEFAULT gen_random_uuid(),
title text NOT NULL CHECK (length(title) > 0),
content text NOT NULL CHECK (length(content) > 0),
description text,
is_public boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
author text,
author_name text,
notes text,
CONSTRAINT prompts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tags (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name text NOT NULL UNIQUE CHECK (length(name) > 0 AND length(name) <= 50),
created_at timestamp with time zone DEFAULT now(),
description text,
CONSTRAINT tags_pkey PRIMARY KEY (id)
);
