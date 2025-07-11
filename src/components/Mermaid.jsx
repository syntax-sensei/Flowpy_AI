import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import mermaid from "mermaid";

// Material-UI imports
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import {
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  Fullscreen as FullscreenIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const Mermaid = ({ chart }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [downloadQuality, setDownloadQuality] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);

  // Add state and handlers for panning at the top of the component
  const panContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add state and handlers for resizing the chart area
  const [chartHeight, setChartHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef(0);
  const heightStart = useRef(600);

  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    resizeStart.current = e.clientY;
    heightStart.current = chartHeight;
    document.body.style.cursor = 'ns-resize';
  };
  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;
    const dy = e.clientY - resizeStart.current;
    setChartHeight(Math.max(200, heightStart.current + dy));
  };
  const handleResizeMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
  };
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
    } else {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [isResizing]);

  // Function to clean up Mermaid code
  const cleanMermaidCode = (code) => {
    if (!code) return code;
    
    let cleaned = code;
    
    // Remove any markdown code blocks
    cleaned = cleaned.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '');
    
    // Clean up node labels - remove special characters that cause issues
    cleaned = cleaned.replace(/\[([^\]]*)\]/g, (match, content) => {
      // Remove only problematic characters, keep more content
      const cleanedContent = content
        .replace(/[:]/g, '') // Remove colons
        .replace(/["']/g, '') // Remove quotes
        .replace(/[^\w\s\-]/g, '') // Remove other special characters but keep dashes
        .trim()
        .substring(0, 40); // Increase limit to 40 characters
      return `[${cleanedContent}]`;
    });
    
    // Clean up diamond nodes (decisions)
    cleaned = cleaned.replace(/\{([^}]*)\}/g, (match, content) => {
      const cleanedContent = content
        .replace(/[:]/g, '') // Remove colons
        .replace(/["']/g, '') // Remove quotes
        .replace(/[^\w\s\-]/g, '') // Remove other special characters but keep dashes
        .trim()
        .substring(0, 40); // Increase limit to 40 characters
      return `{${cleanedContent}}`;
    });
    
    // Ensure proper spacing around arrows
    cleaned = cleaned.replace(/(\w+)\s*-->\s*(\w+)/g, '$1 --> $2');
    
    // Remove any empty lines or excessive whitespace
    cleaned = cleaned.split('\n').filter(line => line.trim()).join('\n');

    // Ensure it starts with flowchart TD
    if (!cleaned.startsWith('flowchart TD') && !cleaned.startsWith('flowchart LR')) {
      cleaned = `flowchart TD\n${cleaned}`;
    }
    
    return cleaned;
  };

  const downloadSVG = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'flowchart.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadHighRes = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
    
    // Set high resolution based on quality setting
    const scale = downloadQuality;
    const svgWidth = svg.clientWidth || 800;
    const svgHeight = svg.clientHeight || 600;
    
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
      link.download = `flowchart.${downloadFormat}`;
      
      if (downloadFormat === 'png') {
        link.href = canvas.toDataURL('image/png', 1.0);
      } else if (downloadFormat === 'jpeg') {
        link.href = canvas.toDataURL('image/jpeg', 0.9);
      }
      
        link.click();
      };
      
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleZoom = (direction) => {
    if (direction === 'in' && zoom < 3) {
      setZoom(prev => Math.min(prev + 0.2, 3));
    } else if (direction === 'out' && zoom > 0.3) {
      setZoom(prev => Math.max(prev - 0.2, 0.3));
    } else if (direction === 'reset') {
      setZoom(1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    // Initialize mermaid with proper configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
      },
    });

    // Clear previous content and error
    setError(null);
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Only render if we have chart content
    if (chart && chart.trim()) {
      try {
        // Clean up the chart code
        const cleanedChart = cleanMermaidCode(chart);
        
        // Validate the cleaned chart
        if (!cleanedChart || !cleanedChart.trim()) {
          throw new Error('Generated flowchart is empty. Please try again.');
        }
        
        // Create a unique ID for this chart
        const id = `mermaid-${Date.now()}`;
        
        // Ensure container exists before setting innerHTML
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="mermaid" id="${id}">${cleanedChart}</div>`;
          
          // Render the chart
          mermaid.render(id, cleanedChart).then(({ svg }) => {
            if (containerRef.current) {
              containerRef.current.innerHTML = svg;
            }
          }).catch((error) => {
            console.error('Mermaid rendering error:', error);
            setError(`Mermaid syntax error: ${error.message}`);
          });
        } else {
          throw new Error('Chart container not found');
        }
      } catch (error) {
        console.error('Mermaid initialization error:', error);
        setError(`Chart generation error: ${error.message}`);
      }
    }
  }, [chart]);

  if (!chart || !chart.trim()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          width: '100%', // Make card take full width
          maxWidth: '1200px', // Set a broad max width
          margin: '0 auto', // Center the card
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Generated Flowchart
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Tooltip title="Zoom In">
                  <IconButton 
                    size="small" 
                    onClick={() => handleZoom('in')}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom Out">
                  <IconButton 
                    size="small" 
                    onClick={() => handleZoom('out')}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Reset Zoom">
                  <IconButton 
                    size="small" 
                    onClick={() => handleZoom('reset')}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <RotateLeftIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Fullscreen">
                  <IconButton 
                    size="small" 
                    onClick={toggleFullscreen}
                    sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => setDownloadDialog(true)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Download
                </Button>
              </Stack>
            </Box>
            
            {zoom !== 1 && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={`Zoom: ${Math.round(zoom * 100)}%`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            )}
          </Box>

          {/* Chart Container */}
          <Box
            sx={{
              p: 3,
              minHeight: chartHeight,
              height: chartHeight,
              minWidth: 900,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'auto',
              bgcolor: '#fafbfc',
              width: '100%',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              position: 'relative',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={panContainerRef}
          >
            {/* Resize handle */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 12,
                cursor: 'ns-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                background: 'linear-gradient(to bottom, transparent 60%, #e2e8f0 100%)',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              }}
              onMouseDown={handleResizeMouseDown}
            >
              <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: '#b0b7c3' }} />
            </Box>
            {error ? (
              <Alert 
                severity="error" 
                sx={{ maxWidth: 800, width: '100%' }}
                action={
                  <Button color="inherit" size="small" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                }
              >
                <AlertTitle>Mermaid Syntax Error</AlertTitle>
                {error}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Common Issues:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Node labels contain special characters (colons, dashes, symbols)</li>
                    <li>Missing spaces around arrows (--&gt;)</li>
                    <li>Incorrect node syntax (use [text] for rectangles, {'{text}'} for diamonds)</li>
                    <li>Unmatched brackets or parentheses</li>
                  </ul>
                </Box>
              </Alert>
            ) : (
              <Box
                ref={containerRef}
                sx={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  '& svg': {
                    maxWidth: '100%',
                    height: 'auto',
                    width: 'auto'
                  }
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Download Dialog */}
      <Dialog 
        open={downloadDialog} 
        onClose={() => setDownloadDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon />
            <Typography variant="h6">Download Flowchart</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={downloadFormat}
                label="Format"
                onChange={(e) => setDownloadFormat(e.target.value)}
              >
                <MenuItem value="png">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon fontSize="small" />
                    PNG (High Quality)
                  </Box>
                </MenuItem>
                <MenuItem value="jpeg">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon fontSize="small" />
                    JPEG (Compressed)
                  </Box>
                </MenuItem>
                <MenuItem value="svg">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon fontSize="small" />
                    SVG (Vector)
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {downloadFormat !== 'svg' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Quality: {downloadQuality}x Resolution
                </Typography>
                <Slider
                  value={downloadQuality}
                  onChange={(e, value) => setDownloadQuality(value)}
                  min={1}
                  max={4}
                  step={0.5}
                  marks={[
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 3, label: '3x' },
                    { value: 4, label: '4x' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Higher quality = larger file size
                </Typography>
              </Box>
            )}

            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                {downloadFormat === 'svg' 
                  ? 'SVG format is perfect for web use and can be scaled without quality loss.'
                  : `${downloadQuality}x resolution will create a ${downloadQuality * downloadQuality}x larger image for crisp printing and high-DPI displays.`
                }
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDownloadDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (downloadFormat === 'svg') {
                downloadSVG();
              } else {
                downloadHighRes();
              }
              setDownloadDialog(false);
            }}
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default Mermaid;