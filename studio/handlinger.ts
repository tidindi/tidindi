import { useDocumentOperation, type DocumentActionComponent } from 'sanity';

// Publiser-knappen for artikler: setter publiseringstidspunktet automatisk første gang
// saken publiseres. Senere publiseringer endrer ikke tidspunktet.
export function medPubliseringstid(original: DocumentActionComponent): DocumentActionComponent {
  const Handling: DocumentActionComponent = (props) => {
    const { patch } = useDocumentOperation(props.id, props.type);
    const beskrivelse = original(props);
    if (!beskrivelse) return null;
    return {
      ...beskrivelse,
      onHandle: () => {
        const dokument = (props.draft ?? props.published) as { publisert?: string } | null;
        if (dokument && !dokument.publisert && props.draft) {
          patch.execute([{ setIfMissing: { publisert: new Date().toISOString() } }]);
        }
        beskrivelse.onHandle?.();
      },
    };
  };
  Handling.action = original.action;
  return Handling;
}
