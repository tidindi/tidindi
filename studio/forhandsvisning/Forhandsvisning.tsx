// Fanen «Forhåndsvisning» i Studio: viser artikkelen slik den blir seende ut på nettstedet,
// mens den fortsatt er et utkast. Alt skjer i Studio – ingenting blir offentlig før du publiserer.
// Typografi, farger og avstander er de samme som i artikkelmalen (src/pages/[seksjon]/[slug].astro).

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
import { brodtekst, bildedata, videodata } from '../../src/data/portabletekst';
import { seksjonsnavn } from '../../src/data/seksjoner';
import { datoOgTid, klokkeslett } from '../../src/data/format';
import type { Bildedata, Videodata } from '../../src/data/testinnhold';
import { stiler } from './stiler';
import { sluttmerkeHtml } from '../../src/data/monogram';

type Visning = 'pc' | 'mobil';

function Bilde({ bilde, forhold, bygger }: { bilde?: Bildedata; forhold: number; bygger: ReturnType<typeof createImageUrlBuilder> }) {
  if (!bilde?.sanity) return <div className="tf-bilde-tom" style={{ aspectRatio: `${1 / forhold}` }}>Bilde</div>;
  const src = bygger.image(bilde.sanity as any).width(1400).height(Math.round(1400 * forhold)).fit('crop').saturation(-100).auto('format').url();
  return <img className="tf-bilde" src={src} alt={bilde.alt} style={{ aspectRatio: `${1 / forhold}` }} />;
}

function Video({ video }: { video: Videodata }) {
  return (
    <figure className="tf-innebilde">
      <div className="tf-video" data-staende={video.staende ? '1' : undefined}>
        <video src={video.url} controls playsInline preload="metadata" />
      </div>
      <figcaption>
        {video.vignett ? 'Med vignett og sluttmerke. ' : ''}{video.tittel ? `Tittel i videoen: «${video.tittel}». ` : ''}{video.byline ? `Byline: ${video.byline}. ` : ''}{video.tekstingUrl ? 'Med teksting. ' : ''}{video.tekst} {video.kreditering && <span className="tf-meta">Video: {video.kreditering}</span>}
      </figcaption>
    </figure>
  );
}

function Merke({ seksjon }: { seksjon?: string }) {
  return (
    <span className="tf-etikett tf-merke">
      <span className="tf-rombe" aria-hidden="true" />
      {seksjon ? seksjonsnavn(seksjon) : 'Velg seksjon'}
    </span>
  );
}

