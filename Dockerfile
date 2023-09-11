FROM node:18.13.0-alpine

# Instala Chromium
RUN apk add --no-cache chromium
# Crea un volumen para los datos de Puppeteer
VOLUME /var/lib/puppeteer

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install --production

# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY src/ ./

# Copia la carpeta public/ al contenedor Docker
COPY public/ ./public

# Expone el puerto en el que la aplicación va a escuchar
EXPOSE 4000

# Inicia el contenedor con las opciones de Puppeteer
CMD ["node", "app.js", "--privileged=true", "--ipc=host"]

# Crea un volumen para los archivos PDF
VOLUME /app/public/facturas