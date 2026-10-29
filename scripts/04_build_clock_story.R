# DERAILED GeoLab — How did Vancouver move one hour away from Seattle?
# Run from the repository in Positron, after importing GeoNames:
#   source("scripts/04_build_clock_story.R")
#
# Packages: DBI, duckdb, fs, here, tibble, jsonlite
# GeoNames supplies place coordinates and time-zone IDs, not legal clock rules.
# The offsets below are editorial facts for TWO specified UTC instants,
# not a general-purpose time-zone conversion service.

build_clock_story <- function() {

  # 1 / Locate inputs and output -----------------------------------------------
  # here finds the repository root; fs makes paths and directories explicit.
  root <- here::here()
  database_path <- fs::path(root, "geolab.duckdb")
  output_path <- fs::path(
    root, "stories", "vancouver-seattle", "data", "clock_story.json"
  )

  if (!fs::file_exists(database_path)) {
    stop("DuckDB database not found: ", database_path,
         "\nRun scripts/02_import_geonames.R first.")
  }

  # A function lets on.exit() close DuckDB even when a validation fails.
  con <- DBI::dbConnect(duckdb::duckdb(), dbdir = database_path)
  on.exit(DBI::dbDisconnect(con, shutdown = TRUE), add = TRUE)

  DBI::dbExecute(con, "CREATE SCHEMA IF NOT EXISTS analysis")

  # 2 / Choose places ----------------------------------------------------------
  # tribble is easy to scan and edit as the editorial cast grows.
  # Display labels currently match lookup names; they can diverge later.
  wanted <- tibble::tribble(
    ~id,             ~lookup_name,   ~country_code, ~region,
    "vancouver",     "Vancouver",    "CA",          "British Columbia",
    "seattle",       "Seattle",      "US",          "Washington",
    "san-francisco", "San Francisco","US",          "California",
    "victoria",      "Victoria",     "CA",          "British Columbia",
    "fort-st-john",  "Fort St. John","CA",          "British Columbia",
    "calgary",       "Calgary",      "CA",          "Alberta",
    "toronto",       "Toronto",      "CA",          "Ontario",
    "st-johns",      "St. John's",   "CA",          "Newfoundland and Labrador"
  )
  wanted$display_name <- wanted$lookup_name
  wanted$display_order <- seq_len(nrow(wanted))

  DBI::dbWriteTable(
    con, DBI::Id(schema = "analysis", table = "clock_place_selection"),
    wanted, overwrite = TRUE
  )

  # 3 / Join GeoNames ----------------------------------------------------------
  # Prefer the largest population when names are duplicated in a country.
  # Preserve source fields so the result is traceable back to GeoNames.
  places <- DBI::dbGetQuery(con, "
    SELECT
      w.id, w.display_name, w.region, w.country_code, w.display_order,
      g.geonameid, g.name AS source_name,
      g.latitude, g.longitude, g.timezone AS geonames_timezone,
      g.population
    FROM analysis.clock_place_selection AS w
    JOIN raw.geonames_cities15000 AS g
      ON lower(w.lookup_name) = lower(g.name)
     AND w.country_code = g.country_code
    QUALIFY row_number() OVER (
      PARTITION BY w.id
      ORDER BY g.population DESC NULLS LAST, g.geonameid
    ) = 1
    ORDER BY w.display_order
  ") |>
    tibble::as_tibble()

  missing <- setdiff(wanted$id, places$id)
  if (length(missing) > 0) {
    stop("No GeoNames match for: ", paste(missing, collapse = ", "),
         ". Check spelling and cities15000 coverage.")
  }
  stopifnot(
    nrow(places) == nrow(wanted),
    !anyNA(places$latitude),
    !anyNA(places$longitude)
  )

  # Save this resolved selection so later SQL doesn't repeat the GeoNames join.
  DBI::dbWriteTable(
    con, DBI::Id(schema = "analysis", table = "clock_story_places"),
    places, overwrite = TRUE
  )

  # 4 / Define dates and clock rules ------------------------------------------
  # Both snapshots are at 16:00 UTC, i.e. 09:00 in Vancouver.
  scenarios <- tibble::tribble(
    ~id,      ~label,              ~utc_instant,
    "before", "October 31, 2026",  "2026-10-31T16:00:00Z",
    "after",  "November 2, 2026",  "2026-11-02T16:00:00Z"
  )

  # Offsets are in MINUTES, not hours (Newfoundland needs a half-hour).
  # These are explicitly authored for the dates above, not derived from
  # GeoNames timezone strings or the machine's installed tzdb.
  offsets <- tibble::tribble(
    ~id,             ~before, ~after,
    "vancouver",       -420L,   -420L,
    "seattle",         -420L,   -480L,
    "san-francisco",   -420L,   -480L,
    "victoria",        -420L,   -420L,
    "fort-st-john",    -420L,   -420L,
    "calgary",         -360L,   -360L,
    "toronto",         -240L,   -300L,
    "st-johns",        -150L,   -210L
  )

  # Same place IDs, same order: easier to see missing or accidental edits.
  stopifnot(identical(wanted$id, offsets$id))

  facts <- tibble::tibble(
    scenario_id = rep(scenarios$id, each = nrow(offsets)),
    id = rep(offsets$id, times = nrow(scenarios)),
    utc_offset_minutes = c(offsets$before, offsets$after)
  )

  DBI::dbWriteTable(
    con, DBI::Id(schema = "analysis", table = "clock_scenario_offsets"),
    facts, overwrite = TRUE
  )

  # 5 / Build a scenario × place snapshot in DuckDB ---------------------------
  rows <- DBI::dbGetQuery(con, "
    SELECT
      o.scenario_id, o.id, o.utc_offset_minutes,
      p.display_name, p.region, p.country_code,
      p.latitude, p.longitude, p.geonameid, p.geonames_timezone
    FROM analysis.clock_scenario_offsets AS o
    JOIN analysis.clock_story_places AS p ON p.id = o.id
    ORDER BY
      CASE o.scenario_id WHEN 'before' THEN 1 ELSE 2 END,
      p.display_order
  ") |>
    tibble::as_tibble()

  # Only the two specified UTC instants are converted.
  # Adding minutes to a UTC timestamp avoids stale BC tzdb on older Macs.
  utc_strings <- scenarios$utc_instant[
    match(rows$scenario_id, scenarios$id)
  ]
  utc_times <- as.POSIXct(
    utc_strings, format = "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"
  )
  rows$local_time <- format(
    utc_times + rows$utc_offset_minutes * 60,
    "%H:%M", tz = "UTC"
  )

  # Validate all eight cities and both dates before writing publishable JSON.
  stopifnot(
    nrow(rows) == nrow(wanted) * nrow(scenarios),
    !anyDuplicated(rows[c("scenario_id", "id")]),
    !anyNA(rows$utc_offset_minutes),
    !anyNA(rows$local_time)
  )

  get_offset <- function(scene, city) {
    rows$utc_offset_minutes[rows$scenario_id == scene & rows$id == city]
  }
  stopifnot(
    get_offset("before", "vancouver") == get_offset("before", "seattle"),
    get_offset("after", "vancouver") - get_offset("after", "seattle") == 60L,
    get_offset("after", "vancouver") - get_offset("after", "san-francisco") == 60L,
    get_offset("after", "toronto") - get_offset("after", "vancouver") == 120L,
    get_offset("before", "calgary") == get_offset("after", "calgary"),
    get_offset("before", "st-johns") == -150L,
    get_offset("after", "st-johns") == -210L
  )

  DBI::dbWriteTable(
    con, DBI::Id(schema = "analysis", table = "clock_story_snapshot"),
    rows, overwrite = TRUE
  )
  DBI::dbExecute(con, "
    COMMENT ON TABLE analysis.clock_story_snapshot IS
    'Dated editorial clock comparison for Oct 31 and Nov 2 2026.
     GeoNames coordinates plus independently sourced offset facts.
     Not a general time-zone rules engine.'
  ")

  # 6 / Export the browser's JSON contract ------------------------------------
  # Keep the shape expected by stories/vancouver-seattle/clock.js:
  # { metadata, places: [...], scenarios: [{ id, label, utc_instant, clocks }] }
  place_list <- lapply(seq_len(nrow(places)), function(i) {
    list(
      id = places$id[[i]],
      name = places$display_name[[i]],
      region = places$region[[i]],
      country_code = places$country_code[[i]],
      geonameid = as.integer(places$geonameid[[i]]),
      latitude = as.numeric(places$latitude[[i]]),
      longitude = as.numeric(places$longitude[[i]]),
      geonames_timezone = places$geonames_timezone[[i]]
    )
  })

  scenario_list <- lapply(seq_len(nrow(scenarios)), function(i) {
    scenario <- scenarios[i, ]
    selected <- rows[rows$scenario_id == scenario$id, ]

    list(
      id = scenario$id[[1]],
      label = scenario$label[[1]],
      utc_instant = scenario$utc_instant[[1]],
      clocks = lapply(seq_len(nrow(selected)), function(j) {
        list(
          id = selected$id[[j]],
          local_time = selected$local_time[[j]],
          utc_offset_minutes = as.integer(selected$utc_offset_minutes[[j]])
        )
      })
    )
  })

  payload <- list(
    metadata = list(
      data_status = "geonames_rebuilt",
      generated_utc = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
      place_source = "GeoNames cities15000 (CC BY 4.0)",
      place_source_url = "https://download.geonames.org/export/dump/cities15000.zip",
      explanation = paste(
        "GeoNames provides representative place coordinates and IANA IDs.",
        "Clock offsets are explicitly curated for these two UTC instants,",
        "not inferred from GeoNames or the host time-zone database."
      ),
      rule_sources = c(
        "https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time",
        "https://news.gov.bc.ca/releases/2026CITZ0009-001073",
        "https://apps.leg.wa.gov/rcw/default.aspx?cite=1.20.051",
        "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst",
        "https://www.alberta.ca/albertas-new-time-system-abt",
        "https://www.timeanddate.com/time/zone/canada/st-johns"
      )
    ),
    places = place_list,
    scenarios = scenario_list
  )

  fs::dir_create(fs::path_dir(output_path))
  jsonlite::write_json(
    payload, output_path, auto_unbox = TRUE, pretty = TRUE, digits = 7
  )

  message("Wrote ", output_path)
  message("Places: ", nrow(places), " | scenarios: ", nrow(scenarios))
  print(rows[, c(
    "scenario_id", "display_name", "geonames_timezone",
    "utc_offset_minutes", "local_time"
  )])

  invisible(output_path)
}

build_clock_story()
