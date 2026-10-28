# DERAILED GeoLab — How did Vancouver move one hour away from Seattle?
# Run from the DERAILED repository root, after your GeoNames import:
#   source("scripts/03_build_clock_story.R")
# Requires: DBI, duckdb, jsonlite
#
# GeoNames supplies coordinates and place identifiers, NOT legal time rules.
# Clock offsets below are explicitly verified editorial facts for TWO dates.
# Do not generalize these rows into a full time-zone conversion service.

library(DBI)
library(duckdb)
library(jsonlite)

stopifnot(file.exists("geolab.duckdb"))
output_path <- "stories/vancouver-seattle/data/clock_story.json"
dir.create(dirname(output_path), recursive = TRUE, showWarnings = FALSE)

con <- dbConnect(duckdb::duckdb(), dbdir = "geolab.duckdb")
## Close connection at end of script; avoid opening another writable connection in Positron.

dbExecute(con, "CREATE SCHEMA IF NOT EXISTS analysis")

# Step 1: select a SMALL group of places for the editorial comparison.
# This list supplies editorial identities; GeoNames supplies coordinates.
wanted <- data.frame(
  id = c("vancouver", "seattle", "san-francisco", "toronto", "victoria", "fort-st-john"),
  lookup_name = c("Vancouver", "Seattle", "San Francisco", "Toronto", "Victoria", "Fort St. John"),
  country_code = c("CA", "US", "US", "CA", "CA", "CA"),
  display_name = c("Vancouver", "Seattle", "San Francisco", "Toronto", "Victoria", "Fort St. John"),
  region = c("British Columbia", "Washington", "California", "Ontario", "British Columbia", "British Columbia"),
  display_order = seq_len(6),
  stringsAsFactors = FALSE
)

dbWriteTable(con, Id(schema = "analysis", table = "clock_place_selection"),
             wanted, overwrite = TRUE)

