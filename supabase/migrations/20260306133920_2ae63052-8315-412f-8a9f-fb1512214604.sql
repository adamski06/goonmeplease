UPDATE public.business_profiles 
SET logo_url = 'https://logo.clearbit.com/' || lower(split_part(replace(replace(logo_url, 'https://logo.clearbit.com/', ''), 'http://logo.clearbit.com/', ''), '?', 1)) || '?size=512&format=png'
WHERE logo_url LIKE '%logo.clearbit.com%';