const request = require('supertest');
const express = require('express');

// Mock connectDB so we don't actually try connecting to Mongo during isolated unit tests
jest.mock('../config/db', () => jest.fn());

const app = require('../index');

describe('API Integration Tests', () => {
  // Test if root route returns the frontend index.html successfully
  it('should return 200 for root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });
});

