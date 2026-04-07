import { RENTAL_SERVICES } from '../../constants/labels';

export default function ServicesList() {
  return (
    <ul className="space-y-1 text-sm">
      {RENTAL_SERVICES.map((service) => (
        <li key={service} className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          {service}
        </li>
      ))}
    </ul>
  );
}
