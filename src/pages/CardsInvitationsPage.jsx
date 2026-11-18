import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, FileUp, LayoutTemplate, PenLine } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BirthdayCardPreview from '../components/BirthdayCardPreview';
import { CARD_TEMPLATES } from '../data/birthdayCards';
import { PREMIUM_CARD_DESIGN } from '../data/cardDesigns';
import { getStationeryOccasion, stationeryEditorPath, stationeryOccasionPath, stationeryRequestPath, STATIONERY_OCCASIONS, STATIONERY_TEMPLATES } from '../data/cardStationery';
import NotFoundPage from './NotFoundPage';
import './CardsStationery.css';

function CardArt({ occasion, templateId = occasion.templateId, className = '' }) {
  return <BirthdayCardPreview decorative demo className={className} config={{ designVersion: PREMIUM_CARD_DESIGN, templateId, occasionId: occasion.id, headline: occasion.greeting, recipientName: occasion.sampleName, coverDetail: occasion.sampleDetail, includePhoto: CARD_TEMPLATES.find(item => item.id === templateId)?.photoFirst }} />;
}

export function StationeryRequestLinks({ occasionId }) {
  return <div className="cs-shortcuts">
    <Link to={stationeryRequestPath('print', occasionId)}><FileUp size={20} /><span><strong>Print your own design</strong><small>Send a finished PDF or image for printing.</small></span><ArrowUpRight size={15} /></Link>
    <Link to={stationeryRequestPath('design', occasionId)}><PenLine size={20} /><span><strong>Get a custom design</strong><small>Give the studio your brief and approve the proof.</small></span><ArrowUpRight size={15} /></Link>
  </div>;
}

function OccasionTile({ occasion }) {
  return <Link className="cs-occasion-tile" to={stationeryOccasionPath(occasion.id)}>
    <div className={`cs-tile-art cs-tone-${occasion.tone}`}><CardArt occasion={occasion} /></div>
    <div className="cs-tile-copy"><h3>{occasion.name}</h3><p>{occasion.description}</p><span>Explore options <ArrowUpRight size={15} /></span></div>
  </Link>;
}

function TemplateTile({ occasion, template, to }) {
  return <Link className="cs-occasion-tile" to={to}>
    <div className={`cs-tile-art cs-tone-${occasion.tone}`}><CardArt occasion={occasion} templateId={template.id} /></div>
    <div className="cs-tile-copy"><h3>{template.name}</h3><p>{template.category}</p><span>Personalise template <ArrowUpRight size={15} /></span></div>
  </Link>;
}

const printOccasions = ['wedding', 'baby', 'eid'];

export default function CardsInvitationsPage() {
  const [params] = useSearchParams();
  const legacyOccasion = params.get('occasion');
  const occasion = getStationeryOccasion(legacyOccasion === 'new-baby' ? 'baby' : legacyOccasion === 'parents' ? 'thank-you' : legacyOccasion);
  if (occasion) return <OccasionCollection occasion={occasion} />;

  return <div className="cs-page">
    <div className="cs-shell">
      <nav className="cs-breadcrumb" aria-label="Breadcrumb"><Link to="/">The studio</Link><span aria-hidden="true">/</span><span aria-current="page">Cards & invitations</span></nav>
      <header className="cs-hero">
        <div className="cs-hero-copy">
          <span className="cs-kicker">BISEN STATIONERY</span>
          <h1>Cards &amp; <em>invitations.</em></h1>
          <p>Personalise a greeting card, print artwork you already have, or work with our Lucknow studio on a design made for your occasion.</p>
          <a className="cs-button" href="#categories-grid">Shop by occasion <ArrowDown size={17} /></a>
        </div>
        <div className="cs-hero-art" aria-hidden="true">
          <div className="cs-envelope" />
          {printOccasions.map(id => <CardArt key={id} occasion={getStationeryOccasion(id)} className={`cs-hero-card cs-hero-${id}`} />)}
        </div>
      </header>
      <StationeryRequestLinks />
      <section className="cs-section" id="categories-grid">
        <div className="cs-section-heading"><h2>Shop by occasion</h2><p>Find a starting point for your card or invitation.</p></div>
        <div className="cs-grid">{STATIONERY_OCCASIONS.map(item => <OccasionTile key={item.id} occasion={item} />)}</div>
      </section>
      <section className="cs-section cs-featured">
        <div className="cs-section-heading"><div><h2>Make a template yours</h2><p>Edit the wording, add a photo on supported designs, and preview both sides.</p></div><Link className="cs-text-link" to="/birthday-cards">Open card editor <ArrowRight size={16} /></Link></div>
        <div className="cs-grid">{STATIONERY_TEMPLATES.map(item => <TemplateTile key={item.id} occasion={getStationeryOccasion(item.occasionId)} template={CARD_TEMPLATES.find(template => template.id === item.templateId)} to={`/cards/${item.id}`} />)}</div>
      </section>
    </div>
  </div>;
}

function OccasionCollection({ occasion }) {
  const templates = [CARD_TEMPLATES.find(item => item.id === occasion.templateId), ...CARD_TEMPLATES.filter(item => item.id !== occasion.templateId)];
  const wedding = occasion.id === 'wedding';
  return <div className="cs-page"><div className="cs-shell">
    <nav className="cs-breadcrumb" aria-label="Breadcrumb"><Link to="/cards"><ArrowLeft size={15} /> Cards & invitations</Link><span aria-hidden="true">/</span><span aria-current="page">{occasion.name}</span></nav>
    <header className="cs-hero cs-occasion-hero">
      <div className="cs-hero-copy"><h1>{occasion.name}</h1><p>{occasion.description} {wedding ? 'Personalise a folded invitation or ask the studio to design a full suite.' : 'Start with a template and make it personal.'}</p><Link className="cs-button" to={stationeryEditorPath(occasion.id, occasion.templateId)}><LayoutTemplate size={17} />{wedding ? 'Personalise an invitation' : 'Personalise a card'} <ArrowRight size={17} /></Link></div>
      <div className="cs-occasion-art"><CardArt occasion={occasion} /><CardArt occasion={occasion} templateId={templates[1].id} /></div>
    </header>
    <StationeryRequestLinks occasionId={occasion.id} />
    <section className="cs-section">
      <div className="cs-section-heading"><div><h2>{wedding ? 'Personalise a folded card' : 'Choose a template'}</h2><p>Preview your wording, choose a folded size and select the number of cards.</p></div></div>
      <div className="cs-grid">{templates.map(template => <TemplateTile key={template.id} occasion={occasion} template={template} to={stationeryEditorPath(occasion.id, template.id)} />)}</div>
    </section>
    <nav className="cs-other-occasions" aria-label="More card occasions">{STATIONERY_OCCASIONS.filter(item => item.id !== occasion.id).map(item => <Link key={item.id} to={stationeryOccasionPath(item.id)}>{item.label} <ArrowRight size={14} /></Link>)}</nav>
  </div></div>;
}

export function CardOccasionPage() {
  const { occasionId } = useParams();
  const occasion = getStationeryOccasion(occasionId);
  return occasion ? <OccasionCollection occasion={occasion} /> : <NotFoundPage />;
}
