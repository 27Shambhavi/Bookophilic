import React, { useState, useMemo } from 'react';
import { BookOpen, User, Brain, X, ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GENRE_METADATA = {
  "Self-help": { icon: "🧠", color: "#60a5fa", label: "Self-help" },
  "Psychology": { icon: "💭", color: "#3b82f6", label: "Psychology" },
  "Finance": { icon: "💸", color: "#1d4ed8", label: "Finance" },
  "Philosophy": { icon: "🏛️", color: "#1e3a8a", label: "Philosophy" },
  "Fiction": { icon: "🪄", color: "#93c5fd", label: "Fiction" },
  "Business": { icon: "💼", color: "#2563eb", label: "Business" },
  "Spirituality": { icon: "🧘", color: "#a5f3fc", label: "Spirituality" },
  "Science": { icon: "🔬", color: "#06b6d4", label: "Science" },
  "Tech": { icon: "💻", color: "#0ea5e9", label: "Tech" },
  "History": { icon: "⏳", color: "#14b8a6", label: "History" },
};

export default function WisdomGraph({ books = [] }) {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null); // { type, id }
  const [selectedNode, setSelectedNode] = useState(null); // { type, data }

  // Dimensions of SVG canvas
  const width = 800;
  const height = 550;
  const cx = width / 2;
  const cy = height / 2;

  // Radii for circles
  const R_genres = 140;
  const R_subs = 210;
  const R_books = 270;

  // Process data for the graph
  const graphData = useMemo(() => {
    const genresList = Object.keys(GENRE_METADATA);
    
    // 1. Group books by genre and subcategory
    const activeGenres = new Set();
    const subcategoryNodes = [];
    const bookNodes = [];

    // Temporary trackers to prevent overlaps
    const genreBookCount = {};
    const subcategoryMap = {}; // "genre:sub" -> { x, y, name }

    books.forEach((book) => {
      const gName = book.genre?.name;
      if (gName && GENRE_METADATA[gName]) {
        activeGenres.add(gName);
        genreBookCount[gName] = (genreBookCount[gName] || 0) + 1;
      }
    });

    // Compute Genre Node coordinates
    const genreNodes = genresList.map((gName, index) => {
      const angle = (index * 2 * Math.PI) / genresList.length - Math.PI / 2;
      const x = cx + R_genres * Math.cos(angle);
      const y = cy + R_genres * Math.sin(angle);
      const isActive = activeGenres.has(gName);
      
      return {
        id: gName,
        name: gName,
        type: 'genre',
        x,
        y,
        angle,
        isActive,
        color: GENRE_METADATA[gName].color,
        icon: GENRE_METADATA[gName].icon
      };
    });

    // Map genres for easy lookup
    const genreLookup = {};
    genreNodes.forEach(node => {
      genreLookup[node.name] = node;
    });

    // Compute Subcategory and Book coordinates
    books.forEach((book, bIndex) => {
      const gName = book.genre?.name;
      if (!gName || !genreLookup[gName]) return;

      const parentGenre = genreLookup[gName];
      const subName = book.subcategory || "general";
      const subKey = `${gName}:${subName}`;

      // Allocate subcategory node if not exists
      if (!subcategoryMap[subKey]) {
        // Position subcategories slightly offset from genre node
        const numBooksInGenre = genreBookCount[gName] || 1;
        const subIndex = Object.keys(subcategoryMap).filter(k => k.startsWith(gName)).length;
        
        // Spread subcategories in an arc around the genre angle
        const spreadArc = Math.PI / 4; // 45 degrees arc
        const offsetAngle = parentGenre.angle + (subIndex - 0.5) * spreadArc;
        
        const sx = cx + R_subs * Math.cos(offsetAngle);
        const sy = cy + R_subs * Math.sin(offsetAngle);

        subcategoryMap[subKey] = {
          id: subKey,
          name: subName,
          type: 'subcategory',
          genreName: gName,
          x: sx,
          y: sy,
          angle: offsetAngle,
          color: parentGenre.color
        };
      }

      const parentSub = subcategoryMap[subKey];

      // Position Book node around its subcategory node
      const bookIndexInSub = bookNodes.filter(n => n.subKey === subKey).length;
      const bookAngle = parentSub.angle + (bookIndexInSub - 0.5) * 0.25; // Narrow fan out

      const bx = cx + R_books * Math.cos(bookAngle);
      const by = cy + R_books * Math.sin(bookAngle);

      bookNodes.push({
        id: book.id,
        name: book.title,
        type: 'book',
        bookData: book,
        subKey,
        genreName: gName,
        x: bx,
        y: by,
        color: parentGenre.color
      });
    });

    return {
      genreNodes,
      subcategoryNodes: Object.values(subcategoryMap),
      bookNodes
    };
  }, [books, cx, cy]);

  // Handle click on node
  const handleNodeClick = (node) => {
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  };

  // Check if a line/node should be highlighted
  const isHighlighted = (type, node) => {
    if (!hoveredNode) return false;
    
    // Highlight matching path
    if (hoveredNode.type === 'book') {
      if (type === 'book' && node.id === hoveredNode.id) return true;
      if (type === 'subcategory' && node.id === hoveredNode.subKey) return true;
      if (type === 'genre' && node.name === hoveredNode.genreName) return true;
      if (type === 'center') return true;
    }
    
    if (hoveredNode.type === 'subcategory') {
      if (type === 'subcategory' && node.id === hoveredNode.id) return true;
      if (type === 'book' && node.subKey === hoveredNode.id) return true;
      if (type === 'genre' && node.name === hoveredNode.genreName) return true;
      if (type === 'center') return true;
    }

    if (hoveredNode.type === 'genre') {
      if (type === 'genre' && node.name === hoveredNode.id) return true;
      if (type === 'subcategory' && node.genreName === hoveredNode.id) return true;
      if (type === 'book' && node.genreName === hoveredNode.id) return true;
      if (type === 'center') return true;
    }

    return false;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" /> Wisdom Domain Map
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Hover over nodes to trace connections. Click nodes to unlock your logged knowledge.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Main Genres</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> Subcategories</span>
        </div>
      </div>

      <div className="relative w-full max-w-[800px] aspect-[800/550] bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden">
        {/* SVG rendering */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* DEFINITIONS FOR GRADIENTS AND GLOWS */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4f68ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#070a13" stopOpacity="0" />
            </radialGradient>
            {graphData.genreNodes.map((node) => (
              <radialGradient key={`grad-${node.id}`} id={`grad-${node.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={node.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* BACKGROUND PULSES */}
          <circle cx={cx} cy={cy} r="40" fill="url(#centerGradient)" className="animate-pulse" />
          {graphData.genreNodes.map((node) => node.isActive && (
            <circle 
              key={`pulse-${node.id}`}
              cx={node.x} cy={node.y} r="35" 
              fill={`url(#grad-${node.id})`}
              className="transition-opacity duration-300"
              style={{ opacity: hoveredNode && !isHighlighted('genre', node) ? 0.2 : 0.8 }}
            />
          ))}

          {/* INNER CONNECTIONS (Center to Genres) */}
          {graphData.genreNodes.map((node) => {
            const isPathActive = isHighlighted('genre', node);
            return (
              <line
                key={`line-g-${node.id}`}
                x1={cx} y1={cy} x2={node.x} y2={node.y}
                stroke={node.isActive ? node.color : "rgba(255,255,255,0.04)"}
                strokeWidth={isPathActive ? 2.5 : node.isActive ? 1.2 : 0.8}
                strokeDasharray={node.isActive ? "none" : "3,3"}
                className="transition-all duration-300"
                style={{ opacity: hoveredNode && !isPathActive ? 0.15 : 0.7 }}
              />
            );
          })}

          {/* MIDDLE CONNECTIONS (Genres to Subcategories) */}
          {graphData.subcategoryNodes.map((sub) => {
            const parentGenre = graphData.genreNodes.find(g => g.name === sub.genreName);
            const isPathActive = isHighlighted('subcategory', sub);
            if (!parentGenre) return null;
            return (
              <path
                key={`line-s-${sub.id}`}
                d={`M ${parentGenre.x} ${parentGenre.y} Q ${(parentGenre.x + sub.x) / 2 - 10} ${(parentGenre.y + sub.y) / 2 - 10} ${sub.x} ${sub.y}`}
                fill="none"
                stroke={sub.color}
                strokeWidth={isPathActive ? 2.5 : 1.2}
                className="transition-all duration-300"
                style={{ opacity: hoveredNode && !isPathActive ? 0.15 : 0.6 }}
              />
            );
          })}

          {/* OUTER CONNECTIONS (Subcategories to Books) */}
          {graphData.bookNodes.map((book) => {
            const parentSub = graphData.subcategoryNodes.find(s => s.id === book.subKey);
            const isPathActive = isHighlighted('book', book);
            if (!parentSub) return null;
            return (
              <line
                key={`line-b-${book.id}`}
                x1={parentSub.x} y1={parentSub.y} x2={book.x} y2={book.y}
                stroke={book.color}
                strokeWidth={isPathActive ? 2.5 : 1}
                strokeDasharray="2,2"
                className="transition-all duration-300"
                style={{ opacity: hoveredNode && !isPathActive ? 0.15 : 0.5 }}
              />
            );
          })}

          {/* CENTER MIND NODE */}
          <g 
            className="cursor-pointer"
            onMouseEnter={() => setHoveredNode({ type: 'center', id: 'center' })}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx={cx} cy={cy} r="20" fill="#4f68ff" className="transition-all" />
            <circle cx={cx} cy={cy} r="26" fill="none" stroke="#4f68ff" strokeWidth="1.5" className="animate-ping opacity-40" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">🧠</text>
          </g>

          {/* GENRE NODES */}
          {graphData.genreNodes.map((node) => {
            const isPathActive = isHighlighted('genre', node);
            return (
              <g
                key={`node-g-${node.id}`}
                className="cursor-pointer transition-transform duration-300 hover:scale-110"
                transform={`translate(0, 0)`}
                onMouseEnter={() => setHoveredNode({ type: 'genre', id: node.name })}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                <circle
                  cx={node.x} cy={node.y} r="18"
                  fill="#070a13"
                  stroke={node.isActive ? node.color : "rgba(255,255,255,0.1)"}
                  strokeWidth={isPathActive ? 3.5 : node.isActive ? 2.2 : 1.2}
                  className="transition-all duration-300"
                  style={{
                    filter: isPathActive ? 'url(#glow)' : 'none',
                    opacity: hoveredNode && !isPathActive ? 0.3 : 1
                  }}
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" className="select-none" style={{ opacity: hoveredNode && !isPathActive ? 0.3 : 1 }}>
                  {node.icon}
                </text>
                {/* Text Label on hover or active */}
                {(isPathActive || node.isActive) && (
                  <text 
                    x={node.x} y={node.y + 26} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fill="#fff" 
                    fontWeight="bold"
                    className="select-none transition-opacity duration-300 pointer-events-none"
                    style={{ opacity: hoveredNode && !isPathActive ? 0.2 : 0.9 }}
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* SUBCATEGORY NODES */}
          {graphData.subcategoryNodes.map((sub) => {
            const isPathActive = isHighlighted('subcategory', sub);
            return (
              <g
                key={`node-s-${sub.id}`}
                className="cursor-pointer transition-transform duration-300 hover:scale-110"
                onMouseEnter={() => setHoveredNode({ type: 'subcategory', id: sub.id, genreName: sub.genreName })}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(sub)}
              >
                <circle
                  cx={sub.x} cy={sub.y} r="8"
                  fill={sub.color}
                  stroke="#070a13"
                  strokeWidth="1.5"
                  className="transition-all duration-300 animate-float"
                  style={{
                    boxShadow: isPathActive ? `0 0 10px ${sub.color}` : 'none',
                    opacity: hoveredNode && !isPathActive ? 0.3 : 1
                  }}
                />
                {isPathActive && (
                  <text
                    x={sub.x} y={sub.y - 14}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill={sub.color}
                    fontWeight="bold"
                    className="capitalize pointer-events-none select-none bg-slate-950 px-1 py-0.5 rounded"
                  >
                    {sub.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* BOOK NODES */}
          {graphData.bookNodes.map((book) => {
            const isPathActive = isHighlighted('book', book);
            const isBookSelected = selectedNode && selectedNode.type === 'book' && selectedNode.id === book.id;
            return (
              <g
                key={`node-b-${book.id}`}
                className="cursor-pointer transition-all duration-300 hover:scale-125"
                onMouseEnter={() => setHoveredNode({ type: 'book', id: book.id, subKey: book.subKey, genreName: book.genreName })}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(book)}
              >
                <circle
                  cx={book.x} cy={book.y} r={isBookSelected ? 8 : 6}
                  fill="#070a13"
                  stroke={book.color}
                  strokeWidth={isPathActive || isBookSelected ? 2.5 : 1.5}
                  className="transition-all duration-300"
                  style={{
                    filter: isPathActive ? 'url(#glow)' : 'none',
                    opacity: hoveredNode && !isPathActive ? 0.2 : 1
                  }}
                />
                {isPathActive && (
                  <text
                    x={book.x} y={book.y - 12}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#fff"
                    fontWeight="bold"
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {book.name.length > 15 ? `${book.name.substring(0, 12)}...` : book.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* NODE DETAILS MODAL OVERLAY */}
      {selectedNode && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-20 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                {selectedNode.type === 'book' ? 'Book Details' : `${selectedNode.name} Category`}
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content for Book */}
            {selectedNode.type === 'book' && (
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <img 
                    src={selectedNode.bookData.cover_image_url || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200`} 
                    alt={selectedNode.name}
                    className="w-16 h-22 object-cover rounded-lg border border-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base leading-snug line-clamp-2">{selectedNode.name}</h4>
                    <p className="text-slate-400 text-xs font-medium mt-1">by {selectedNode.bookData.author}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {selectedNode.genreName}
                      </span>
                      {selectedNode.bookData.subcategory && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold capitalize bg-white/5 border border-white/10 text-slate-300">
                          {selectedNode.bookData.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Reading Progress</span>
                    <span>
                      {selectedNode.bookData.page_count > 0 
                        ? Math.round((selectedNode.bookData.current_page / selectedNode.bookData.page_count) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ 
                        width: `${selectedNode.bookData.page_count > 0 
                          ? (selectedNode.bookData.current_page / selectedNode.bookData.page_count) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-3">
                  {selectedNode.bookData.description || "No summary profile created yet."}
                </p>

                <div className="pt-2 border-t border-white/5 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      navigate(`/book/${selectedNode.id}`);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glass-glow"
                  >
                    Open Notebook <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Content for Genre or Subcategory list */}
            {selectedNode.type !== 'book' && (
              <div className="p-6 max-h-[300px] overflow-y-auto space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Books connected to "{selectedNode.name}"
                  </span>
                </div>
                {(() => {
                  const filtered = books.filter(b => {
                    if (selectedNode.type === 'genre') {
                      return b.genre?.name === selectedNode.name;
                    } else { // subcategory
                      const [g, s] = selectedNode.id.split(':');
                      return b.genre?.name === g && (b.subcategory === s || (!b.subcategory && s === 'general'));
                    }
                  });

                  if (filtered.length === 0) {
                    return <p className="text-xs text-slate-500 text-center py-4">No books registered in this branch.</p>;
                  }

                  return filtered.map(b => (
                    <div 
                      key={b.id}
                      onClick={() => {
                        setSelectedNode(null);
                        navigate(`/book/${b.id}`);
                      }}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-indigo-500/40 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={b.cover_image_url || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200`} 
                          className="w-8 h-11 object-cover rounded"
                          alt=""
                        />
                        <div>
                          <h5 className="text-xs font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                            {b.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">by {b.author}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ));
                })()}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
