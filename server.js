import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database (replace with real DB)
let users = [];
let orders = [];
let qrCodeCache = null;

// Generate PIX QR Code
async function generatePixQRCode() {
  if (qrCodeCache) return qrCodeCache;
  
  try {
    const pixString = `00020126580014br.gov.bcb.pix0136${process.env.PIX_KEY}52040000530398654061000.005802BR5913AURORAFACE6009SAO PAULO62410503***63041D3D`;
    const qrCode = await QRCode.toDataURL(pixString);
    qrCodeCache = qrCode;
    return qrCode;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
}

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, country } = req.body;
    
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      country: country || 'BR',
      createdAt: new Date()
    };
    
    users.push(user);
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    
    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      token,
      user: { id: user.id, name: user.name, email: user.email, country: user.country }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar', error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválidos' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, name: user.name, email: user.email, country: user.country }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// Get PIX QR Code
app.get('/api/payment/pix-qrcode', async (req, res) => {
  try {
    const qrCode = await generatePixQRCode();
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar QR Code', error: error.message });
  }
});

// Get Currency Rates
app.get('/api/currency/rates', async (req, res) => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
    const data = await response.json();
    res.json({
      rates: {
        BRL: 1,
        USD: data.rates.USD,
        EUR: data.rates.EUR
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter taxas de câmbio', error: error.message });
  }
});

// Create Order
app.post('/api/orders', (req, res) => {
  try {
    const { userId, items, total, address } = req.body;
    
    const order = {
      id: Date.now(),
      userId,
      items,
      total,
      paymentMethod: 'pix',
      address,
      status: 'pendente_pagamento',
      createdAt: new Date()
    };
    
    orders.push(order);
    res.status(201).json({ message: 'Pedido criado com sucesso', order });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌟 AuroraFace rodando em http://localhost:${PORT}`);
});
