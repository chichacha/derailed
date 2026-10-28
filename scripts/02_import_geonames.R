
# ============================================================
# DERAILED GeoLab
# 02_import_geonames.R
#
# Source: https://www.geonames.org/
# Dataset: cities15000
# License: CC BY 4.0
# ============================================================

library(DBI)
library(duckdb)
library(readr)

# 1. Define source and local paths ----------------------------

source_url <- paste0(
  "https://download.geonames.org/export/dump/",
  "cities15000.zip"
)

raw_dir <- "data/raw/geonames"

dir.create(raw_dir, recursive = TRUE, showWarnings = FALSE)

zip_path <- file.path(raw_dir, "cities15000.zip")
txt_path <- file.path(raw_dir, "cities15000.txt")


# 2. Download and extract -------------------------------------

if (!file.exists(zip_path)) {
  download.file(source_url, zip_path, mode = "wb")
}

if (!file.exists(txt_path)) {
  unzip(zip_path, exdir = raw_dir)
}


# 3. Define the 19 GeoNames columns ---------------------------

geonames_columns <- c(
  "geonameid",
  "name",
  "asciiname",
  "alternatenames",
  "latitude",
  "longitude",
  "feature_class",
  "feature_code",
  "country_code",
  "cc2",
  "admin1_code",
  "admin2_code",
  "admin3_code",
  "admin4_code",
  "population",
  "elevation",
  "dem",
  "timezone",
  "modification_date"
)


# 4. Read the downloaded file into R --------------------------

cities <- read_tsv(
  txt_path,
  col_names = geonames_columns,
  col_types = cols(
    .default = col_character(),
    geonameid = col_integer(),
    latitude = col_double(),
    longitude = col_double(),
    population = col_double(),
    elevation = col_integer(),
    dem = col_integer(),
    modification_date = col_date()
  ),
  quote = "",
  show_col_types = FALSE
)

# Validate the import
stopifnot(ncol(cities) == 19)
print(problems(cities))
print(dim(cities))


# 5. Connect to DuckDB ----------------------------------------

con <- dbConnect(
  duckdb(),
  dbdir = "geolab.duckdb"
)

# Create a schema for source-aligned data
dbExecute(con, "
  CREATE SCHEMA IF NOT EXISTS raw
")


# 6. Load into DuckDB -----------------------------------------

dbWriteTable(
  con,
  Id(schema = "raw", table = "geonames_cities15000"),
  cities,
  overwrite = TRUE
)


# 7. Verify the result ----------------------------------------

result <- dbGetQuery(con, "
  SELECT
    country_code,
    COUNT(*) AS city_count
  FROM raw.geonames_cities15000
  GROUP BY country_code
  ORDER BY city_count DESC
  LIMIT 10
")

print(result)

# Close the connection
dbDisconnect(con)
