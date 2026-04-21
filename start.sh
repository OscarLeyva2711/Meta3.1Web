#!/bin/bash

# Script para reiniciar ambos servidores y solucionar CORS

echo "🚀 Meta3.1 - Startup Script"
echo "============================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Rutas
BACKEND_PATH="/Users/oscarleyvaherrera/Desarrollo AppsWeb/Meta3.1/api-tareas-mvc"
FRONTEND_PATH="/Users/oscarleyvaherrera/Desarrollo AppsWeb/Meta3.1/17marzo26"

echo -e "${BLUE}📁 Backend: ${BACKEND_PATH}${NC}"
echo -e "${BLUE}📁 Frontend: ${FRONTEND_PATH}${NC}"
echo ""

# Función para matar procesos en puertos
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔍 Verificando puerto $port...${NC}"
    
    local pid=$(lsof -ti :$port)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Matando proceso en puerto $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}✅ Proceso eliminado${NC}"
    else
        echo -e "${GREEN}✅ Puerto $port disponible${NC}"
    fi
}

# Detener procesos existentes
echo -e "${YELLOW}🛑 Deteniendo procesos existentes...${NC}"
kill_port 3000
kill_port 5173
sleep 1

echo ""
echo -e "${GREEN}✅ Puertos liberados${NC}"
echo ""

# Opciones del menú
echo -e "${BLUE}¿Qué deseas hacer?${NC}"
echo "1) Iniciar solo Backend"
echo "2) Iniciar solo Frontend"
echo "3) Iniciar ambos (Frontend + Backend)"
echo "4) Ejecutar migraciones y seeders"
echo "5) Limpiar todo y empezar"
echo ""
read -p "Selecciona una opción (1-5): " option

case $option in
    1)
        echo -e "${BLUE}🚀 Iniciando Backend...${NC}"
        cd "$BACKEND_PATH"
        npm run dev
        ;;
    
    2)
        echo -e "${BLUE}🚀 Iniciando Frontend...${NC}"
        cd "$FRONTEND_PATH"
        npm run dev
        ;;
    
    3)
        echo -e "${BLUE}🚀 Iniciando ambos servidores...${NC}"
        echo ""
        echo -e "${YELLOW}Abre dos terminales diferentes y ejecuta:${NC}"
        echo ""
        echo "Terminal 1 (Backend):"
        echo -e "${GREEN}cd '$BACKEND_PATH' && npm run dev${NC}"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo -e "${GREEN}cd '$FRONTEND_PATH' && npm run dev${NC}"
        echo ""
        echo -e "${YELLOW}Esto abrirá los servidores en:${NC}"
        echo -e "  Backend: ${GREEN}http://localhost:3000${NC}"
        echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
        echo ""
        read -p "¿Deseas abrir automáticamente dos terminales? (s/n): " auto_open
        
        if [[ $auto_open == "s" || $auto_open == "S" ]]; then
            # Intenta abrir con iTerm2 o Terminal.app
            open -a Terminal "$BACKEND_PATH"
            sleep 1
            open -a Terminal "$FRONTEND_PATH"
            
            echo -e "${GREEN}✅ Terminales abiertas${NC}"
            echo -e "${YELLOW}En la primera terminal ejecuta: cd '$BACKEND_PATH' && npm run dev${NC}"
            echo -e "${YELLOW}En la segunda terminal ejecuta: cd '$FRONTEND_PATH' && npm run dev${NC}"
        fi
        ;;
    
    4)
        echo -e "${BLUE}📊 Ejecutando migraciones y seeders...${NC}"
        cd "$BACKEND_PATH"
        
        echo -e "${YELLOW}1. Aplicando migraciones...${NC}"
        npm run db:migrate
        
        echo ""
        echo -e "${YELLOW}2. Ejecutando seeders...${NC}"
        npm run db:seed:all
        
        echo ""
        echo -e "${GREEN}✅ Base de datos lista${NC}"
        
        echo ""
        read -p "¿Deseas iniciar el servidor ahora? (s/n): " start_server
        if [[ $start_server == "s" || $start_server == "S" ]]; then
            npm run dev
        fi
        ;;
    
    5)
        echo -e "${RED}🧹 LIMPIEZA COMPLETA${NC}"
        echo -e "${YELLOW}Esto hará:${NC}"
        echo "  1. Eliminar node_modules"
        echo "  2. Reinstalar dependencias"
        echo "  3. Ejecutar migraciones"
        echo "  4. Ejecutar seeders"
        echo ""
        read -p "¿Continuar? (s/n): " confirm
        
        if [[ $confirm == "s" || $confirm == "S" ]]; then
            cd "$BACKEND_PATH"
            
            echo -e "${YELLOW}Limpiando Backend...${NC}"
            rm -rf node_modules package-lock.json
            npm install
            
            echo ""
            echo -e "${YELLOW}Ejecutando migraciones...${NC}"
            npm run db:migrate
            
            echo ""
            echo -e "${YELLOW}Ejecutando seeders...${NC}"
            npm run db:seed:all
            
            echo ""
            cd "$FRONTEND_PATH"
            
            echo -e "${YELLOW}Limpiando Frontend...${NC}"
            rm -rf node_modules package-lock.json
            npm install
            
            echo ""
            echo -e "${GREEN}✅ Limpieza completada${NC}"
            echo -e "${BLUE}Ahora ejecuta: npm run dev en cada carpeta${NC}"
        else
            echo -e "${YELLOW}Limpieza cancelada${NC}"
        fi
        ;;
    
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ 📞 SOPORTE CORS                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Si tienes problemas de CORS:"
echo "1. Verifica que ambos servidores estén corriendo"
echo "2. Limpia cookies y caché del navegador (F12 > Storage > Clear All)"
echo "3. Lee: CORS-TROUBLESHOOTING.md"
echo ""
echo -e "${GREEN}¡Listo! 🚀${NC}"
