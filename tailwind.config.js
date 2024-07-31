/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/views/**/*.hbs',
  ],

  theme: {
    extend: {
     
      width: {
        '98': '25rem', 
      },
      margin: {
        '24': '6rem', 
      },
    },
  },
  plugins: [],
};


// npx tailwindcss -i ./public/style/input.css -o ./public/style/output.css --watch

