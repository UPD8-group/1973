import gable from "../assets/darkroom/frame-gable.jpg";
import doorway from "../assets/darkroom/frame-doorway.jpg";
import forrent from "../assets/darkroom/frame-forrent.jpg";

// Street series, Spain. Frames sit dormant in grayscale and develop
// (grayscale → colour) under the visitor's pointer — see .neg in styles.css.
const FRAMES = [
  {
    src: gable,
    cap: "españa 01 · the gable",
    alt: "A painted apartment gable in Spain — a full-wall mural of card players in renaissance dress under a blue sky",
  },
  {
    src: doorway,
    cap: "españa 02 · take this!!",
    alt: "A brick apartment block in Spain with a red graffiti piece beside the entrance ramp",
  },
  {
    src: forrent,
    cap: "españa 03 · for rent",
    alt: "Detail of a Spanish street mural — a vintage car parked before a 'for rent' storefront",
  },
];

export default function Darkroom() {
  return (
    <section className="block wrap" id="photo">
      <div className="block-head">
        <span className="eyebrow">03 · Photography</span>
        <h2>The darkroom</h2>
        <p>
          Photography is the studio&rsquo;s oldest habit — older than the web. The current
          series is street work from Spain: painted gables, tagged doorways, walls with
          something to say. Prints develop when you hold the light on them.
        </p>
      </div>
      <div className="darkroom">
        {FRAMES.map((f) => (
          <figure className="neg" key={f.cap} tabIndex={0}>
            <img src={f.src} alt={f.alt} loading="lazy" />
            <figcaption>{f.cap}</figcaption>
          </figure>
        ))}
      </div>
      <p className="darkroom-hint">Hover a frame to develop it</p>
    </section>
  );
}
