-- =============================================================================
-- seed.sql - OPTIONAL sample data for local development.
--
-- Every record below is fictional placeholder data used to exercise the UI.
-- The companies, salaries and application links are NOT real. Delete these rows
-- before launching the site publicly:
--
--   delete from public.jobs where id in (
--     'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
--     'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
--   );
--
-- Safe to run more than once (existing rows are left untouched).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------

insert into public.categories (id, name, slug, description)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Software Engineering',
    'software-engineering',
    'Engineering roles covering web, mobile and backend development.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Design',
    'design',
    'Product design, UX research and visual design roles.'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Marketing',
    'marketing',
    'Growth, content and performance marketing roles.'
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Jobs (sample records - fictional)
-- -----------------------------------------------------------------------------

-- Published example.
insert into public.jobs (
  id,
  title,
  slug,
  company_name,
  location,
  employment_type,
  salary,
  category_id,
  description,
  responsibilities,
  requirements,
  featured_image_alt,
  seo_title,
  seo_description,
  seo_keywords,
  how_to_apply,
  application_url,
  status,
  published_at
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Sample Listing: Frontend Developer (Demo Data)',
  'sample-listing-frontend-developer-demo-data',
  'Example Demo Company (sample record - not a real employer)',
  'Remote',
  'Full-time',
  'Not specified',
  '11111111-1111-4111-8111-111111111111',
  'This is placeholder demo content used to check that the job listing pages render correctly. Replace it with a real job advertisement from the admin panel.',
  E'Build and maintain user interfaces.\nCollaborate with designers and backend engineers.\nWrite tests for new functionality.',
  E'Experience with modern JavaScript frameworks.\nFamiliarity with accessibility fundamentals.\nComfortable working in a remote team.',
  'Placeholder illustration for a sample job listing',
  'Sample Listing: Frontend Developer (Demo Data)',
  'Placeholder demo listing used to verify the job portal layout. Not a real vacancy.',
  'demo, sample data, frontend developer',
  '[
    {"step": 1, "title": "Open the application page", "description": "Follow the Apply Now link to the employer website."},
    {"step": 2, "title": "Complete the application form", "description": "Fill in your details and attach your CV."},
    {"step": 3, "title": "Submit before the deadline", "description": "Review your answers and submit the application."}
  ]'::jsonb,
  'https://example.com/careers/demo-application',
  'published',
  now()
)
on conflict (id) do nothing;

-- Draft example (not visible on the public site).
insert into public.jobs (
  id,
  title,
  slug,
  company_name,
  location,
  employment_type,
  salary,
  category_id,
  description,
  responsibilities,
  requirements,
  how_to_apply,
  application_url,
  status
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'Sample Listing: Product Designer (Demo Data, Draft)',
  'sample-listing-product-designer-demo-data-draft',
  'Example Demo Studio (sample record - not a real employer)',
  'Lahore, Pakistan',
  'Contract',
  'Not specified',
  '22222222-2222-4222-8222-222222222222',
  'This placeholder record stays in draft status so you can confirm that unpublished jobs never appear on the public site.',
  E'Produce wireframes and prototypes.\nRun usability sessions.',
  E'A portfolio of product design work.\nComfort with design systems.',
  '[
    {"step": 1, "title": "Prepare your portfolio", "description": "Collect two or three relevant case studies."},
    {"step": 2, "title": "Apply online", "description": "Send your portfolio through the application link."}
  ]'::jsonb,
  'https://example.com/careers/demo-application-draft',
  'draft'
)
on conflict (id) do nothing;
