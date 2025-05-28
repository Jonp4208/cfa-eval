// Simple test script to verify PDF generation works
import fetch from 'node-fetch';

const testPdfGeneration = async () => {
  try {
    console.log('Testing PDF generation endpoint...');
    
    const testHtml = `
      <div style="padding: 20px;">
        <h1 style="color: #E51636;">Test Playbook</h1>
        <p>This is a test to verify PDF generation is working.</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #E51636;">
          <h3>Test Section</h3>
          <p>If you can see this PDF, the generation is working correctly!</p>
        </div>
      </div>
    `;

    const response = await fetch('http://localhost:5000/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: testHtml,
        options: {
          format: 'A4',
          margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm'
          },
          printBackground: true,
          preferCSSPageSize: true
        }
      })
    });

    if (response.ok) {
      console.log('✅ PDF generation successful!');
      console.log('Response status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'));
      
      // Save the PDF to verify it works
      const buffer = await response.buffer();
      const fs = await import('fs');
      fs.writeFileSync('test-output.pdf', buffer);
      console.log('✅ Test PDF saved as test-output.pdf');
    } else {
      console.log('❌ PDF generation failed');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

testPdfGeneration();
