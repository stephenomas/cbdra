"use client"

import { useEffect, useMemo, useState } from "react"
import { AVAILABLE_RESOURCE_OPTIONS } from "@/constants/resource-options"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface AvailableResourcesSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  helperText?: string
  optionsOverride?: string[]
  showOther?: boolean
}

// Utility to split a delimited string into trimmed items.
// Prefer pipe '|' delimiter to avoid conflicts with option labels containing commas.
const splitResources = (s: string) => {
  const source = (s || "").trim()
  if (!source) return []
  // Preferred delimiter
  if (source.includes("|")) {
    return source.split("|").map((x) => x.trim()).filter(Boolean)
  }
  // If the entire string matches an option, treat as single item
  if (AVAILABLE_RESOURCE_OPTIONS.includes(source)) {
    return [source]
  }
  // Legacy: comma-delimited values saved earlier
  return source.split(",").map((x) => x.trim()).filter(Boolean)
}

export function AvailableResourcesSelector({
  value,
  onChange,
  label = "Available Resources",
  required,
  helperText,
  optionsOverride,
  showOther = true,
}: AvailableResourcesSelectorProps) {
  const options = useMemo(() => optionsOverride ?? AVAILABLE_RESOURCE_OPTIONS, [optionsOverride])

  // Derive selections from incoming value
  const incoming = splitResources(value || "")
  const selected = incoming.filter((x) => options.includes(x))
  const derivedOther = incoming.filter((x) => !options.includes(x)).join(", ")

  // Local state to allow free typing (spaces/commas) without immediate normalization
  const [otherInput, setOtherInput] = useState<string>(derivedOther)
  const [otherFocused, setOtherFocused] = useState<boolean>(false)

  // Keep local input in sync with external value when not editing
  useEffect(() => {
    if (!otherFocused) {
      setOtherInput(derivedOther)
    }
  }, [derivedOther, otherFocused])

  const toggleOption = (opt: string) => {
    const isSelected = selected.includes(opt)
    const nextSelected = isSelected ? selected.filter((x) => x !== opt) : [...selected, opt]
    const parts = [...nextSelected]
    const otherTrim = otherInput.trim()
    if (otherTrim.length > 0 && showOther) {
      // Split display "Other" field on comma (user preference)
      const otherTokens = otherTrim.split(",").map((x) => x.trim()).filter(Boolean)
      parts.push(...otherTokens)
    }
    onChange(parts.join("|"))
  }

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherInput(e.target.value)
  }

  const handleOtherBlur = () => {
    const parts = [...selected]
    const otherTrim = otherInput.trim()
    if (otherTrim.length > 0) {
      const otherTokens = otherTrim.split(",").map((x) => x.trim()).filter(Boolean)
      parts.push(...otherTokens)
    }
    onChange(parts.join("|"))
    setOtherFocused(false)
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
      {showOther && (
        <div className="space-y-1">
          <Label htmlFor="resources-other" className="text-gray-700">
            Other (separate with , if multiple)
          </Label>
          <Input
            id="resources-other"
            value={otherInput}
            onChange={handleOtherChange}
            onFocus={() => setOtherFocused(true)}
            onBlur={handleOtherBlur}
            placeholder="Type any additional resources not listed"
          />
          <p className="text-xs text-gray-500">
            You can type spaces and commas freely; we parse on blur.
          </p>
        </div>
      )}
    </div>
  )
}