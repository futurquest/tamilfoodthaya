import ScrollReveal from './ScrollReveal';
import FluidBackground from './FluidBackground';

export default function OurStorySection() {
  return (
    <section className="section about-section">
      <span className="fx-aura" data-para="24" data-cur="12" aria-hidden="true" />
      <FluidBackground intensity={0.5} parallaxStrength={7} deepParallax={12} />
      <div className="container about-grid">
        <ScrollReveal variant="fadeUp" className="about-copy">
          <p className="eyebrow">About Tamil Food Thaya</p>
          <h2 className="section-title">Our Story</h2>
          <h3 className="about-subhead">Bringing the Taste of Home to the Netherlands</h3>
          <div className="about-body">
            <p>
              For more than <strong>25 years</strong>, founder <strong>Thayapalan</strong> has
              shared the authentic flavours of Tamil home cooking with communities across Rotterdam
              and the Netherlands.
            </p>
            <p>
              Tamil Food Thaya began with a simple idea: <strong>food should taste like home</strong>.
              Inspired by traditional Tamil cooking and the comforting meals made by mothers for
              generations, Thayapalan set out to preserve those flavours and share them with others.
            </p>
            <p>
              From intimate family gatherings to weddings and large celebrations, every meal is
              prepared with the same values we started with —{' '}
              <strong>tradition, freshness, generosity and care</strong>.
            </p>
          </div>
          <p className="about-tagline">
            <strong>
              Tamil Food Thaya — traditional Tamil food, made with the warmth of home.
            </strong>
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" className="about-image" delay={120}>
          <figure>
            <img
              src="/thayapaalan.png"
              alt="Thayapalan, founder of Tamil Food Thaya"
              loading="lazy"
            />
            <figcaption className="about-image__caption">Thayapalan — Founder</figcaption>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}