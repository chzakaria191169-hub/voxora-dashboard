import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function BackgroundParticles() {
  const particlesInit = useCallback(async engine => {
    // This loads the full bundle of tsparticles
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
      options={{
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          number: {
            value: 60,
            density: {
              enable: true,
              area: 800
            }
          },
          color: {
            value: ["#8b5cf6", "#6366f1", "#4f46e5"]
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.3,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: { min: 1, max: 3 },
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.5,
              sync: false
            }
          },
          links: {
            enable: true,
            distance: 150,
            color: "#6366f1",
            opacity: 0.15,
            width: 1,
            triangles: {
              enable: true,
              color: "#4f46e5",
              opacity: 0.05
            }
          },
          move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "bounce"
            },
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "grab"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.3
              }
            }
          }
        },
        retina_detect: true
      }}
    />
  );
}
