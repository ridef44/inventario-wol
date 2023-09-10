# Utiliza una imagen base de Node.js con Alpine Linux
FROM node:18.13.0-alpine

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install --only=prod

# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY src/ ./

# Expone el puerto en el que la aplicación va a escuchar
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
