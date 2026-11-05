import React, { useState } from 'react';
import { 
  Smartphone, Search, Printer, Hammer, CheckCircle2, 
  PackageCheck, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';

const PROCESS_STEPS = [
  {
    stepNumber: '01',
    title: 'UPLOAD',
    tag: 'From Your Phone',
    summary: 'Direct Full-Resolution Upload',
    description: 'You share your favourite memory directly from your phone, camera, or WhatsApp. We receive the original high-resolution file without compression or quality degradation.',
    processDetail: 'Lossless photo intake & metadata verification',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80',
    icon: Smartphone
  },
  {
    stepNumber: '02',
    title: 'PHOTO CHECK',
    tag: 'Manual Inspection',
    summary: 'Curator Sharpness & Crop Review',
    description: 'Our team manually inspects each photograph on calibrated displays for pixel sharpness, crop balance, and exposure. If your image needs slight brightness tuning or resolution advice, we speak with you directly.',
    processDetail: 'Calibrated color & sharpness inspection',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    icon: Search
  },
  {
    stepNumber: '03',
    title: 'PROFESSIONAL PRINT',
    tag: 'Epson Photo Tech',
    summary: 'Professional 6-Colour Epson Photo Printing',
    description: 'Printed in-house using dedicated 6-colour Epson photographic systems on heavyweight 260+ GSM lustre paper. Extra Light Cyan and Light Magenta inks ensure natural skin tones and smooth continuous tonal gradations without visible dot grain.',
    processDetail: 'Printing on 260+ GSM lustre photo media',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    icon: Printer
  },
  {
    stepNumber: '04',
    title: 'FRAME',
    tag: 'Workshop Joinery',
    summary: 'Mitre Cut, Corner Join & Mounting',
    description: 'Selected mouldings are precision mitre-cut at exact 45° angles and bonded with concealed pneumatic V-nails. We mount your print with acid-free backing and 2mm crystal-clear, shatterproof acrylic glass.',
    processDetail: 'Cutting, joining & dust-sealed mounting',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    icon: Hammer
  },
  {
    stepNumber: '05',
    title: 'QUALITY CHECK',
    tag: 'Daylight Bench',
    summary: '5000K Lighting & Tension Audit',
    description: 'Every completed frame is inspected on our studio review bench under 5000K daylight lamps to guarantee pristine corners, zero internal dust specks, and pre-fitted level hanging hardware.',
    processDetail: 'Rigorous surface, corner & seal audit',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    icon: CheckCircle2
  },
  {
    stepNumber: '06',
    title: 'PACK & DELIVER',
    tag: 'Secure Dispatch',
    summary: 'Multi-Layer Corner Protection',
    description: 'Custom-fitted heavy-duty corner guards, impact-absorbing air cushion wrap, and rigid outer crates ensure your piece arrives in immaculate condition—ready to hang right out of the box.',
    processDetail: 'Packaging with zero-breakage guarantee',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    icon: PackageCheck
  }
];

export default function ProcessCraftsmanshipSection() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section 
      id="process"
      style={{
        padding: 'clamp(5rem, 8vw, 7.5rem) 0',
        backgroundColor: '#F5F3EE',
        borderTop: '1px solid #E5E1D8',
        borderBottom: '1px solid #E5E1D8',
        position: 'relative'
      }}
    >
      <div className="container-custom">

        {/* Section Header (Prompt 22: FROM YOUR PHONE TO YOUR WALL.) */}
        <div style={{ maxWidth: '780px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto', textAlign: 'center' }}>
          <span 
            style={{ 
              fontSize: '0.74rem', 
              letterSpacing: '0.16em', 
              textTransform: 'uppercase', 
              color: 'var(--accent-bronze)', 
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '0.65rem'
            }}
          >
            The Studio Workshop Journey
          </span>

          <h2 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
              fontWeight: 500,
              color: '#181817',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1rem'
            }}
          >
            FROM YOUR PHONE<br />
            TO YOUR WALL.
          </h2>

          <p 
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1rem, 1.25vw, 1.12rem)',
              color: '#706E68',
              lineHeight: 1.6,
              maxWidth: '640px',
              margin: '0 auto'
            }}
          >
            Made by us in our own workshop—never dropshipped or outsourced. We treat every single family memory, wedding portrait, and celebration print with dedicated artisan care.
          </p>
        </div>

        {/* 6 Visual Documentary Steps Grid */}
        <div className="process-steps-grid">
          <style>{`
            .process-steps-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 1.75rem;
            }
            @media (min-width: 640px) {
              .process-steps-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.75rem;
              }
            }
            @media (min-width: 1024px) {
              .process-steps-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
              }
            }
          `}</style>

          {PROCESS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === idx;

            return (
              <div
                key={step.stepNumber}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: isHovered ? '1px solid #181817' : '1px solid #DDD9D0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isHovered 
                    ? '0 16px 36px rgba(24, 24, 23, 0.08)' 
                    : '0 4px 18px rgba(24, 24, 23, 0.03)',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
                }}
              >
                {/* Real Process Photography with Step Badge */}
                <div 
                  style={{
                    position: 'relative',
                    aspectRatio: '16 / 10',
                    backgroundColor: '#EDEAE4',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={step.image} 
                    alt={`${step.stepNumber} ${step.title} - ${step.summary}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />

                  {/* Dark Gradient Overlay for Legibility */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)',
                      pointerEvents: 'none'
                    }} 
                  />

                  {/* Step Number Counter Top Left */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(24, 24, 23, 0.88)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em'
                    }}
                  >
                    <span>{step.stepNumber}</span>
                    <span style={{ color: '#D8CEBE', opacity: 0.8 }}>•</span>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{step.title}</span>
                  </div>

                  {/* Tag Badge Top Right */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(6px)',
                      color: '#181817',
                      padding: '3px 8px',
                      borderRadius: '100px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    {step.tag}
                  </div>

                  {/* Process Stage Pill Bottom Left */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(24, 24, 23, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FAF8F5',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Icon size={12} color="#D8CEBE" />
                    <span>{step.processDetail}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  
                  {/* Summary Subtitle */}
                  <h3 
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      color: '#181817',
                      lineHeight: 1.3,
                      margin: '0 0 0.5rem 0'
                    }}
                  >
                    {step.summary}
                  </h3>

                  {/* Narrative Body */}
                  <p 
                    style={{
                      fontSize: '0.84rem',
                      color: '#706E68',
                      lineHeight: 1.55,
                      margin: '0',
                      flex: 1
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workshop Documentary Trust Bar */}
        <div 
          style={{
            marginTop: '3.5rem',
            padding: '1.25rem 2rem',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDD9D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#181817',
                color: '#D8CEBE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#181817' }}>
                Handcrafted Under One Roof
              </div>
              <div style={{ fontSize: '0.78rem', color: '#706E68' }}>
                Printing • Cutting • Joining • Mounting • Inspection • Packaging
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.8rem', color: '#181817' }}>
              <strong style={{ color: 'var(--accent-bronze)' }}>✓</strong> 260+ GSM Lustre Photo Paper
            </div>
            <div style={{ fontSize: '0.8rem', color: '#181817' }}>
              <strong style={{ color: 'var(--accent-bronze)' }}>✓</strong> 6-Colour Continuous Tone Inks
            </div>
            <div style={{ fontSize: '0.8rem', color: '#181817' }}>
              <strong style={{ color: 'var(--accent-bronze)' }}>✓</strong> Shatterproof Cast Acrylic Glass
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
