"use client"

import { useMemo } from "react"
import { AVAILABLE_RESOURCE_OPTIONS } from "@/constants/resource-options"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface AvailableResourcesSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  helperText?: string
}

// Utility to split a comma-separated string into trimmed items
const splitResources = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0)

export function AvailableResourcesSelector({
  value,
  onChange,
  label = "Available Resources",
  required,
  helperText,
}: AvailableResourcesSelectorProps) {
  const options = useMemo(() => AVAILABLE_RESOURCE_OPTIONS, [])

  // Derive selections from incoming value
  const incoming = splitResources(value || "")
  const selected = incoming.filter((x) => options.includes(x))
  const other = incoming.filter((x) => !options.includes(x)).join(", ")

  const toggleOption = (opt: string) => {
    const isSelected = selected.includes(opt)
    const nextSelected = isSelected ? selected.filter((x) => x !== opt) : [...selected, opt]
    const parts = [...nextSelected]
    const otherTrim = other.trim()
    if (otherTrim.length > 0) parts.push(otherTrim)
    onChange(parts.join(", "))
  }

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const parts = [...selected]
    const otherTrim = val.trim()
    if (otherTrim.length > 0) parts.push(otherTrim)
    onChange(parts.join(", "))
  }

  return (
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 bg-white">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggleOption(opt)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor="resources-other" className="text-gray-700">
          Other (comma-separated if multiple)
        </Label>
        <Input
          id="resources-other"
          value={other}
          onChange={handleOtherChange}
          placeholder="Type any additional resources not listed"
        />
        <p className="text-xs text-gray-500">
          Selected values are saved as a single comma-separated list.
        </p>
      </div>
    </div>
  )
}