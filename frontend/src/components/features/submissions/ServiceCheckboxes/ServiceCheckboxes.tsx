import { SERVICE_KEYS, SERVICE_LABELS, SERVICE_PRICING, type ServiceKey } from '../../../../constants/services'

interface Props {
  selectedServices: string[]
  onChange: (services: string[]) => void
}

export default function ServiceCheckboxes({ selectedServices, onChange }: Props) {
  function toggle(service: ServiceKey) {
    if (selectedServices.includes(service)) {
      onChange(selectedServices.filter((s) => s !== service))
    } else {
      onChange([...selectedServices, service])
    }
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-foreground mb-1">Services optionnels</legend>
      {SERVICE_KEYS.map((service) => (
        <label
          key={service}
          className="flex items-center justify-between gap-3 border border-black/10 rounded px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-foreground">
            <input
              type="checkbox"
              checked={selectedServices.includes(service)}
              onChange={() => toggle(service)}
            />
            {SERVICE_LABELS[service]}
          </span>
          <span className="text-muted">+{SERVICE_PRICING[service]} €/mois</span>
        </label>
      ))}
    </fieldset>
  )
}
