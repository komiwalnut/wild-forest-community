import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OwnerData, StakersMapProps, Bubble } from '../../types';
import { StakerInfoPanel } from './StakerInfoPanel';

export function StakersMap({ owners, loading, onSelectStaker, selectedStaker }: StakersMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [totalStakers, setTotalStakers] = useState(0);
  const [actualStakers, setActualStakers] = useState<OwnerData[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    const stakers = owners.filter(owner => owner.staked > 0);
    setActualStakers(stakers);
    setTotalStakers(stakers.length);
  }, [owners]);

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current || actualStakers.length === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const totalBubbles = actualStakers.length;

    const bubbleAreaRatio = 0.55; 

    const containerAspect = containerWidth / containerHeight;

    let baseWidth = containerWidth;
    let baseHeight = containerHeight;

    if (totalBubbles > 20) {
      const scaleFactor = Math.sqrt(totalBubbles / 40) * bubbleAreaRatio;
      baseWidth = containerWidth * scaleFactor;
      baseHeight = baseWidth / containerAspect;

      baseWidth = Math.max(baseWidth, containerWidth * 0.95);
      baseHeight = Math.max(baseHeight, containerHeight * 0.95);

      const maxDimensionFactor = Math.min(3, Math.max(1.2, Math.sqrt(totalBubbles / 100)));
      baseWidth = Math.min(baseWidth, containerWidth * maxDimensionFactor);
      baseHeight = Math.min(baseHeight, containerHeight * maxDimensionFactor);
    }
    
    setDimensions({
      width: baseWidth,
      height: baseHeight
    });
  }, [actualStakers, containerRef]);

  const calculateIdealZoom = useCallback((bubbleArray: Bubble[]) => {
    if (!containerRef.current || bubbleArray.length === 0) return 1;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const zoomX = containerWidth / dimensions.width;
    const zoomY = containerHeight / dimensions.height;

    let idealZoom = Math.min(zoomX, zoomY) * 0.95;

    idealZoom = Math.min(Math.max(idealZoom, 0.6), 1);
    
    return idealZoom;
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    const handleResize = () => {
      calculateDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateDimensions]);

  useEffect(() => {
    if (actualStakers.length > 0) {
      calculateDimensions();
    }
  }, [actualStakers, calculateDimensions]);

  useEffect(() => {
    if (actualStakers.length === 0 || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const maxStakedLords = Math.max(1, ...actualStakers.map(o => o.staked || 1));

    let minRadius, maxRadius;
    if (actualStakers.length > 100) {
      minRadius = 20;
      maxRadius = 60;
    } else if (actualStakers.length > 50) {
      minRadius = 25;
      maxRadius = 70;
    } else {
      minRadius = 30;
      maxRadius = 80;
    }

    const containerScale = Math.min(
      dimensions.width / (containerRef.current?.clientWidth || 1000),
      dimensions.height / (containerRef.current?.clientHeight || 800)
    );
    
    minRadius = Math.max(15, minRadius * Math.sqrt(containerScale));
    maxRadius = Math.max(35, maxRadius * Math.sqrt(containerScale));

    const padding = Math.min(dimensions.width, dimensions.height) * 0.05;

    const usableWidth = dimensions.width - padding * 2;
    const usableHeight = dimensions.height - padding * 2;

    const checkOverlap = (bubble: Bubble, existingBubbles: Bubble[]) => {
      for (const existing of existingBubbles) {
        const dx = bubble.x - existing.x;
        const dy = bubble.y - existing.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (bubble.radius + existing.radius) * 1.05;
        
        if (distance < minDistance) {
          return true;
        }
      }
      return false;
    };
    
    const generateBubbles = () => {
      const result: Bubble[] = [];

      const stakersToShow = [...actualStakers]
        .sort((a, b) => b.staked - a.staked);

      const calculateRadius = (stakedCount: number) => {
        const normalized = Math.sqrt(stakedCount / maxStakedLords);
        return minRadius + normalized * (maxRadius - minRadius);
      };

      const avgStakedCount = actualStakers.reduce((sum, staker) => sum + staker.staked, 0) / actualStakers.length;
      const avgRadius = calculateRadius(avgStakedCount);
      const cellSize = avgRadius * 2.1;

      const gridColumns = Math.floor(usableWidth / cellSize);
      const gridRows = Math.floor(usableHeight / cellSize);

      const cellsToUse: [number, number][] = [];

      for (let cellX = 0; cellX < gridColumns; cellX++) {
        for (let cellY = 0; cellY < gridRows; cellY++) {
          const centerX = gridColumns / 2;
          const centerY = gridRows / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow((cellX - centerX) / gridColumns, 2) + 
            Math.pow((cellY - centerY) / gridRows, 2)
          );
          
          cellsToUse.push([cellX, cellY]);
        }
      }

      cellsToUse.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a[0] - gridColumns/2, 2) + Math.pow(a[1] - gridRows/2, 2));
        const distB = Math.sqrt(Math.pow(b[0] - gridColumns/2, 2) + Math.pow(b[1] - gridRows/2, 2));
        return distA - distB;
      });

      const usedCells: { [key: string]: boolean } = {};
      
      for (const staker of stakersToShow) {
        const stakedCount = Math.max(1, staker.staked);
        const radius = calculateRadius(stakedCount);
        
        let x, y, attempts = 0;
        const maxAttempts = 300;
        let bubbleData: Bubble | null = null;
        let foundPosition = false;

        const findAvailableCell = () => {
          for (const [cellX, cellY] of cellsToUse) {
            const cellKey = `${cellX},${cellY}`;
            if (!usedCells[cellKey]) {
              usedCells[cellKey] = true;
              return [
                padding + (cellX + 0.2 + Math.random() * 0.6) * cellSize,
                padding + (cellY + 0.2 + Math.random() * 0.6) * cellSize
              ];
            }
          }

          return [
            padding + Math.random() * usableWidth,
            padding + Math.random() * usableHeight
          ];
        };
        
        while (!foundPosition && attempts < maxAttempts) {
          attempts++;

          if (attempts < 100) {
            [x, y] = findAvailableCell();
          } else if (attempts < 200) {
            const angle = Math.random() * Math.PI * 2;
            const distanceFromCenter = Math.random() * Math.random();
            x = padding + usableWidth/2 + Math.cos(angle) * (usableWidth/2) * distanceFromCenter;
            y = padding + usableHeight/2 + Math.sin(angle) * (usableHeight/2) * distanceFromCenter;
          } else {
            x = padding + Math.random() * usableWidth;
            y = padding + Math.random() * usableHeight;

            bubbleData = {
              owner: staker,
              x,
              y,
              radius
            };

            foundPosition = true;
            break;
          }

          x = Math.max(padding + radius, Math.min(dimensions.width - padding - radius, x));
          y = Math.max(padding + radius, Math.min(dimensions.height - padding - radius, y));

          bubbleData = {
            owner: staker,
            x,
            y,
            radius
          };

          foundPosition = !checkOverlap(bubbleData, result);
          
          if (foundPosition) {
            result.push(bubbleData);
          }
        }

        if (!foundPosition && bubbleData) {
          result.push(bubbleData);
        }
      }
      
      return result;
    };
    
    try {
      const newBubbles = generateBubbles();
      setBubbles(newBubbles);

      if (!mapInitialized && newBubbles.length > 0) {
        const idealZoom = calculateIdealZoom(newBubbles);
        setZoomLevel(idealZoom);
        setMapPosition({ x: 0, y: 0 });
        setMapInitialized(true);
      }
    } catch (error) {
      console.error("Error generating bubbles:", error);
    }
  }, [dimensions, actualStakers, mapInitialized, calculateIdealZoom]);

  const getBubbleColor = (owner: OwnerData) => {
    if (owner.mystic > 0) return '#40f1fe';
    if (owner.legendary > 0) return '#eec315';
    if (owner.epic > 0) return '#6654f1';
    return '#2c90ac';
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...`;
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.1, 1);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.1, 0.3);
      return newZoom;
    });
  };

  const handleResetView = () => {
    const idealZoom = calculateIdealZoom(bubbles);
    setZoomLevel(idealZoom);
    setMapPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.target && (e.target as HTMLElement).closest('.staker-info-panel')) {
      return;
    }
    
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
    
    e.preventDefault();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target && (e.target as HTMLElement).closest('.staker-info-panel')) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const speedFactor = 1 / zoomLevel;

      let newX = mapPosition.x + (dx * speedFactor);
      let newY = mapPosition.y + (dy * speedFactor);

      const containerWidth = containerRef.current?.clientWidth || 0;
      const containerHeight = containerRef.current?.clientHeight || 0;

      const scaledWidth = dimensions.width * zoomLevel;
      const scaledHeight = dimensions.height * zoomLevel;
      
      const maxX = Math.max(0, (scaledWidth - containerWidth) / (2 * zoomLevel));
      const minX = -maxX;
      const maxY = Math.max(0, (scaledHeight - containerHeight) / (2 * zoomLevel));
      const minY = -maxY;

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      setMapPosition({ x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const maxStakedLords = actualStakers.length > 0 
    ? Math.max(1, ...actualStakers.map(o => o.staked || 1))
    : 1;

  if (loading) {
    return (
      <div className="card">
        <div style={{ height: '660px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0.5rem' }}>
          <div className="inline-spinner"></div>
          <span className="ml-2">Initializing map...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card h-full" style={{ padding: '0.5rem' }}>
      <div 
        ref={containerRef} 
        className="stakers-map-canvas" 
        style={{ 
          height: '800px', 
          width: '100%', 
          position: 'relative', 
          backgroundColor: '#0f172a', 
          borderRadius: '0.5rem', 
          overflow: 'hidden', 
          cursor: isDragging ? 'grabbing' : 'grab' 
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 30, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'rgba(25, 33, 51, 0.8)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 181, 43, 0.66)', display: 'flex', gap: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {totalStakers} Stakers
          </div>

          <div style={{ backgroundColor: 'rgba(25, 33, 51, 0.8)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 181, 43, 0.66)', display: 'flex', gap: 10, fontWeight: 600 }}>
            <span className="text-sm font-semibold mb-2">Rarity Colors</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#2c90ac' }}></div>
                <span style={{ fontSize: '0.75rem' }}>Rare</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#6654f1' }}></div>
                <span style={{ fontSize: '0.75rem' }}>Epic</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#eec315' }}></div>
                <span style={{ fontSize: '0.75rem' }}>Legendary</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#40f1fe' }}></div>
                <span style={{ fontSize: '0.75rem' }}>Mystic</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 30, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleResetView}
            style={{ backgroundColor: 'rgba(25, 33, 51, 0.8)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 181, 43, 0.66)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}
          >
            Reset View
          </button>
          
          <div style={{ backgroundColor: 'rgba(25, 33, 51, 0.8)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 181, 43, 0.66)', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={handleZoomOut} 
              style={{ backgroundColor: 'rgba(47, 61, 85, 0.8)', border: 'none', cursor: 'pointer', color: 'orange', width: '2rem', height: '2rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '1.25rem' }} 
              aria-label="Zoom out"
            >
              -
            </button>
            <span style={{ fontSize: '0.875rem', padding: '0rem 0.5rem', color: 'orange' }}>{Math.round(zoomLevel * 100)}%</span>
            <button 
              onClick={handleZoomIn} 
              style={{ backgroundColor: 'rgba(47, 61, 85, 0.8)', border: 'none', cursor: 'pointer', color: 'orange', width: '2rem', height: '2rem', borderRadius: '0.25rem', fontWeight: 'bold', fontSize: '1.25rem' }} 
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        <div className="map-draggable-area" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}></div>

        <div 
          style={{ 
            transform: `translate(-50%, -50%) translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomLevel})`, 
            width: dimensions.width, 
            height: dimensions.height, 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            zIndex: 10 
          }}
        >
          {bubbles.length > 0 ? (
            bubbles.map((bubble, index) => {
              const opacityBase = 0.35;
              const opacityScale = bubble.owner.staked / maxStakedLords;
              const opacity = opacityBase + opacityScale * 0.5;

              const bubbleColor = getBubbleColor(bubble.owner);

              const isSelected = selectedStaker?.address === bubble.owner.address;
              
              return (
                <div
                  key={`${bubble.owner.address}-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${bubble.x - bubble.radius}px`,
                    top: `${bubble.y - bubble.radius}px`,
                    width: `${bubble.radius * 2}px`,
                    height: `${bubble.radius * 2}px`,
                    borderRadius: '50%',
                    backgroundColor: isSelected 
                      ? 'rgba(245, 156, 26, 0.5)' 
                      : `rgba(45, 130, 183, ${opacity})`,
                    border: isSelected 
                      ? '3px solid #f59c1a' 
                      : `2px solid ${bubbleColor}`,
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    zIndex: isSelected ? 20 : bubble.owner.staked > maxStakedLords / 2 ? 10 : 1,
                    transition: 'all 0.3s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    boxShadow: isSelected ? '0 0 15px rgba(245, 156, 26, 0.5)' : 'none'
                  }}
                  onMouseDown={(e) => { e.stopPropagation(); }}
                  onClick={(e) => { e.stopPropagation(); onSelectStaker(bubble.owner); }}
                >
                  <div style={{ 
                    fontSize: bubble.radius > 70 ? '1rem' : bubble.radius > 45 ? '0.85rem' : '0.75rem', 
                    fontWeight: 'bold', 
                    textShadow: '0 0 6px rgba(0, 0, 0, 0.8)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '90%'
                  }}>
                    {truncateAddress(bubble.owner.address)}
                  </div>
                  <div style={{ 
                    fontSize: bubble.radius > 70 ? '1.6rem' : bubble.radius > 45 ? '1.3rem' : '1rem', 
                    fontWeight: 'bold', 
                    textShadow: '0 0 6px rgba(0, 0, 0, 0.8)' 
                  }}>
                    {bubble.owner.staked}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <p>No stakers found to display.</p>
            </div>
          )}
        </div>

        {selectedStaker && (
          <StakerInfoPanel staker={selectedStaker} onClose={() => onSelectStaker(null)} />
        )}
      </div>
    </div>
  );
}