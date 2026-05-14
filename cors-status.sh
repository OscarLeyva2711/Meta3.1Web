#!/bin/bash

# Script visual para mostrar el estado y solución

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  🔧 SOLUCIÓN CORS - Meta3.1                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📊 ESTADO ACTUAL:${NC}"
echo ""
echo -e "${GREEN}✅ Backend corriendo${NC} en http://localhost:3000"
echo -e "${RED}❌ Frontend NO iniciado${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}🚀 SOLUCIÓN RÁPIDA:${NC}"
echo ""
echo "1️⃣  Abre OTRA terminal y ejecuta:"
echo ""
echo -e "    ${GREEN}cd /Users/oscarleyvaherrera/Desarrollo\\ AppsWeb/Meta3.1/17marzo26${NC}"
echo -e "    ${GREEN}npm run dev${NC}"
echo ""
echo "2️⃣  Espera a que inicie el Frontend en http://localhost:5173"
echo ""
echo "3️⃣  Limpia cookies del navegador:"
echo -e "    • Abre DevTools (${YELLOW}F12${NC})"
echo -e "    • Ve a ${YELLOW}Application > Storage${NC}"
echo -e "    • Haz click en ${YELLOW}Clear All${NC}"
echo ""
echo "4️⃣  Recarga la página con CTRL+SHIFT+R (hard refresh)"
echo ""
echo "5️⃣  ¡Intenta hacer login nuevamente!"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📝 CREDENCIALES DE PRUEBA:${NC}"
echo ""
echo "Email:    admin@example.com"
echo "Password: Admin123456"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📋 CAMBIOS REALIZADOS:${NC}"
echo ""
echo "✅ Actualizado .env:"
echo "   CLIENT_URL: http://localhost:5173"
echo ""
echo "✅ Mejorada configuración CORS en app.js"
echo ""
echo "✅ Corregido error de sintaxis en openapi.yaml"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}🔗 ENDPOINTS DISPONIBLES:${NC}"
echo ""
echo "Backend:       http://localhost:3000"
echo "Frontend:      http://localhost:5173"
echo "API Docs:      http://localhost:3000/api-docs"
echo "Login:         POST http://localhost:3000/api/usuarios/login"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}¡Todo está listo! Sigue los pasos arriba y deberá funcionar. 🎉${NC}"
echo ""
