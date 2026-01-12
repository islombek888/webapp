import request from 'supertest';
import app from '../server/index';

describe('API Endpoints', () => {
  test('GET /api/health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/crypto/prices', async () => {
    const response = await request(app)
      .get('/api/crypto/prices')
      .expect(200);
    
    expect(response.body).toHaveProperty('BTC');
    expect(response.body).toHaveProperty('ETH');
    expect(response.body.BTC).toHaveProperty('price');
    expect(response.body.BTC).toHaveProperty('change24h');
  });

  test('GET /api/crypto/prices?symbol=BTC', async () => {
    const response = await request(app)
      .get('/api/crypto/prices?symbol=BTC')
      .expect(200);
    
    expect(response.body).toHaveProperty('symbol', 'BTC');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('change24h');
    expect(response.body).toHaveProperty('volume24h');
    expect(response.body).toHaveProperty('high24h');
    expect(response.body).toHaveProperty('low24h');
  });

  test('GET /api/crypto/candles/BTC', async () => {
    const response = await request(app)
      .get('/api/crypto/candles/BTC')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('time');
    expect(response.body[0]).toHaveProperty('open');
    expect(response.body[0]).toHaveProperty('high');
    expect(response.body[0]).toHaveProperty('low');
    expect(response.body[0]).toHaveProperty('close');
  });

  test('POST /api/ai/predict', async () => {
    const response = await request(app)
      .post('/api/ai/predict')
      .send({ symbol: 'BTC', interval: '1h' })
      .expect(200);
    
    expect(response.body).toHaveProperty('symbol', 'BTC');
    expect(response.body).toHaveProperty('interval', '1h');
    expect(response.body).toHaveProperty('direction');
    expect(['UP', 'DOWN']).toContain(response.body.direction);
    expect(response.body).toHaveProperty('confidence');
    expect(response.body.confidence).toBeGreaterThanOrEqual(75);
    expect(response.body.confidence).toBeLessThanOrEqual(95);
    expect(response.body).toHaveProperty('entryPrice');
    expect(response.body).toHaveProperty('targetPrice');
    expect(response.body).toHaveProperty('predictionTime');
    expect(response.body).toHaveProperty('targetTime');
    expect(response.body).toHaveProperty('technicals');
  });

  test('Serve frontend', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.text).toContain('<!doctype html>');
  });
});

describe('Error Handling', () => {
  test('Invalid symbol returns 200 with all prices', async () => {
    const response = await request(app)
      .get('/api/crypto/prices?symbol=INVALID')
      .expect(200);
    
    expect(response.body).toHaveProperty('BTC');
    expect(response.body).toHaveProperty('ETH');
  });

  test('Invalid candle symbol still returns data', async () => {
    const response = await request(app)
      .get('/api/crypto/candles/INVALID')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
