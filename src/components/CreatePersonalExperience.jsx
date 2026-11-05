import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Frame, Image as ImageIcon, Sparkles } from 'lucide-react';
import { SpacingSection, SectionHeader } from './ui';

export default function CreatePersonalExperience() {
  const creationPaths = [
    {
      id: 'frame-a-photo',
      title: 'FRAME A PHOTO',
      badge: 'Custom Framing',
      icon: Frame,
      description: 'Upload your photo, select your frame moulding, matting and size. We print and assemble it ready to hang.',
      actionText: 'Start Framing',
      link: '/custom-framing',
      image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=900&q=80',
      tag: '01 • Craft'
    },
    {
      id: 'print-photos',
      title: 'PRINT PHOTOS',
      badge: 'Fine-Art Lab Prints',
      icon: ImageIcon,
      description: 'Professional 6-colour photographic printing on 260 GSM lustre and premium matte papers in standard sizes.',
      actionText: 'Order Prints',
      link: '/photo-prints',
      image: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=900&q=80',
      tag: '02 • Print'
    },
    {
      id: 'create-a-card',
      title: 'CREATE A CARD',
      badge: 'Personalised Stationery',
      icon: Sparkles,
      description: 'Bespoke greeting cards, wedding invitations, and celebration stationery on 350 GSM luxury textured board.',
      actionText: 'Design Card',
      link: '/create-card',
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80',
      tag: '03 • Gift'
    }
  ];

  return (
    <SpacingSection id="creation-suite" background="default" borderBottom={true}>
      <SectionHeader
        eyebrow="Studio Creation Suite"
        title="Create Something Personal"
        description="Your photo. Your size. Your style. We’ll take care of the rest."
        align="center"
      />

        {/* 3 Creation Panels */}
        <div className="creative-panels-grid">
          <style>{`
            .creative-panels-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 2rem;
            }

            @media (max-width: 1024px) {
              .creative-panels-grid {
                grid-template-columns: 1fr;
                gap: 1.75rem;
                max-width: 580px;
                margin: 0 auto;
              }
            }

            .creative-panel-card {
              background: #FFFFFF;
              border: 1px solid rgba(24, 24, 23, 0.08);
              border-radius: 8px;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              text-decoration: none;
              color: inherit;
              transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
            }

            .creative-panel-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 20px 40px -10px rgba(24, 24, 23, 0.12);
              border-color: rgba(24, 24, 23, 0.2);
            }

            .creative-panel-media {
              position: relative;
              width: 100%;
              aspect-ratio: 16 / 11;
              overflow: hidden;
              background-color: #EAE6DF;
            }

            .creative-panel-img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .creative-panel-card:hover .creative-panel-img {
              transform: scale(1.05);
            }

            .creative-panel-tag {
              position: absolute;
              top: 1rem;
              left: 1rem;
              background: rgba(24, 24, 23, 0.75);
              backdrop-filter: blur(8px);
              color: #FFFFFF;
              font-family: var(--font-sans);
              font-size: 0.68rem;
              font-weight: 600;
              letterSpacing: 0.08em;
              text-transform: uppercase;
              padding: 0.35rem 0.65rem;
              border-radius: 4px;
            }

            .creative-panel-body {
              padding: 1.85rem 1.75rem 1.75rem 1.75rem;
              display: flex;
              flex-direction: column;
              flex-grow: 1;
              justify-content: space-between;
            }

            .creative-panel-cta {
              display: inline-flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              background-color: #181817;
              color: #F7F5F0;
              padding: 0.85rem 1.25rem;
              border-radius: 4px;
              font-family: var(--font-sans);
              font-size: 0.85rem;
              font-weight: 500;
              letter-spacing: 0.03em;
              transition: background-color 0.2s ease, transform 0.2s ease;
              margin-top: 1.5rem;
            }

            .creative-panel-card:hover .creative-panel-cta {
              background-color: #2D2C29;
            }

            .creative-panel-card:hover .creative-panel-cta svg {
              transform: translateX(4px);
            }
          `}</style>

          {creationPaths.map((path) => (
            <Link 
              key={path.id} 
              to={path.link}
              className="creative-panel-card"
            >
              {/* Large Visual Panel Media */}
              <div className="creative-panel-media">
                <img 
                  src={path.image} 
                  alt={path.title} 
                  className="creative-panel-img"
                  loading="lazy"
                />
                <span className="creative-panel-tag">
                  {path.tag}
                </span>
              </div>

              {/* Panel Details & Action */}
              <div className="creative-panel-body">
                <div>
                  <span 
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-bronze)',
                      display: 'block',
                      marginBottom: '0.4rem'
                    }}
                  >
                    {path.badge}
                  </span>
                  <h3 
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.45rem',
                      fontWeight: 600,
                      color: '#181817',
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      marginBottom: '0.65rem'
                    }}
                  >
                    {path.title}
                  </h3>
                  <p 
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem',
                      color: '#65635E',
                      lineHeight: 1.55,
                      margin: 0
                    }}
                  >
                    {path.description}
                  </p>
                </div>

                {/* Primary Panel Action Button */}
                <div className="creative-panel-cta">
                  <span>{path.actionText}</span>
                  <ArrowRight size={16} strokeWidth={2} style={{ transition: 'transform 0.25s ease' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </SpacingSection>
  );
}
