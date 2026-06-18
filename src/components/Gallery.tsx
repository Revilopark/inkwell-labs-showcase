import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, type Project } from '@/data/projects';

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <div className="reflection-container" style={{ flexShrink: 0 }}>
      {/* Main card */}
      <div
        className="project-card"
        data-speed={index % 2 === 0 ? '0.9' : '1.1'}
        tabIndex={0}
        style={{
          transform: `perspective(1000px) rotateY(${index % 2 === 0 ? 8 : -8}deg) rotateX(2deg)`,
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(201, 169, 110, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.transform = `perspective(1000px) rotateY(${index % 2 === 0 ? 8 : -8}deg) rotateX(2deg)`;
          e.currentTarget.style.boxShadow = 'none';
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(201, 169, 110, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = `perspective(1000px) rotateY(${index % 2 === 0 ? 8 : -8}deg) rotateX(2deg)`;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Thumbnail */}
        <div style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
          <img
            src={project.image}
            alt={project.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>

        {/* Metadata */}
        <div style={{ padding: '28px' }}>
          {/* Category */}
          <div
            className="font-mono-label"
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#C9A96E',
              marginBottom: '10px',
            }}
          >
            • {project.category}
          </div>

          {/* Project name */}
          <h3
            className="font-display"
            style={{
              fontSize: '22px',
              color: '#E8E4DC',
              marginBottom: '10px',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {project.name}
          </h3>

          {/* Description */}
          <p
            className="font-body"
            style={{
              fontSize: '13px',
              color: '#8B9DAF',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </p>
        </div>

        {/* Action row */}
        <div
          style={{
            padding: '0 28px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-label"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: '#C9A96E',
              textDecoration: 'none',
              letterSpacing: '0.06em',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#D4B87A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#C9A96E';
            }}
          >
            View Project →
          </a>
          <span
            className="font-mono-label"
            style={{
              fontSize: '10px',
              color: '#6B6560',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {project.tech}
          </span>
        </div>
      </div>

      {/* Reflection */}
      <div className="card-reflection">
        <div
          style={{
            width: '420px',
            height: '560px',
            background: 'rgba(20, 20, 22, 0.85)',
            border: '1px solid rgba(201, 169, 110, 0.08)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
            <img
              src={project.image}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              aria-hidden="true"
            />
          </div>
          <div style={{ padding: '28px' }}>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#C9A96E',
                marginBottom: '10px',
              }}
            >
              • {project.category}
            </div>
            <h3
              style={{
                fontSize: '22px',
                color: '#E8E4DC',
                marginBottom: '10px',
                lineHeight: 1.2,
              }}
            >
              {project.name}
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#8B9DAF',
                lineHeight: 1.6,
              }}
            >
              {project.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterPanel() {
  return (
    <div
      style={{
        width: '400px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 60px',
        flexShrink: 0,
      }}
    >
      <h2
        className="font-display"
        style={{
          fontSize: '32px',
          color: '#E8E4DC',
          marginBottom: '12px',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        That's all for now.
      </h2>
      <p
        className="font-body"
        style={{
          fontSize: '14px',
          color: '#6B6560',
          marginBottom: '24px',
        }}
      >
        More projects loading...
      </p>
      <a
        href="https://github.com/Revilopark"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono-label"
        style={{
          fontSize: '12px',
          color: '#8B9DAF',
          textDecoration: 'none',
          letterSpacing: '0.06em',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#C9A96E';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#8B9DAF';
        }}
      >
        github.com/Revilopark
      </a>
    </div>
  );
}

export default function Gallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const totalWidth = track.scrollWidth - window.innerWidth;

      const scrollTween = gsap.to(track, {
        x: () => -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => '+=' + totalWidth,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const idx = Math.min(
              Math.floor(progress * projects.length),
              projects.length - 1
            );
            setCurrentIndex(idx);
          },
        },
      });

      // Card entrance animations
      const cards = track.querySelectorAll('.project-card');
      cards.forEach((card, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.from(card, {
          rotateY: 12 * direction,
          rotateX: 3,
          opacity: 0.6,
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: 'left 90%',
            end: 'left 20%',
            scrub: 1,
          },
        });
      });

      ScrollTrigger.refresh();

      return () => {
        scrollTween.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const formatNumber = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: '#050505',
      }}
    >
      {/* Fixed header labels */}
      <div
        className="font-mono-label"
        style={{
          position: 'fixed',
          top: '40px',
          left: '60px',
          zIndex: 10,
          fontSize: '11px',
          textTransform: 'uppercase',
          color: '#6B6560',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
        }}
      >
        Revilopark / Projects
      </div>

      <div
        className="font-mono-label"
        style={{
          position: 'fixed',
          top: '40px',
          right: '60px',
          zIndex: 10,
          fontSize: '11px',
          color: '#8B9DAF',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
        }}
      >
        {formatNumber(currentIndex + 1)} / {formatNumber(projects.length)}
      </div>

      {/* Horizontal track */}
      <div ref={trackRef} className="gallery-track">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
        <FooterPanel />
      </div>
    </div>
  );
}
