# Usar una imagen oficial de Node.js
FROM node:20-alpine

# Definir directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente de la aplicación
COPY . .

# Variables de entorno por defecto para entorno de prueba
ENV PORT=3000
ENV NODE_ENV=test
EXPOSE 3000

# Comando predeterminado: Ejecuta las pruebas automatizadas y finaliza mostrando el reporte
CMD ["npm", "test"]






