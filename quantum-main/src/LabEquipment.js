// src/LabEquipment.js
import React, { useEffect, useRef } from "react";
import "./LabEquipment.css";
import img1 from './images/Screenshot 2025-12-14 095348.png'
const LabEquipment = () => {
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const scrollHandlerRef = useRef(null);
  const parallaxHandlerRef = useRef(null);
  const progressHandlerRef = useRef(null);
  const keydownHandlerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize all interactive features
    initScrollAnimations();
    initInteractiveHovers();
    initParallaxEffect();
    initNumberAnimations();
    initReadingProgress();
    initKeyboardNavigation();
    initMobileExpand();

    // Cleanup function
    return () => {
      // Remove event listeners
      if (scrollHandlerRef.current) {
        window.removeEventListener('scroll', scrollHandlerRef.current);
      }
      if (parallaxHandlerRef.current) {
        window.removeEventListener('scroll', parallaxHandlerRef.current);
      }
      if (progressHandlerRef.current) {
        window.removeEventListener('scroll', progressHandlerRef.current);
      }
      if (keydownHandlerRef.current) {
        document.removeEventListener('keydown', keydownHandlerRef.current);
      }
      // Remove progress bar
      if (progressBarRef.current && progressBarRef.current.parentNode) {
        progressBarRef.current.parentNode.removeChild(progressBarRef.current);
      }
    };
  }, []);

  // Scroll animations for equipment items
  const initScrollAnimations = () => {
    const equipmentItems = containerRef.current.querySelectorAll('.equipment-item');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    equipmentItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(item);
    });
  };

  // Interactive hover effects
  const initInteractiveHovers = () => {
    const equipmentItems = containerRef.current.querySelectorAll('.equipment-item');
    
    equipmentItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      });
      
      item.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 50;
        const rotateY = (centerX - x) / 50;
        
        // Subtle 3D tilt effect on desktop only
        if (window.innerWidth > 768) {
          this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(2rem)`;
        }
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  };

  // Parallax effect for hero image
  const initParallaxEffect = () => {
    const heroImage = containerRef.current.querySelector('.hero-image');
    if (!heroImage) return;
    
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.3;
      
      if (scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${rate}px)`;
      }
    };
    
    parallaxHandlerRef.current = handleParallax;
    window.addEventListener('scroll', handleParallax);
  };

  // Animated number counters
  const initNumberAnimations = () => {
    const numbers = containerRef.current.querySelectorAll('.number');
    
    const observerOptions = {
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
          animateNumber(entry.target);
        }
      });
    }, observerOptions);
    
    numbers.forEach(number => {
      observer.observe(number);
    });
  };

  const animateNumber = (element) => {
    const targetNumber = parseInt(element.textContent);
    const duration = 800;
    const steps = 20;
    const increment = targetNumber / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNumber) {
        element.textContent = targetNumber.toString().padStart(2, '0');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toString().padStart(2, '0');
      }
    }, duration / steps);
  };

  // Reading progress indicator
  const initReadingProgress = () => {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-lab';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 2px;
      background: linear-gradient(to right, #fff, #666);
      z-index: 9999;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    progressBarRef.current = progressBar;
    
    const handleProgressScroll = () => {
      // Only update if we're on the lab equipment page
      if (!containerRef.current) return;
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.pageYOffset;
      const progress = (scrolled / documentHeight) * 100;
      
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
    };
    
    progressHandlerRef.current = handleProgressScroll;
    window.addEventListener('scroll', handleProgressScroll);
  };

  // Keyboard navigation
  const handleKeydown = (e) => {
    // Only handle if we're focused on lab equipment page
    if (!containerRef.current) return;
    
    const equipmentItems = Array.from(containerRef.current.querySelectorAll('.equipment-item'));
    const currentFocused = document.activeElement;
    const currentIndex = equipmentItems.findIndex(item => item.contains(currentFocused));
    
    if (e.key === 'ArrowDown' && currentIndex < equipmentItems.length - 1) {
      e.preventDefault();
      equipmentItems[currentIndex + 1].focus();
      equipmentItems[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault();
      equipmentItems[currentIndex - 1].focus();
      equipmentItems[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const initKeyboardNavigation = () => {
    // Make equipment items focusable
    const equipmentItems = containerRef.current.querySelectorAll('.equipment-item');
    equipmentItems.forEach(item => {
      item.setAttribute('tabindex', '0');
    });
    
    keydownHandlerRef.current = handleKeydown;
    document.addEventListener('keydown', handleKeydown);
  };

  // Mobile expand functionality
  const initMobileExpand = () => {
    if (window.innerWidth <= 768) {
      const equipmentItems = containerRef.current.querySelectorAll('.equipment-item');
      
      equipmentItems.forEach(item => {
        const contentGrid = item.querySelector('.content-grid');
        if (contentGrid) {
          contentGrid.style.maxHeight = '0';
          contentGrid.style.overflow = 'hidden';
          contentGrid.style.transition = 'max-height 0.4s ease';
          
          item.addEventListener('click', function() {
            const isExpanded = this.classList.contains('expanded');
            
            // Close all other items
            equipmentItems.forEach(otherItem => {
              if (otherItem !== this) {
                otherItem.classList.remove('expanded');
                const otherGrid = otherItem.querySelector('.content-grid');
                if (otherGrid) otherGrid.style.maxHeight = '0';
              }
            });
            
            // Toggle current item
            if (isExpanded) {
              this.classList.remove('expanded');
              contentGrid.style.maxHeight = '0';
            } else {
              this.classList.add('expanded');
              contentGrid.style.maxHeight = contentGrid.scrollHeight + 'px';
            }
          });
        }
      });
    }
  };

  return (
    <div ref={containerRef} className="lab-equipment-page container">
      <header>
        <h1>Lab Equipment</h1>
        <p className="subtitle">BB84 Quantum Key Distribution</p>
        <p className="intro">
          This virtual laboratory simulates the core components of a real-world BB84 QKD setup. 
          While the experiment runs in software, each element corresponds to an actual physical device 
          used in quantum communication systems.
        </p>
      </header>

      <div className="hero-image">
        <img 
          src= {img1} 
          alt="Quantum Computing Laboratory Equipment" 
          loading="lazy"
        />
      </div>

      <div className="equipment-list">
        {/* Equipment 1 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">01</span>
            <h2>Single-Photon Source</h2>
          </div>
          <p className="role">Generates individual photons used to encode quantum bits (qubits)</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Alice prepares photons one at a time</li>
                  <li>Each photon encodes a random bit (0 or 1)</li>
                  <li>Each photon encodes a random basis (+ or ×)</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Attenuated laser source</li>
                  <li>Single-photon emitter (quantum dot / SPDC source)</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> Security requires that photons cannot be copied or split without detection.
            </div>
          </div>
        </div>

        {/* Equipment 2 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">02</span>
            <h2>Polarization Encoder</h2>
          </div>
          <p className="role">Encodes information onto photons using polarization</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Horizontal / Vertical → rectilinear (+) basis</li>
                  <li>Diagonal / Anti-diagonal → diagonal (×) basis</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Polarizing filters</li>
                  <li>Wave plates (Half-wave plate)</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> Encoding in non-orthogonal bases ensures eavesdropping causes disturbance.
            </div>
          </div>
        </div>

        {/* Equipment 3 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">03</span>
            <h2>Quantum Channel</h2>
          </div>
          <p className="role">Carries photons from Alice to Bob</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Simulated free-space or optical fiber channel</li>
                  <li>Adjustable distance</li>
                  <li>Adjustable noise</li>
                  <li>Adjustable photon loss</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Optical fiber</li>
                  <li>Free-space optical link (satellite QKD)</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> Noise and loss affect QBER and determine secure distance limits.
            </div>
          </div>
        </div>

        {/* Equipment 4 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">04</span>
            <h2>Eavesdropper Module</h2>
          </div>
          <p className="role">Simulates an attacker performing an intercept–resend attack</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Eve randomly chooses a measurement basis</li>
                  <li>Measures intercepted photons</li>
                  <li>Resends new photons based on her measurement</li>
                  <li>Interception probability is user-controlled</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                No physical device — represents an adversarial strategy
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> Demonstrates measurement disturbance and how QKD detects eavesdropping statistically.
            </div>
          </div>
        </div>

        {/* Equipment 5 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">05</span>
            <h2>Polarization Analyzer</h2>
          </div>
          <p className="role">Measures incoming photons in a randomly chosen basis</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Bob randomly selects + or × basis</li>
                  <li>Measurement outcome depends on basis alignment</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Polarizing beam splitter (PBS)</li>
                  <li>Wave plates + detectors</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> Only measurements in the correct basis yield meaningful key bits.
            </div>
          </div>
        </div>

        {/* Equipment 6 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">06</span>
            <h2>Single-Photon Detectors</h2>
          </div>
          <p className="role">Detects the photon and records a bit value</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Produces measurement results (0 or 1)</li>
                  <li>Detects photon loss events</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Avalanche photodiodes (APD)</li>
                  <li>Superconducting nanowire detectors (SNSPD)</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> Detector efficiency and noise influence QBER.
            </div>
          </div>
        </div>

        {/* Equipment 7 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">07</span>
            <h2>Classical Public Channel</h2>
          </div>
          <p className="role">Allows Alice and Bob to communicate openly after transmission</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                Used for basis comparison (sifting) and QBER estimation. Bit values are never revealed.
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Internet / classical communication link</li>
                  <li>Must be authenticated but not secret</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> BB84 security assumes this channel is public but trustworthy.
            </div>
          </div>
        </div>

        {/* Equipment 8 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">08</span>
            <h2>Data Analysis & Visualization</h2>
          </div>
          <p className="role">Analyzes results and detects eavesdropping</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Transmission table</li>
                  <li>QBER calculation</li>
                  <li>Graphs: Correct vs Incorrect bits</li>
                  <li>Basis match vs mismatch</li>
                  <li>QBER vs sifted key length</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                Statistical analysis software and visualization tools
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> QKD security is statistical, not based on single events.
            </div>
          </div>
        </div>

        {/* Equipment 9 */}
        <div className="equipment-item">
          <div className="equipment-header">
            <span className="number">09</span>
            <h2>Error Correction & Privacy Amplification</h2>
          </div>
          <p className="role">Reconciles key differences and removes potential information leaked to eavesdroppers</p>
          
          <div className="content-grid">
            <div className="section">
              <div className="section-title">In the Lab</div>
              <div className="section-content">
                <ul>
                  <li>Error correction protocols (CASCADE, LDPC)</li>
                  <li>Privacy amplification using hash functions</li>
                  <li>Final secure key generation</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Real-World Equivalent</div>
              <div className="section-content">
                <ul>
                  <li>Classical post-processing computers</li>
                  <li>Cryptographic hash function implementations</li>
                </ul>
              </div>
            </div>

            <div className="highlight">
              <strong>Why it matters:</strong> These steps are essential to convert the raw quantum transmission into a provably secure shared key.
            </div>
          </div>
        </div>
      </div>

      <footer>
        <p>This virtual lab focuses on conceptual and protocol-level understanding. While hardware imperfections are simplified, the core quantum security principles remain accurate.</p>
        <p>Every component in this virtual lab maps directly to a real quantum communication system used in modern QKD research.</p>
      </footer>
    </div>
  );
};

export default LabEquipment;