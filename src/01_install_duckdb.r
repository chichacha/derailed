
library(DBI)
install.packages("duckdb")
library(duckdb)


getwd()
# Create a persistent DuckDB database
con <- dbConnect(
  duckdb(),
  dbdir = "geolab.duckdb"
)


#dbExecute(con, "DROP TABLE IF EXISTS places")

dbExecute(con, "
  CREATE SCHEMA IF NOT EXISTS reference
")



dbExecute(con, "
  CREATE OR REPLACE TABLE reference.places AS
  SELECT *
  FROM (VALUES

    -- Japan
    ('Shibuya',       'JP', 'Tokyo',           'ward',         35.6595,  139.7005),
    ('Shinjuku',      'JP', 'Tokyo',           'ward',         35.6938,  139.7034),
    ('Ginza',         'JP', 'Tokyo',           'neighborhood', 35.6717,  139.7650),
    ('Kyoto',         'JP', 'Kyoto',           'city',         35.0116,  135.7681),
    ('Osaka',         'JP', 'Osaka',           'city',         34.6937,  135.5023),
    ('Nagoya',        'JP', 'Aichi',           'city',         35.1815,  136.9066),

    -- Canada
    ('Vancouver',     'CA', 'British Columbia','city',         49.2827, -123.1207),
    ('Toronto',       'CA', 'Ontario',         'city',         43.6532,  -79.3832),
    ('Montreal',      'CA', 'Quebec',          'city',         45.5017,  -73.5673),
    ('Calgary',       'CA', 'Alberta',         'city',         51.0447, -114.0719),
    ('Ottawa',        'CA', 'Ontario',         'city',         45.4215,  -75.6972),
    ('Quebec City',   'CA', 'Quebec',          'city',         46.8139,  -71.2080),

    -- United States
    ('New York',      'US', 'New York',        'city',         40.7128,  -74.0060),
    ('Los Angeles',   'US', 'California',      'city',         34.0522, -118.2437),
    ('San Francisco', 'US', 'California',      'city',         37.7749, -122.4194),
    ('Chicago',       'US', 'Illinois',        'city',         41.8781,  -87.6298),
    ('Seattle',       'US', 'Washington',      'city',         47.6062, -122.3321)

  ) AS t(
    place_name,
    country_code,
    admin_region,
    place_type,
    latitude,
    longitude
  )
")

dbGetQuery(con, "
  SELECT *
  FROM reference.places
  ORDER BY country_code, place_name
")


# Verify
dbGetQuery(con, "SELECT * FROM reference.places")



# List schemas
dbGetQuery(con, "
  SELECT schema_name
  FROM information_schema.schemata
")

# List tables and their schemas
dbGetQuery(con, "
  SELECT table_schema, table_name
  FROM information_schema.tables
  WHERE table_type = 'BASE TABLE'
")


# Close the connection
dbDisconnect(con)
