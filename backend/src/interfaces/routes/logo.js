const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Logo endpoint for light mode
router.get('/light', (req, res) => {
  try {
    const logoPath = 'C:\\Users\\nadin\\Desktop\\lotus_project\\lotus_project\\backend\\logo\\logo-light.jpg';
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({ error: 'Light logo not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the file
    res.sendFile(logoPath);
  } catch (error) {
    console.error('Error serving light logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logo endpoint for dark mode
router.get('/dark', (req, res) => {
  try {
    const logoPath = 'C:\\Users\\nadin\\Desktop\\lotus_project\\lotus_project\\backend\\logo\\logo-dark.jpg';
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({ error: 'Dark logo not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the file
    res.sendFile(logoPath);
  } catch (error) {
    console.error('Error serving dark logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logo info endpoint
router.get('/info', (req, res) => {
  try {
    const lightLogoPath = 'C:\\Users\\nadin\\Desktop\\lotus_project\\lotus_project\\backend\\logo\\logo-light.jpg';
    const darkLogoPath = 'C:\\Users\\nadin\\Desktop\\lotus_project\\lotus_project\\backend\\logo\\logo-dark.jpg';
    
    const info = {
      light: {
        available: fs.existsSync(lightLogoPath),
        url: '/api/logo/light',
        size: fs.existsSync(lightLogoPath) ? fs.statSync(lightLogoPath).size : 0
      },
      dark: {
        available: fs.existsSync(darkLogoPath),
        url: '/api/logo/dark',
        size: fs.existsSync(darkLogoPath) ? fs.statSync(darkLogoPath).size : 0
      }
    };
    
    res.json(info);
  } catch (error) {
    console.error('Error getting logo info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logo info endpoint with mode parameter
router.get('/info/:mode', (req, res) => {
  try {
    const mode = req.params.mode; // 'light' or 'dark'
    const logoPath = `C:\\Users\\nadin\\Desktop\\lotus_project\\lotus_project\\backend\\logo\\logo-${mode}.jpg`;
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({ error: `${mode} logo not found` });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the file
    res.sendFile(logoPath);
  } catch (error) {
    console.error(`Error serving ${req.params.mode} logo:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
