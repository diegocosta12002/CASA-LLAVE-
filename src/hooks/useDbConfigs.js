import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Central hook for fetching BuildConfig records from the database.
 * Used by all configurator steps so admin price changes reflect everywhere.
 */
export function useDbConfigs() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["buildconfigs"],
    queryFn: () => base44.entities.BuildConfig.list("-created_date", 500),
    staleTime: 60_000,
  });
  return { dbConfigs: data, isLoading };
}

/**
 * Given a list of static options and the DB configs array,
 * returns the options with their values overridden by DB values where available.
 *
 * @param {Array} staticOptions  - original hardcoded options array
 * @param {string} prefix        - config_key prefix in DB (e.g. "flooring_", "plumbing_")
 * @param {string} costField     - which field to override: "costPerM2" | "costAdd" | "costPerBathroom"
 * @param {Array} dbConfigs      - records from BuildConfig entity
 */
export function mergeWithDb(staticOptions, prefix, costField, dbConfigs) {
  return staticOptions.map(opt => {
    const dbRecord = dbConfigs.find(r => r.config_key === `${prefix}${opt.key}`);
    if (!dbRecord) return opt;
    return {
      ...opt,
      label: dbRecord.label ?? opt.label,
      description: dbRecord.description ?? opt.description,
      [costField]: dbRecord.value ?? opt[costField],
    };
  });
}