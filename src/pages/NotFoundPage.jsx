import React from 'react';
import { Link } from 'react-router-dom';
import { Frame, Printer, Gift, Sparkles, Home, ArrowRight, MessageCircle } from 'lucide-react';
import { SpacingSection, PrimaryButton, SecondaryButton } from '../components/ui';
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../data/businessConfig';

/**
 * 404 Not Found Page (Prompt 40 Audit)
 * Elegant fallback state with studio navigation pathways.
 */
export default function NotFoundPage() {
  const quickLinks = [
    {
      title: 'Custom Framing Studio',
      description: 'Upload your photo, select moulding and matting for ready-to-hang frames.',
      icon: Frame,
      to: '/custom-framing'
    },
    {
      title: 'Photo Prints Lab',
      description: 'Epson 6-colour continuous tone printing on 260 GSM lustre paper.',
      icon: Printer,
      to: '/photo-prints'
    },
    {
      title: 'Cards & Stationery',
      description: 'Bespoke celebration cards and invitations on 350 GSM luxury board.',
      icon: Gift,
      to: '/cards'
    },
    {
      title: 'Artisanal Itra',
      description: '100% concentrated non-alcoholic perfume oils and discovery flacons.',
      icon: Sparkles,
      to: '/itra-perfumes'
    }
  ];

  return (
    <SpacingSection background="default" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
        
        {/* Eyebrow Status */}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent-bronze)',
            display: 'inline-block',
            marginBottom: '0.75rem'
          }}
        >
          404 • Page Not Found
        </span>

        {/* Editorial Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
            fontWeight: 500,
            color: '#181817',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '1rem'
          }}
        >
          A Missing Craft Corner
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.02rem',
            color: '#65635E',
            lineHeight: 1.6,
            maxWidth: '540px',
            margin: '0 auto 2.5rem auto'
          }}
        >
          The page or product you were searching for might have been repositioned or retired. Explore our core studio craft collections below:
        </p>

        {/* 4 Studio Quick Jump Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            textAlign: 'left',
            marginBottom: '3rem'
          }}
        >
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  border: '1px solid #E6E2D8',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#181817';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E6E2D8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#F5F3EE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-bronze)'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={15} color="#8A8780" />
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 650, color: '#181817', marginBottom: '0.35rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#65635E', lineHeight: 1.5 }}>
                  {item.description}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <PrimaryButton to="/" icon={Home} iconPosition="left" size="md">
            Return to Homepage
          </PrimaryButton>
          <SecondaryButton
            href={getWhatsAppUrl('Hi AL-NOOR! I was looking for a page on your website and could not find it. Could you please help?')}
            icon={MessageCircle}
            iconPosition="left"
            size="md"
          >
            Ask Studio via WhatsApp
          </SecondaryButton>
        </div>

      </div>
    </SpacingSection>
  );
}
