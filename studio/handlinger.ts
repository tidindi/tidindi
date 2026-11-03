import { useDocumentOperation, type DocumentActionComponent } from 'sanity';

// Publiser-knappen for artikler: setter publiseringstidspunktet automatisk første gang
// saken publiseres. Senere publiseringer endrer aldri tidspunktet – heller ikke når
// feltet mangler i den publiserte versjonen (da vises tidspunktet saken ble opprettet).
// Rettet 3.11.2026: før ble tidspunktet satt ved en senere publisering hvis feltet manglet,
// så en liten retting kunne bli stående som publiseringstidspunkt.
export function medPubliseringstid(original: DocumentActionComponent): DocumentActionComponent {
  const Handling: DocumentActionComponent = (props) => {
    const { patch } = useDocumentOperation(props.id, props.type);
    const beskrivelse = original(props);
    if (!beskrivelse) return null;
    return {
      ...beskrivelse,
      onHandle: () => {
        // Bare når saken aldri har vært publisert (ingen publisert versjon finnes).
        const forstegang = !props.published;
        const utkast = props.draft as { publisert?: string } | null;
        if (forstegang && utkast && !utkast.publisert) {
          patch.execute([{ setIfMissing: { publisert: new Date().toISOString() } }]);
        }
        beskrivelse.onHandle?.();
      },
    };
  };
  Handling.action = original.action;
  return Handling;
}