export function Forhandsvisning(props: { document: { displayed: any } }) {
  const a = props.document.displayed ?? {};
  const klient = useClient({ apiVersion: '2025-02-19' });
  const bygger = useMemo(() => createImageUrlBuilder(klient), [klient]);
  const [visning, setVisning] = useState<Visning>('pc');
  const [skribent, setSkribent] = useState<string | undefined>();

  const skribentRef: string | undefined = a.skribent?._ref;
  useEffect(() => {
    if (!skribentRef) { setSkribent(undefined); return; }
    let aktiv = true;
    klient
      .fetch<string | null>('coalesce(*[_id == "drafts." + $id][0].navn, *[_id == $id][0].navn)', { id: skribentRef })
      .then((navn) => aktiv && setSkribent(navn ?? undefined))
      .catch(() => {});
    return () => { aktiv = false; };
  }, [klient, skribentRef]);

  const hovedbilde = bildedata(a.hovedbilde);
  const hovedvideo = videodata(a.hovedvideo);
  const blokker = brodtekst(a.brodtekst);
  const mangler = [
    !a.seksjon && 'seksjon', !a.tittel && 'tittel', !a.slug?.current && 'adresse', !a.ingress && 'ingress',
    hovedbilde && !hovedbilde.alt && 'alternativ tekst til bildet',
  ].filter(Boolean) as string[];

  return (
    <div className="tf">
      <style>{stiler}</style>

      <div className="tf-verktoy">
        <span className="tf-etikett">Forhåndsvisning · utkast</span>
        <div className="tf-valg" role="group" aria-label="Skjermbredde">
          <button type="button" aria-pressed={visning === 'pc'} onClick={() => setVisning('pc')}>PC</button>
          <button type="button" aria-pressed={visning === 'mobil'} onClick={() => setVisning('mobil')}>Mobil</button>
        </div>
      </div>

      {mangler.length > 0 && (
        <p className="tf-mangler">Mangler før publisering: {mangler.join(', ')}.</p>
      )}

      <div className={`tf-side ${visning === 'mobil' ? 'tf-mobil' : ''}`}>
        <article className="tf-artikkel">
          <header className="tf-hode">
            <div className="tf-merkerad">
              <Merke seksjon={a.seksjon} />
              {a.sted && <span className="tf-meta">{a.sted}</span>}
            </div>
            <h1 className="tf-tittel">{a.tittel || 'Tittel'}</h1>
            <p className="tf-ingress">{a.ingress || 'Ingress'}</p>
            <div className="tf-byline">
              <span>{skribent ?? 'Tidindi'}</span>
              <span className="tf-meta">
                {a.publisert ? `Publisert ${datoOgTid(a.publisert)}` : 'Ikke publisert ennå'}
                {a.oppdatert && ` · Oppdatert ${klokkeslett(a.oppdatert)}`}
              </span>
            </div>
          </header>

          {hovedvideo && <Video video={hovedvideo} />}
          {!hovedvideo && <figure className="tf-hovedbilde">
            <Bilde bilde={hovedbilde} forhold={8 / 16} bygger={bygger} />
            {(hovedbilde?.tekst || hovedbilde?.kreditering) && (
              <figcaption>
                {hovedbilde?.tekst} {hovedbilde?.kreditering && <span className="tf-meta">Foto: {hovedbilde.kreditering}</span>}
              </figcaption>
            )}
          </figure>}

          <div className="tf-tekst">
            {blokker.map((b, i) => {
              if (b.type === 'avsnitt') {
                const html = b.html ?? (b.tekst ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
                return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
              }
              if (b.type === 'mellomtittel') return <h2 key={i} className="tf-mellomtittel">{b.tekst}</h2>;
              if (b.type === 'liste') return <ul key={i} className="tf-liste">{b.punkter.map((p, j) => <li key={j} dangerouslySetInnerHTML={{ __html: p }} />)}</ul>;
              if (b.type === 'sitat') return (
                <blockquote key={i} className="tf-sitat">
                  <p>«{b.tekst}»</p>
                  {b.kilde && <cite className="tf-etikett">{b.kilde}</cite>}
                </blockquote>
              );
              if (b.type === 'fakta') return (
                <aside key={i} className="tf-fakta">
                  <div className="tf-etikett">{b.tittel ?? 'Fakta'}</div>
                  <ul>{b.punkter.map((p, j) => <li key={j}>{p}</li>)}</ul>
                  {b.merknad && <p className="tf-fakta-merknad">{b.merknad}</p>}
                </aside>
              );
              if (b.type === 'bilde') return (
                <figure key={i} className="tf-innebilde">
                  <Bilde bilde={b.bilde} forhold={2 / 3} bygger={bygger} />
                  {(b.bilde.tekst || b.bilde.kreditering) && (
                    <figcaption>{b.bilde.tekst} {b.bilde.kreditering && <span className="tf-meta">Foto: {b.bilde.kreditering}</span>}</figcaption>
                  )}
                </figure>
              );
              if (b.type === 'video') return <Video key={i} video={b.video} />;
              return null;
            })}
            {blokker.length > 0 && <p className="tf-sluttmerke-alene" dangerouslySetInnerHTML={{ __html: sluttmerkeHtml }} />}
            {(a.kilde || a.pressemelding) && (
              <p className="tf-meta tf-kilde" key="kilde">
                {a.kilde && <>Kilde: {a.kilde}</>}
                {a.kilde && a.pressemelding && ' · '}
                {a.pressemelding && <>Saken bygger på en pressemelding fra {a.pressemelding}</>}
              </p>
            )}
          </div>
        </article>

        <section className="tf-forside">
          <div className="tf-etikett tf-blokketikett">Slik ser den ut på forsiden</div>
          <div className="tf-kort-rad">
            <div className="tf-kort tf-kort-stor">
              <span className="tf-meta">Som hovedsak</span>
              <Bilde bilde={hovedbilde} forhold={9 / 16} bygger={bygger} />
              <Merke seksjon={a.seksjon} />
              <div className="tf-h-hoved">{a.tittel || 'Tittel'}</div>
              <p className="tf-ingress">{a.ingress || 'Ingress'}</p>
            </div>
            <div className="tf-kort">
              <span className="tf-meta">Som sak eller bildesak</span>
              <Bilde bilde={hovedbilde} forhold={2 / 3} bygger={bygger} />
              <Merke seksjon={a.seksjon} />
              <div className="tf-h-stor">{a.tittel || 'Tittel'}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