# Step 2: join curated place names to source-aligned GeoNames records.
# Higher-population names win if names happen to repeat within a country.
places <- dbGetQuery(con, "
  SELECT
    p.id, p.display_name, p.region, p.country_code, p.display_order,
    g.geonameid, g.name AS source_name,
    g.latitude, g.longitude, g.timezone AS geonames_timezone,
    g.population
  FROM analysis.clock_place_selection p
  JOIN raw.geonames_cities15000 g
    ON lower(p.lookup_name) = lower(g.name)
   AND p.country_code = g.country_code
  QUALIFY row_number() OVER (
    PARTITION BY p.id
    ORDER BY g.population DESC NULLS LAST, g.geonameid
  ) = 1
  ORDER BY p.display_order
")

missing <- setdiff(wanted$id, places$id)
if (length(missing)) {
  stop("GeoNames match missing for: ", paste(missing, collapse = ", "),
       ". Check spellings/coverage; don't silently invent coordinates.")
}
stopifnot(nrow(places) == nrow(wanted))

# Step 3: explicit time facts for two instants; not inferred from GeoNames IDs.
# Source: BC government + Washington law + US NIST DST rules.
# October 31, 2026: Pacific Coast cities UTC-7; Toronto UTC-4.
# November 2, 2026: Vancouver/Victoria/Fort St. John UTC-7,
#                  Seattle/San Francisco UTC-8, Toronto UTC-5.
# Note that Fort St. John already kept UTC-7 year-round before 2026.
before <- c(vancouver = -420L, seattle = -420L,
            `san-francisco` = -420L, toronto = -240L,
            victoria = -420L, `fort-st-john` = -420L)
after <- c(vancouver = -420L, seattle = -480L,
           `san-francisco` = -480L, toronto = -300L,
           victoria = -420L, `fort-st-john` = -420L)

scenarios <- data.frame(
  id = c("before", "after"),
  label = c("October 31, 2026", "November 2, 2026"),
  utc_instant = c("2026-10-31T16:00:00Z", "2026-11-02T16:00:00Z"),
  stringsAsFactors = FALSE
)

facts <- do.call(rbind, lapply(scenarios$id, function(s) {
  offsets <- if (s == "before") before else after
  data.frame(scenario_id = s, id = names(offsets),
             utc_offset_minutes = as.integer(offsets),
             stringsAsFactors = FALSE)
}))
row.names(facts) <- NULL

dbWriteTable(con, Id(schema = "analysis", table = "clock_scenario_offsets"),
             facts, overwrite = TRUE)

# Use SQL to combine places, scenarios, and authored offset facts.
rows <- dbGetQuery(con, "
  SELECT
    o.scenario_id, o.id,
    o.utc_offset_minutes,
    p.display_name, p.region,
    p.country_code, p.latitude, p.longitude,
    p.geonameid, p.geonames_timezone
  FROM analysis.clock_scenario_offsets o
  JOIN analysis.clock_place_selection w ON w.id = o.id
  JOIN (
    SELECT
      w.id, w.display_name, w.region, w.country_code, w.display_order,
      g.geonameid, g.latitude, g.longitude,
      g.timezone AS geonames_timezone
    FROM analysis.clock_place_selection w
    JOIN raw.geonames_cities15000 g
      ON lower(w.lookup_name) = lower(g.name)
     AND w.country_code = g.country_code
    QUALIFY row_number() OVER (
      PARTITION BY w.id ORDER BY g.population DESC NULLS LAST, g.geonameid
    ) = 1
  ) p ON p.id = o.id
  ORDER BY CASE WHEN o.scenario_id = 'before' THEN 1 ELSE 2 END,
           w.display_order
")

# Convert UTC instant + AUTHORITATIVELY CHECKED offset, not host time-zone DB.
# This guards against older Macs that haven't yet received the 2026 BC rule.
format_local <- function(utc_string, offset_minutes) {
  instant <- as.POSIXct(utc_string, format = "%Y-%m-%dT%H:%M:%SZ", tz = "UTC")
  format(instant + offset_minutes * 60, "%H:%M", tz = "UTC")
}
rows$local_time <- vapply(seq_len(nrow(rows)), function(i) {
  s <- scenarios$utc_instant[match(rows$scenario_id[i], scenarios$id)]
  format_local(s, rows$utc_offset_minutes[i])
}, character(1))

# Persist a documented, reusable snapshot table to explore inside Positron.
dbWriteTable(con, Id(schema = "analysis", table = "clock_story_snapshot"),
             rows, overwrite = TRUE)
dbExecute(con, "COMMENT ON TABLE analysis.clock_story_snapshot IS
  'Editorial clock comparison for Oct 31 and Nov 2 2026. GeoNames places; externally verified date-specific UTC offsets. Not a general time-zone rules engine.'")

place_list <- lapply(seq_len(nrow(places)), function(i) {
  list(
    id = places$id[i], name = places$display_name[i],
    region = places$region[i], country_code = places$country_code[i],
    geonameid = as.integer(places$geonameid[i]),
    latitude = as.numeric(places$latitude[i]),
    longitude = as.numeric(places$longitude[i]),
    geonames_timezone = places$geonames_timezone[i]
  )
})

scenario_list <- lapply(seq_len(nrow(scenarios)), function(i) {
  s <- scenarios[i, ]
  selected <- rows[rows$scenario_id == s$id, ]
  list(
    id = s$id, label = s$label, utc_instant = s$utc_instant,
    clocks = lapply(seq_len(nrow(selected)), function(j) {
      list(id = selected$id[j], local_time = selected$local_time[j],
           utc_offset_minutes = as.integer(selected$utc_offset_minutes[j]))
    })
  )
})

payload <- list(
  metadata = list(
    data_status = "geonames_rebuilt",
    generated_utc = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
    place_source = "GeoNames cities15000 (CC BY 4.0)",
    place_source_url = "https://download.geonames.org/export/dump/cities15000.zip",
    explanation = paste("GeoNames provides representative place coordinates and IANA IDs.",
                        "Clock offsets are explicitly curated for these two UTC instants,",
                        "not derived from GeoNames or inferred from the host time-zone database."),
    rule_sources = c(
      "https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time",
      "https://news.gov.bc.ca/releases/2026CITZ0009-001073",
      "https://apps.leg.wa.gov/rcw/default.aspx?cite=1.20.051",
      "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-rules"
    )
  ),
  places = place_list,
  scenarios = scenario_list
)

write_json(payload, output_path, auto_unbox = TRUE, pretty = TRUE, digits = 7)
cat("Wrote:", output_path, "\n")
cat("GeoNames places:", length(place_list), "\n")
print(rows[, c("scenario_id", "display_name", "geonames_timezone",
               "utc_offset_minutes", "local_time")])

# Story assertions. Same UTC instant within each scenario, different dates.
get_offset <- function(scene, city) {
  rows$utc_offset_minutes[rows$scenario_id == scene & rows$id == city]
}
stopifnot(
  get_offset("before", "vancouver") == get_offset("before", "seattle"),
  get_offset("after", "vancouver") - get_offset("after", "seattle") == 60L,
  get_offset("after", "vancouver") - get_offset("after", "san-francisco") == 60L,
  get_offset("after", "toronto") - get_offset("after", "vancouver") == 120L
)

# Close the file-backed database before opening it from Positron Data Connections.
dbDisconnect(con, shutdown = TRUE)
