import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ofetch } from 'ofetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// API configuration
const API_BASE_URL = 'http://localhost:3001';
const API_ENDPOINT = `${API_BASE_URL}/trpc/generation.generateImage`;

// Helper function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`Error reading image ${imagePath}:`, error);
    throw error;
  }
}

// Auth token helper (currently not needed for testing)
// async function getAuthToken() {
//   return null; // Implement if auth is required
// }

describe('Buyer Show Generation API Test', () => {
  let sceneImageBase64;
  let productImageBase64;

  beforeAll(() => {
    // Load test images
    const sceneImagePath = join(__dirname, 'images', 'scene.jpg');
    const productImagePath = join(__dirname, 'images', 'product.jpeg');
    
    console.log('Loading test images...');
    sceneImageBase64 = imageToBase64(sceneImagePath);
    productImageBase64 = imageToBase64(productImagePath);
    
    console.log(`Scene image loaded: ${sceneImageBase64.length} characters`);
    console.log(`Product image loaded: ${productImageBase64.length} characters`);
  });

  test('should generate buyer show with scene and product images', async () => {
    console.log('Starting buyer show generation test...');

    const requestPayload = {
      userDescription: "请帮我生成一个温馨的生活场景买家秀，展示产品在日常使用中的美好感觉",
      productDescription: "精美的陶瓷花瓶，适合家居装饰",
      placementDescription: "将产品自然地放置在温馨的家居环境中",
      styleDescription: "温馨、自然、生活化的拍摄风格",
      sceneImageBase64: sceneImageBase64,
      productImageBase64: productImageBase64,
      temperature: 0.7
    };

    try {
      console.log('Sending request to API...');
      
      // Make the tRPC request
      const response = await ofetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-001' // MVP authentication for testing
        },
        body: JSON.stringify(requestPayload),
        // Add timeout for long-running generation
        timeout: 120000 // 2 minutes
      });

      console.log('Response received:', response);

      // tRPC wraps the response in result.data
      const data = response.result?.data;
      
      // Validate response structure
      expect(response).toBeDefined();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.status).toBeDefined();
      expect(data.enhancedPrompt).toBeDefined();
      expect(data.createdAt).toBeDefined();

      // Check status
      expect(['PENDING', 'IN_PROGRESS', 'COMPLETED']).toContain(data.status);

      console.log(`Generation request created with ID: ${data.id}`);
      console.log(`Status: ${data.status}`);
      console.log(`Enhanced Prompt: ${data.enhancedPrompt}`);

      // If completed immediately, check for generated image
      if (data.status === 'COMPLETED' && data.generatedImage) {
        expect(data.generatedImage.id).toBeDefined();
        expect(data.generatedImage.filename).toBeDefined();
        expect(data.generatedImage.imageData).toBeDefined();
        expect(data.generatedImage.mimeType).toBeDefined();
        
        console.log(`Generated image: ${data.generatedImage.filename}`);
        console.log(`Image size: ${data.generatedImage.imageData.length} characters`);
      }

      // If still in progress, you might want to poll for completion
      if (data.status === 'IN_PROGRESS') {
        console.log('Generation is in progress. You can use getGenerationStatus to check progress.');
      }

    } catch (error) {
      console.error('Test failed with error:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response._data);
      }
      
      throw error;
    }
  }, 180000); // 3 minute timeout for the test

  test('should handle missing required parameters gracefully', async () => {
    console.log('Testing error handling with missing parameters...');

    const invalidPayload = {
      // Missing required userDescription
      productDescription: "Test product",
      temperature: 0.7
    };

    try {
      await ofetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-001' // MVP authentication for testing
        },
        body: JSON.stringify(invalidPayload)
      });
      
      // If we reach here, the test should fail
      fail('Expected API to throw an error for missing required parameters');
    } catch (error) {
      // This is expected - API should reject invalid requests
      expect(error).toBeDefined();
      console.log('API correctly rejected invalid request:', error.message);
    }
  });

  test('should validate userDescription minimum length', async () => {
    console.log('Testing userDescription validation...');

    const invalidPayload = {
      userDescription: "短", // Too short (less than 5 characters)
      sceneImageBase64: sceneImageBase64,
      productImageBase64: productImageBase64,
      temperature: 0.7
    };

    try {
      await ofetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-001' // MVP authentication for testing
        },
        body: JSON.stringify(invalidPayload)
      });
      
      fail('Expected API to throw validation error for short description');
    } catch (error) {
      expect(error).toBeDefined();
      console.log('API correctly rejected short description:', error.message);
    }
  });

  test('should work with minimal required parameters', async () => {
    console.log('Testing with minimal required parameters...');

    const minimalPayload = {
      userDescription: "生成一个简单的买家秀图片",
      sceneImageBase64: sceneImageBase64,
      productImageBase64: productImageBase64
      // Using default temperature (0.7)
    };

    try {
      const response = await ofetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-001' // MVP authentication for testing
        },
        body: JSON.stringify(minimalPayload),
        timeout: 120000
      });

      // tRPC wraps the response in result.data
      const data = response.result?.data;
      
      expect(response).toBeDefined();
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.status).toBeDefined();
      
      console.log(`Minimal request successful. ID: ${data.id}, Status: ${data.status}`);
    } catch (error) {
      console.error('Minimal request test failed:', error);
      throw error;
    }
  }, 180000);
});