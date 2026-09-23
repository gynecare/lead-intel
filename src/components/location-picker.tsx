"use client";

import { useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";
import { X } from "lucide-react";

type Props = {
  label: string;
  countries: string[];
  regions: string[];
  cities: string[];
  onChange: (next: {
    countries: string[];
    regions: string[];
    cities: string[];
  }) => void;
};

export function LocationPicker({
  label,
  countries,
  regions,
  cities,
  onChange,
}: Props) {
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return allCountries.slice(0, 50);
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [allCountries, countrySearch]);

  const availableRegions = useMemo(() => {
    const list: { code: string; name: string; countryCode: string }[] = [];
    countries.forEach((countryIso) => {
      State.getStatesOfCountry(countryIso).forEach((s) =>
        list.push({ code: s.isoCode, name: s.name, countryCode: countryIso })
      );
    });
    return list;
  }, [countries]);

  const availableCities = useMemo(() => {
    const list: { name: string; stateCode: string; countryCode: string }[] = [];
    regions.forEach((regionCode) => {
      const countryIso = countries.find((c) =>
        State.getStatesOfCountry(c).some((s) => s.isoCode === regionCode)
      );
      if (!countryIso) return;
      City.getCitiesOfState(countryIso, regionCode).forEach((c) =>
        list.push({
          name: c.name,
          stateCode: regionCode,
          countryCode: countryIso,
        })
      );
    });
    return list.slice(0, 100);
  }, [regions, countries]);

  function toggleCountry(iso: string) {
    const next = countries.includes(iso)
      ? countries.filter((c) => c !== iso)
      : [...countries, iso];
    onChange({ countries: next, regions: [], cities: [] });
  }

  function toggleRegion(code: string) {
    const next = regions.includes(code)
      ? regions.filter((r) => r !== code)
      : [...regions, code];
    onChange({ countries, regions: next, cities: [] });
  }

  function toggleCity(name: string) {
    const next = cities.includes(name)
      ? cities.filter((c) => c !== name)
      : [...cities, name];
    onChange({ countries, regions, cities: next });
  }

  return (
    <div className="space-y-4">
      {label && <div className="text-sm font-medium text-slate-300">{label}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COUNTRIES */}
        <div className="border border-slate-700 rounded-lg p-3 bg-slate-900">
          <div className="text-xs uppercase text-slate-500 mb-2">Countries</div>
          <input
            type="text"
            placeholder="Search countries…"
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            className="w-full text-sm px-2 py-1.5 mb-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
          />
          <div className="max-h-56 overflow-y-auto space-y-1">
            {filteredCountries.map((c) => {
              const selected = countries.includes(c.isoCode);
              return (
                <button
                  key={c.isoCode}
                  type="button"
                  onClick={() => toggleCountry(c.isoCode)}
                  className={`w-full text-left text-sm px-2 py-1 rounded transition ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  {c.name} ({c.isoCode})
                </button>
              );
            })}
          </div>
        </div>

        {/* REGIONS */}
        <div className="border border-slate-700 rounded-lg p-3 bg-slate-900">
          <div className="text-xs uppercase text-slate-500 mb-2">
            States / Regions
          </div>
          {countries.length === 0 ? (
            <p className="text-xs text-slate-500">Select a country first</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableRegions.map((r) => {
                const selected = regions.includes(r.code);
                return (
                  <button
                    key={`${r.countryCode}-${r.code}`}
                    type="button"
                    onClick={() => toggleRegion(r.code)}
                    className={`w-full text-left text-sm px-2 py-1 rounded transition ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CITIES */}
        <div className="border border-slate-700 rounded-lg p-3 bg-slate-900">
          <div className="text-xs uppercase text-slate-500 mb-2">Cities</div>
          {regions.length === 0 ? (
            <p className="text-xs text-slate-500">Select a region first</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableCities.map((c) => {
                const selected = cities.includes(c.name);
                return (
                  <button
                    key={`${c.stateCode}-${c.name}`}
                    type="button"
                    onClick={() => toggleCity(c.name)}
                    className={`w-full text-left text-sm px-2 py-1 rounded transition ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {countries.map((c) => (
          <Chip
            key={`c-${c}`}
            label={Country.getCountryByCode(c)?.name ?? c}
            onRemove={() => toggleCountry(c)}
          />
        ))}
        {regions.map((r) => (
          <Chip key={`r-${r}`} label={r} onRemove={() => toggleRegion(r)} />
        ))}
        {cities.map((c) => (
          <Chip key={`t-${c}`} label={c} onRemove={() => toggleCity(c)} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-900 text-blue-100">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-white">
        <X size={12} />
      </button>
    </span>
  );
}