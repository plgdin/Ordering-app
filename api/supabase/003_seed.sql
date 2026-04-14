insert into public.stores (
  slug,
  name,
  category,
  eta_min,
  eta_max,
  distance_km,
  rating,
  delivery_tag,
  highlight,
  image_url,
  otc_only
) values
  (
    'more',
    'More Daily Mart',
    'Groceries',
    18,
    25,
    2.1,
    4.7,
    'Free pickup if clubbed with nearby stores',
    'Fruits, milk, staples, and premium pantry',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=300&fit=crop',
    false
  ),
  (
    'pharma',
    'HealthPoint Pharmacy',
    'Pharmacy',
    20,
    28,
    3.4,
    4.8,
    'Only non-prescription items enabled',
    'Wellness, baby care, hygiene, OTC products',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=300&fit=crop',
    true
  ),
  (
    'bakery',
    'Daily Crust Bakery',
    'Bakery',
    16,
    22,
    1.6,
    4.9,
    'Stack on-route pickups to save delivery fees',
    'Fresh breads, cakes, buns, and tea-time snacks',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=300&fit=crop',
    false
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  eta_min = excluded.eta_min,
  eta_max = excluded.eta_max,
  distance_km = excluded.distance_km,
  rating = excluded.rating,
  delivery_tag = excluded.delivery_tag,
  highlight = excluded.highlight,
  image_url = excluded.image_url,
  otc_only = excluded.otc_only;

insert into public.products (
  store_id,
  name,
  price,
  unit,
  in_stock,
  is_otc,
  requires_prescription
)
select id, 'Toned Milk 500ml', 28, 'pack', true, false, false
from public.stores
where slug = 'more'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Basmati Rice 1kg', 98, 'bag', true, false, false
from public.stores
where slug = 'more'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Farm Eggs (6 pcs)', 54, 'tray', true, false, false
from public.stores
where slug = 'more'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Amul Butter 100g', 56, 'pack', true, false, false
from public.stores
where slug = 'more'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Aashirvaad Atta 5kg', 265, 'bag', true, false, false
from public.stores
where slug = 'more'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Vitamin C 500mg (30)', 145, 'strip', true, true, false
from public.stores
where slug = 'pharma'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Band-Aid Pack (10)', 35, 'box', true, true, false
from public.stores
where slug = 'pharma'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Hand Sanitizer 200ml', 85, 'bottle', true, true, false
from public.stores
where slug = 'pharma'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Sandwich Loaf', 45, 'loaf', true, false, false
from public.stores
where slug = 'bakery'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Butter Croissant', 60, 'piece', true, false, false
from public.stores
where slug = 'bakery'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;

insert into public.products (store_id, name, price, unit, in_stock, is_otc, requires_prescription)
select id, 'Chocolate Cake Slice', 85, 'slice', true, false, false
from public.stores
where slug = 'bakery'
on conflict (store_id, name) do update set
  price = excluded.price,
  unit = excluded.unit,
  in_stock = excluded.in_stock,
  is_otc = excluded.is_otc,
  requires_prescription = excluded.requires_prescription;
