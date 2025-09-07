-- Database updates to add categories table and description field to tags

-- Add description field to existing tags table
ALTER TABLE public.tags ADD COLUMN description text;

-- Create categories table similar to tags table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (length(name) > 0 AND length(name) <= 50),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- Create prompt_categories junction table (similar to prompt_tags)
CREATE TABLE public.prompt_categories (
  prompt_id uuid NOT NULL,
  category_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  description character varying,
  CONSTRAINT prompt_categories_pkey PRIMARY KEY (prompt_id, category_id),
  CONSTRAINT prompt_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT prompt_categories_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id)
);

-- Note: You'll need to run these commands in your Supabase SQL editor
-- After running these, the application will be updated to use the new structure